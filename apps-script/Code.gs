/**
 * Google Apps Script backend for the wedding card.
 *
 * Paste this into Extensions > Apps Script inside your Google Sheet.
 * First time: Deploy > New deployment > Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Updating existing deployment: Deploy > Manage deployments > (pencil) Edit
 *   > Version: New version > Deploy  (keeps the same URL).
 *
 * Tabs (created/updated automatically):
 *   RSVP:   Timestamp | Name | Attending | Pax | Group | Phone | Note | soft_deleted
 *   Wishes: Timestamp | Name | Message | Drawing
 *
 * Soft delete: the dashboard marks a row's soft_deleted cell "yes" and it
 * disappears from the dashboard. Clear that cell in the Sheet to restore.
 */

const RSVP_SHEET = "RSVP";
const WISHES_SHEET = "Wishes";
const RSVP_HEADERS = ["Timestamp", "Name", "Attending", "Pax", "Group", "Phone", "Note", "soft_deleted"];

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  // Keep the header row in sync (adds new columns like "Group" to old tabs)
  if (sheet.getLastColumn() < headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// GET ?type=wishes -> wishes (newest first, max 100)
// GET ?type=rsvps  -> all RSVP rows (for the dashboard)
function doGet(e) {
  if (e.parameter.type === "wishes") {
    const sheet = getSheet(WISHES_SHEET, ["Timestamp", "Name", "Message", "Drawing"]);
    const rows = sheet.getDataRange().getValues().slice(1); // skip header
    const wishes = rows
      .map(function (r) {
        return {
          timestamp: r[0],
          name: String(r[1]),
          message: String(r[2] || ""),
          drawing: String(r[3] || ""),
        };
      })
      .reverse()
      .slice(0, 100);
    return json({ ok: true, wishes: wishes });
  }

  if (e.parameter.type === "rsvps") {
    const sheet = getSheet(RSVP_SHEET, RSVP_HEADERS);
    const rows = sheet.getDataRange().getValues().slice(1);
    const rsvps = rows
      .map(function (r, i) {
        return {
          row: i + 2, // sheet row number, used for soft delete
          timestamp: r[0],
          name: String(r[1]),
          attending: String(r[2]),
          pax: Number(r[3]) || 0,
          group: String(r[4] || ""),
          phone: String(r[5] || ""),
          note: String(r[6] || ""),
          deleted: String(r[7] || "").toLowerCase() === "yes",
        };
      })
      .filter(function (x) { return !x.deleted; })
      .reverse();
    return json({ ok: true, rsvps: rsvps });
  }

  return json({ ok: true, message: "Wedding card API is running" });
}

// POST body (JSON): {type: "rsvp"|"wish", ...}
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || "").trim().slice(0, 80);
    if (!name) return json({ ok: false, error: "Name is required" });

    if (data.type === "deleteRsvp") {
      const sheet = getSheet(RSVP_SHEET, RSVP_HEADERS);
      const row = Number(data.row);
      if (!row || row < 2 || row > sheet.getLastRow()) {
        return json({ ok: false, error: "Invalid row" });
      }
      // Guard against stale dashboards: the name must still match that row
      if (String(sheet.getRange(row, 2).getValue()) !== name) {
        return json({ ok: false, error: "Row changed — refresh the dashboard and try again" });
      }
      sheet.getRange(row, 8).setValue("yes");
      return json({ ok: true });
    }

    if (data.type === "rsvp") {
      const sheet = getSheet(RSVP_SHEET, RSVP_HEADERS);
      const phone = String(data.phone || "").trim().slice(0, 20);
      sheet.appendRow([
        new Date(),
        name,
        data.attending === "yes" ? "Yes" : "No",
        Number(data.pax) || 0,
        String(data.group || "").slice(0, 20),
        // leading apostrophe keeps the number as text (no dropped 0 / E+11)
        phone ? "'" + phone : "",
        String(data.note || "").trim().slice(0, 120),
      ]);
      return json({ ok: true });
    }

    if (data.type === "wish") {
      const message = String(data.message || "").trim().slice(0, 500);
      let drawing = String(data.drawing || "");
      // only accept small PNG data URLs (fits a Sheets cell)
      if (drawing.indexOf("data:image/png;base64,") !== 0 || drawing.length > 49000) {
        drawing = "";
      }
      if (!message && !drawing) return json({ ok: false, error: "Message or drawing is required" });
      const sheet = getSheet(WISHES_SHEET, ["Timestamp", "Name", "Message", "Drawing"]);
      sheet.appendRow([new Date(), name, message, drawing]);
      return json({ ok: true });
    }

    return json({ ok: false, error: "Unknown type" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}
