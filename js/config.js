// ============================================================
//  EDIT THIS FILE ONLY — all wedding details live here.
//  Everything marked [PLACEHOLDER] must be replaced.
// ============================================================

const WEDDING_CONFIG = {
  // --- Couple ---------------------------------------------------
  groomName: "Nuqman",                    // [PLACEHOLDER] short name shown on cover
  brideName: "Alya",                    // [PLACEHOLDER]
  groomFullName: "Khairunuqman bin Zainal 'Abidin",   // [PLACEHOLDER]
  brideFullName: "Nur Alya Qistina binti Abd Rahim",      // [PLACEHOLDER]

  // --- Hosts (parents), shown in the invitation text ------------
  hostLine1: "Zainal 'Abidin bin Mohd Jais", // [PLACEHOLDER] groom's father
  hostLine2: "Morly binti Mohammed",         // [PLACEHOLDER] groom's mother

  // --- Event ----------------------------------------------------
  // Date/time in ISO format (local time). Used for countdown + calendar.
  eventStartISO: "2026-10-03T11:00:00",   // [PLACEHOLDER]
  eventEndISO: "2026-10-03T16:00:00",     // [PLACEHOLDER]
  dateDisplay: { bm: "Sabtu, 03 Oktober 2026", en: "Saturday, 03 October 2026" }, // [PLACEHOLDER]
  timeDisplay: { bm: "11:00 pagi – 4:00 petang", en: "11:00 AM – 4:00 PM" },        // [PLACEHOLDER]

  venueName: "Mimosa by Lanai Asmara",
  venueAddress: "L1-03, Level 1, Shaftsbury Putrajaya, Jalan Alamanda, Presint 1, 62000 Putrajaya, Wilayah Persekutuan Putrajaya",
  // Paste full share links from Google Maps / Waze:
  googleMapsUrl: "https://maps.google.com/?q=Mimosa+by+Lanai+Asmara+Shaftsbury+Putrajaya",
  wazeUrl: "https://waze.com/ul?q=Mimosa+by+Lanai+Asmara+Putrajaya",

  // --- Tentative programme (leave array empty to hide section) ---
  tentative: [
    { time: "11:00", label: { bm: "Ketibaan tetamu", en: "Arrival of guests" } },
    { time: "12:30", label: { bm: "Ketibaan pengantin", en: "Arrival of the couple" } },
    { time: "13:00", label: { bm: "Makan beradab", en: "Dining ceremony" } },
    { time: "16:00", label: { bm: "Majlis berakhir", en: "End of ceremony" } },
  ],

  // --- Background music (path to an mp3, "" to disable) ---------
  musicSrc: "music/where_the_wind_blows_instrumental.mp3",

  // --- Contacts (WhatsApp). Number in international format, no "+" ---
  contacts: [
    { name: "Zainal 'Abidin", role: { bm: "Bapa Pengantin Lelaki", en: "Father of the Groom" }, phone: "60123111999" },   // [PLACEHOLDER]
    { name: "Khairuzaquan", role: { bm: "Adik Pengantin Lelaki", en: "Brother of the Groom" }, phone: "60198765432" }, // [PLACEHOLDER]
  ],

  // --- Google Sheets backend ------------------------------------
  // Paste your Apps Script Web App URL here after deploying it
  // (see README.md, section "Google Sheet setup"). Leave "" to
  // run in demo mode (RSVP/wishes stored in the browser only).
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbzk5IXYMDzwNs8GnAoDz-lj2eFvzGenvnk0LZPWYT27pkoJaqsCP2GBx088MwJ81WUv/exec",

  // Max pax a guest can bring (dropdown in RSVP form)
  maxPax: 2,

  // --- Invitation groups ----------------------------------------
  // Share group-specific links so RSVPs are tagged by who invited
  // the guest, e.g. https://<your-site>/gi for the groom's guests.
  // The key is the URL path; the label appears in the dashboard.
  groups: {
    gi: "Nuqman (Groom)",
    br: "Alya (Bride)",
    zj: "Zainal 'Abidin (Father)",
    mm: "Morly (Mother)",
    sb: "Siblings",
  },
};
