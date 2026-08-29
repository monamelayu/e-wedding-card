/**
 * Google Apps Script backend for the wedding card.
 *
 * Paste this into Extensions > Apps Script inside your Google Sheet,
 * then Deploy > New deployment > Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Copy the Web App URL into js/config.js (appsScriptUrl).
 *
 * Creates two tabs automatically on first submission:
 *   RSVP:   Timestamp | Name | Attending | Pax
 *   Wishes: Timestamp | Name | Message
 */

const RSVP_SHEET = "RSVP";
const WISHES_SHEET = "Wishes";

function getSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// GET  ?type=wishes  -> list of wishes (newest first, max 100)
function doGet(e) {
  if (e.parameter.type === "wishes") {
    const sheet = getSheet(WISHES_SHEET, ["Timestamp", "Name", "Message"]);
    const rows = sheet.getDataRange().getValues().slice(1); // skip header
    const wishes = rows
      .map(function (r) {
        return { timestamp: r[0], name: String(r[1]), message: String(r[2]) };
      })
      .reverse()
      .slice(0, 100);
    return json({ ok: true, wishes: wishes });
  }
  return json({ ok: true, message: "Wedding card API is running" });
}

// POST body (JSON): {type: "rsvp"|"wish", ...}
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || "").trim().slice(0, 80);
    if (!name) return json({ ok: false, error: "Name is required" });

    if (data.type === "rsvp") {
      const sheet = getSheet(RSVP_SHEET, ["Timestamp", "Name", "Attending", "Pax"]);
      sheet.appendRow([
        new Date(),
        name,
        data.attending === "yes" ? "Yes" : "No",
        Number(data.pax) || 0,
      ]);
      return json({ ok: true });
    }

    if (data.type === "wish") {
      const message = String(data.message || "").trim().slice(0, 500);
      if (!message) return json({ ok: false, error: "Message is required" });
      const sheet = getSheet(WISHES_SHEET, ["Timestamp", "Name", "Message"]);
      sheet.appendRow([new Date(), name, message]);
      return json({ ok: true });
    }

    return json({ ok: false, error: "Unknown type" });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}
