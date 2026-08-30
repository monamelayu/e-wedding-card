/* Wedding card logic: i18n, cover, countdown, tentative, RSVP + wishes
   backed by Google Sheets via Apps Script (demo mode when no URL set). */

const C = WEDDING_CONFIG;

// Invitation group from the URL path (/gi, /br, ...), "" if none
const GROUP = (() => {
  const seg = (location.pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
  return C.groups && C.groups[seg] ? seg : "";
})();

// ---------------- i18n ----------------
const I18N = {
  bm: {
    coverEyebrow: "Walimatul Urus",
    openBtn: "Buka Jemputan",
    withJoy: "Dengan penuh kesyukuran, kami",
    inviteText: "menjemput Tan Sri / Puan Sri / Datuk / Dato' / Datin / Tuan / Puan / Encik / Cik ke majlis perkahwinan anakanda kami",
    detailsTitle: "Butiran Majlis",
    dateLabel: "Tarikh",
    timeLabel: "Masa",
    venueLabel: "Tempat",
    calendarBtn: "Google Calendar",
    appleCalBtn: "Apple Calendar",
    countdownTitle: "Menghitung Hari",
    cdDays: "Hari", cdHours: "Jam", cdMins: "Minit", cdSecs: "Saat",
    countdownDone: "Alhamdulillah, hari yang dinanti telah tiba!",
    tentativeTitle: "Aturcara Majlis",
    rsvpIntro: "Sila sahkan kehadiran anda sebelum tarikh majlis.",
    rsvpName: "Nama",
    rsvpPhone: "No. Telefon (pilihan)",
    rsvpNote: "Nota (pilihan)",
    rsvpNotePh: "cth. AirAsia, Maybank, BNM",
    rsvpAttend: "Kehadiran",
    rsvpYes: "Hadir",
    rsvpNo: "Tidak hadir",
    rsvpPax: "Bilangan tetamu (pax)",
    rsvpSubmit: "Hantar RSVP",
    rsvpSending: "Menghantar...",
    rsvpOk: "Terima kasih! RSVP anda telah diterima.",
    rsvpErr: "Maaf, berlaku ralat. Sila cuba lagi.",
    wishesTitle: "Ucapan & Doa",
    wishMsg: "Ucapan",
    wishSubmit: "Hantar Ucapan",
    wishOk: "Terima kasih atas ucapan anda!",
    noWishes: "Jadilah yang pertama memberi ucapan!",
    expandWishes: "Lihat ucapan terapung",
    expandHint: "Tekan untuk ucapan terapung ✨",
    viewList: "Senarai",
    viewBubbles: "Buih",
    closeWishes: "Tutup",
    musicPlay: "Mainkan muzik",
    musicPause: "Hentikan muzik",
    contactTitle: "Hubungi Kami",
    footerThanks: "Terima kasih atas doa dan kehadiran anda",
    demoNote: "(Mod demo: belum disambung ke Google Sheet)",
  },
  en: {
    coverEyebrow: "Wedding Invitation",
    openBtn: "Open Invitation",
    withJoy: "With hearts full of gratitude, we",
    inviteText: "cordially invite you to the wedding celebration of our beloved children",
    detailsTitle: "Event Details",
    dateLabel: "Date",
    timeLabel: "Time",
    venueLabel: "Venue",
    calendarBtn: "Google Calendar",
    appleCalBtn: "Apple Calendar",
    countdownTitle: "Counting Down",
    cdDays: "Days", cdHours: "Hours", cdMins: "Minutes", cdSecs: "Seconds",
    countdownDone: "Alhamdulillah, the awaited day has arrived!",
    tentativeTitle: "Programme",
    rsvpIntro: "Kindly confirm your attendance before the event date.",
    rsvpName: "Name",
    rsvpPhone: "Phone Number (optional)",
    rsvpNote: "Note (optional)",
    rsvpNotePh: "e.g. AirAsia, Maybank, BNM",
    rsvpAttend: "Attendance",
    rsvpYes: "Attending",
    rsvpNo: "Not attending",
    rsvpPax: "Number of guests (pax)",
    rsvpSubmit: "Send RSVP",
    rsvpSending: "Sending...",
    rsvpOk: "Thank you! Your RSVP has been received.",
    rsvpErr: "Sorry, something went wrong. Please try again.",
    wishesTitle: "Wishes & Prayers",
    wishMsg: "Your wish",
    wishSubmit: "Send Wish",
    wishOk: "Thank you for your kind words!",
    noWishes: "Be the first to leave a wish!",
    expandWishes: "See floating wishes",
    expandHint: "Tap for floating wishes ✨",
    viewList: "List",
    viewBubbles: "Bubbles",
    closeWishes: "Close",
    musicPlay: "Play music",
    musicPause: "Pause music",
    contactTitle: "Contact Us",
    footerThanks: "Thank you for your prayers and presence",
    demoNote: "(Demo mode: not yet connected to Google Sheet)",
  },
};

let lang = localStorage.getItem("wedding-lang") || "bm";
const t = (key) => I18N[lang][key] || I18N.bm[key] || key;

function applyLang() {
  document.documentElement.lang = lang === "bm" ? "ms" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-ph]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPh);
  });
  document.getElementById("lang-bm").classList.toggle("active", lang === "bm");
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  // Language-dependent config strings
  document.getElementById("cover-date").textContent = C.dateDisplay[lang];
  document.getElementById("event-date").textContent = C.dateDisplay[lang];
  document.getElementById("event-time").textContent = C.timeDisplay[lang];
  renderTentative();
  renderContacts();
  updateWoLabels();
}

function setLang(next) {
  lang = next;
  localStorage.setItem("wedding-lang", lang);
  applyLang();
}

// ---------------- Static content from config ----------------
function fillStatic() {
  document.getElementById("cover-groom").textContent = C.groomName;
  document.getElementById("cover-bride").textContent = C.brideName;
  document.getElementById("groom-full").textContent = C.groomFullName;
  document.getElementById("bride-full").textContent = C.brideFullName;
  document.getElementById("host-line1").textContent = C.hostLine1;
  const h2 = document.getElementById("host-line2");
  h2.textContent = C.hostLine2;
  h2.hidden = !C.hostLine2;
  document.getElementById("host-amp").hidden = !C.hostLine2;
  if (C.groomImage && C.brideImage) {
    document.getElementById("groom-img").src = C.groomImage;
    document.getElementById("bride-img").src = C.brideImage;
    document.getElementById("couple-portraits").hidden = false;
  }
  document.getElementById("venue-name").textContent = C.venueName;
  document.getElementById("venue-address").textContent = C.venueAddress;
  document.getElementById("maps-btn").href = C.googleMapsUrl;
  document.getElementById("waze-btn").href = C.wazeUrl;
  document.getElementById("footer-names").textContent = `${C.groomName} & ${C.brideName}`;
  document.title = `Walimatul Urus · ${C.groomName} & ${C.brideName}`;

  // Google Calendar link
  const fmt = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d+/, "");
  // Title structure: hosts first, then the couple
  const calTitle = C.calendarTitle ||
    `Walimatul Urus ${C.hostLine1}${C.hostLine2 ? " & " + C.hostLine2 : ""} · ${C.groomName} & ${C.brideName}`;
  const calUrl = new URL("https://calendar.google.com/calendar/render");
  calUrl.searchParams.set("action", "TEMPLATE");
  calUrl.searchParams.set("text", calTitle);
  calUrl.searchParams.set("dates", `${fmt(C.eventStartISO)}/${fmt(C.eventEndISO)}`);
  calUrl.searchParams.set("location", `${C.venueName}, ${C.venueAddress}`);
  document.getElementById("calendar-btn").href = calUrl.toString();

  // Apple Calendar: served as a real .ics file (walimatul-urus.ics in the
  // repo root) so iPhones open it straight into the Add Event sheet.
  // NOTE: if the event date/venue/title changes in this config, update
  // walimatul-urus.ics to match.

  // Pax dropdown
  const paxSel = document.getElementById("pax-select");
  for (let i = 1; i <= C.maxPax; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    paxSel.appendChild(opt);
  }
}

function renderTentative() {
  const section = document.getElementById("tentative-section");
  const list = document.getElementById("tentative-list");
  if (!C.tentative.length) { section.hidden = true; return; }
  list.innerHTML = "";
  C.tentative.forEach((item) => {
    const li = document.createElement("li");
    const time = document.createElement("span");
    time.className = "t-time";
    time.textContent = item.time;
    const label = document.createElement("span");
    label.textContent = item.label[lang];
    li.append(time, label);
    list.appendChild(li);
  });
}

function renderContacts() {
  const wrap = document.getElementById("contact-list");
  wrap.innerHTML = "";
  C.contacts.forEach((c) => {
    const a = document.createElement("a");
    a.className = "btn btn-outline";
    a.href = `https://wa.me/${c.phone}`;
    a.target = "_blank";
    a.rel = "noopener";
    a.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>';
    const txt = document.createElement("span");
    txt.className = "c-text";
    const name = document.createElement("span");
    name.textContent = c.name;
    const role = document.createElement("span");
    role.className = "c-role";
    role.textContent = c.role[lang];
    txt.append(name, role);
    a.append(txt);
    wrap.appendChild(a);
  });
}

// ---------------- Background music ----------------
const music = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");
if (C.musicSrc) {
  music.src = C.musicSrc;
  music.volume = 0.35;
}

function updateMusicUI() {
  const playing = !music.paused;
  musicBtn.classList.toggle("playing", playing);
  document.getElementById("music-on-icon").hidden = !playing;
  document.getElementById("music-off-icon").hidden = playing;
  musicBtn.setAttribute("aria-label", playing ? t("musicPause") : t("musicPlay"));
  musicBtn.title = playing ? t("musicPause") : t("musicPlay");
}

music.addEventListener("play", updateMusicUI);
music.addEventListener("pause", updateMusicUI);
let musicUserPaused = false;
musicBtn.addEventListener("click", () => {
  if (music.paused) {
    musicUserPaused = false;
    music.play().catch(() => {});
  } else {
    musicUserPaused = true;
    music.pause();
  }
});

// Start on the landing page. Browsers may block autoplay before the
// first interaction; if so, start at the guest's first tap anywhere.
function startMusicEarly() {
  if (!C.musicSrc) return;
  musicBtn.hidden = false;
  updateMusicUI();
  music.play().catch(() => {
    const start = (e) => {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
      if (musicBtn.contains(e.target)) return; // button's own handler decides
      if (music.paused && !musicUserPaused) music.play().catch(() => {});
    };
    document.addEventListener("pointerdown", start);
    document.addEventListener("keydown", start);
  });
}

// ---------------- Cover ----------------
document.getElementById("open-btn").addEventListener("click", () => {
  document.getElementById("cover").classList.add("closed");
  const card = document.getElementById("card");
  card.hidden = false;
  requestAnimationFrame(revealSections);
  if (C.musicSrc && music.paused && !musicUserPaused) music.play().catch(() => {});
});

// Scroll-reveal for sections
function revealSections() {
  const obs = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".section").forEach((s) => obs.observe(s));
}

// ---------------- Countdown ----------------
function startCountdown() {
  const target = new Date(C.eventStartISO).getTime();
  const els = {
    d: document.getElementById("cd-days"),
    h: document.getElementById("cd-hours"),
    m: document.getElementById("cd-mins"),
    s: document.getElementById("cd-secs"),
  };
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      document.getElementById("countdown").hidden = true;
      document.getElementById("countdown-done").hidden = false;
      clearInterval(timer);
      return;
    }
    els.d.textContent = Math.floor(diff / 86400000);
    els.h.textContent = Math.floor(diff / 3600000) % 24;
    els.m.textContent = Math.floor(diff / 60000) % 60;
    els.s.textContent = Math.floor(diff / 1000) % 60;
  };
  tick();
  const timer = setInterval(tick, 1000);
}

// ---------------- Backend (Google Sheets via Apps Script) ----------------
const DEMO = !C.appsScriptUrl;

async function apiPost(payload) {
  if (DEMO) {
    // Demo mode: keep data in this browser only
    const key = `demo-${payload.type}`;
    const arr = JSON.parse(localStorage.getItem(key) || "[]");
    arr.unshift({ ...payload, timestamp: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(arr));
    return { ok: true };
  }
  // No custom headers -> "simple request", avoids CORS preflight
  // (Apps Script web apps reject preflighted requests).
  const res = await fetch(C.appsScriptUrl, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.json();
}

// Preview aid: open index.html?sample to see the list filled without
// touching the real backend.
const SAMPLE_WISHES = [
  { name: "Aiman & Syafiqah", message: "Tahniah Nuqman & Alya! Semoga berbahagia hingga ke Jannah. ❤️" },
  { name: "Pak Long", message: "Selamat pengantin baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah." },
  { name: "Farah", message: "Congratulations to both of you! Wishing you a lifetime of love and laughter." },
  { name: "Hakim", message: "Alhamdulillah, akhirnya! Tahniah bro, semoga kekal bahagia selamanya." },
  { name: "Mak Cik Ros", message: "Semoga Allah permudahkan segala urusan kalian berdua. Tahniah!" },
  { name: "Danish & Aina", message: "Barakallahu lakuma wa baraka 'alaikuma. Semoga bahagia selalu!" },
  { name: "Izzati", message: "So happy for you both! May your marriage be filled with barakah." },
  { name: "Firdaus", message: "Tahniah! Jaga Alya baik-baik ye. Semoga rumah tangga dirahmati Allah." },
  { name: "Nurul", message: "Congrats! Semoga cepat dapat anak yang comel macam mak ayah dia. 😄" },
  { name: "Keluarga Abd Rahim", message: "Selamat menempuh hidup baru. Doa kami sentiasa bersama kalian." },
];

async function apiGetWishes() {
  if (new URLSearchParams(location.search).has("sample")) {
    return SAMPLE_WISHES;
  }
  if (DEMO) {
    return JSON.parse(localStorage.getItem("demo-wish") || "[]");
  }
  const res = await fetch(`${C.appsScriptUrl}?type=wishes`);
  const data = await res.json();
  return data.wishes || [];
}

// ---------------- RSVP form ----------------
const rsvpForm = document.getElementById("rsvp-form");
rsvpForm.querySelector('[name="attending"]').addEventListener("change", (e) => {
  document.getElementById("pax-field").style.display = e.target.value === "no" ? "none" : "";
});

rsvpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("rsvp-status");
  const btn = rsvpForm.querySelector("button");
  const fd = new FormData(rsvpForm);
  const attending = fd.get("attending");
  btn.disabled = true;
  status.className = "form-status";
  status.textContent = t("rsvpSending");
  try {
    await apiPost({
      type: "rsvp",
      name: fd.get("name").trim(),
      phone: fd.get("phone").trim(),
      attending,
      pax: attending === "yes" ? Number(fd.get("pax")) : 0,
      note: fd.get("note").trim(),
      group: GROUP,
    });
    status.className = "form-status ok";
    status.textContent = t("rsvpOk") + (DEMO ? " " + t("demoNote") : "");
    rsvpForm.reset();
    document.getElementById("pax-field").style.display = "";
  } catch {
    status.className = "form-status err";
    status.textContent = t("rsvpErr");
  } finally {
    btn.disabled = false;
  }
});

// ---------------- Wishes ----------------
function makeWishCard(w) {
  const div = document.createElement("div");
  div.className = "wish";
  const name = document.createElement("p");
  name.className = "w-name";
  name.textContent = w.name;
  const msg = document.createElement("p");
  msg.className = "w-msg";
  msg.textContent = w.message;
  div.append(name, msg);
  return div;
}

function renderWishes(wishes) {
  allWishes = wishes;
  const list = document.getElementById("wishes-list");
  list.innerHTML = "";
  list.classList.toggle("scrollable", wishes.length >= 5);
  document.getElementById("wishes-expand").hidden = !wishes.length;
  document.getElementById("expand-hint").hidden = !wishes.length || hintDismissed;
  if (!wishes.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = t("noWishes");
    list.appendChild(p);
    return;
  }
  wishes.forEach((w) => list.appendChild(makeWishCard(w)));
}

async function loadWishes() {
  try {
    renderWishes(await apiGetWishes());
  } catch {
    /* keep whatever is shown */
  }
}

document.getElementById("wish-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = document.getElementById("wish-status");
  const btn = form.querySelector("button");
  const fd = new FormData(form);
  btn.disabled = true;
  status.className = "form-status";
  status.textContent = t("rsvpSending");
  try {
    await apiPost({
      type: "wish",
      name: fd.get("name").trim(),
      message: fd.get("message").trim(),
    });
    status.className = "form-status ok";
    status.textContent = t("wishOk") + (DEMO ? " " + t("demoNote") : "");
    form.reset();
    loadWishes();
  } catch {
    status.className = "form-status err";
    status.textContent = t("rsvpErr");
  } finally {
    btn.disabled = false;
  }
});

// ---------------- Wish bubbles overlay ----------------
let allWishes = [];
let hintDismissed = false;
const woEl = document.getElementById("wish-overlay");
const woBubbles = document.getElementById("wo-bubbles");
const woList = document.getElementById("wo-list");
const woDetail = document.getElementById("wo-detail");
const woToggle = document.getElementById("wo-toggle");
const woExpandBtn = document.getElementById("wishes-expand");
const WO = { open: false, list: false, idx: 0, timer: null };

function updateWoLabels() {
  woExpandBtn.setAttribute("aria-label", t("expandWishes"));
  woExpandBtn.title = t("expandWishes");
  woToggle.textContent = WO.list ? t("viewBubbles") : t("viewList");
  document.getElementById("wo-close").setAttribute("aria-label", t("closeWishes"));
}

function spawnBubble() {
  const w = allWishes[WO.idx % allWishes.length];
  WO.idx++;
  const b = document.createElement("button");
  b.type = "button";
  b.className = "bubble";
  const size = Math.round(100 + Math.random() * 55);
  b.style.width = `${size}px`;
  b.style.height = `${size}px`;
  const maxLeft = Math.max(8, window.innerWidth - size - 8);
  b.style.left = `${Math.round(8 + Math.random() * (maxLeft - 8))}px`;
  b.style.setProperty("--sway", `${Math.round(Math.random() * 60 - 30)}px`);
  b.style.animationDuration = `${(9 + Math.random() * 6).toFixed(1)}s`;
  const core = document.createElement("span");
  core.className = "b-core";
  const name = document.createElement("span");
  name.className = "b-name";
  name.textContent = w.name;
  const snip = document.createElement("span");
  snip.className = "b-snippet";
  snip.textContent = w.message;
  core.append(name, snip);
  b.appendChild(core);
  b.addEventListener("click", () => showWishDetail(w));
  b.addEventListener("animationend", (e) => {
    if (e.target !== b) return; // ignore the core's pop animation
    b.remove();
    if (WO.open && !WO.list) spawnBubble();
  });
  woBubbles.appendChild(b);
}

function startBubbles() {
  const count = Math.min(8, Math.max(3, allWishes.length));
  let spawned = 1;
  spawnBubble();
  WO.timer = setInterval(() => {
    if (!WO.open || WO.list || spawned >= count) {
      clearInterval(WO.timer);
      WO.timer = null;
      return;
    }
    spawnBubble();
    spawned++;
  }, 800);
}

function popBubbles(done) {
  if (WO.timer) { clearInterval(WO.timer); WO.timer = null; }
  const bs = [...woBubbles.children];
  bs.forEach((b, i) => setTimeout(() => b.classList.add("pop"), i * 70));
  setTimeout(() => {
    woBubbles.innerHTML = "";
    if (done) done();
  }, bs.length * 70 + 320);
}

function buildOverlayList() {
  woList.innerHTML = "";
  allWishes.forEach((w) => woList.appendChild(makeWishCard(w)));
}

function showWishDetail(w) {
  document.getElementById("wo-detail-name").textContent = w.name;
  document.getElementById("wo-detail-msg").textContent = w.message;
  woDetail.hidden = false;
}

function openWishOverlay() {
  if (!allWishes.length) return;
  hintDismissed = true; // the hint has done its job
  document.getElementById("expand-hint").hidden = true;
  WO.open = true;
  WO.list = false;
  WO.idx = 0;
  buildOverlayList();
  woList.hidden = true;
  woDetail.hidden = true;
  woEl.hidden = false;
  requestAnimationFrame(() => woEl.classList.add("open"));
  document.getElementById("card").classList.add("dimmed");
  document.body.classList.add("no-scroll");
  updateWoLabels();
  startBubbles();
}

function closeWishOverlay() {
  WO.open = false;
  woDetail.hidden = true;
  popBubbles(() => {
    woEl.classList.remove("open");
    document.getElementById("card").classList.remove("dimmed");
    document.body.classList.remove("no-scroll");
    setTimeout(() => { woEl.hidden = true; }, 350);
  });
}

woExpandBtn.addEventListener("click", openWishOverlay);
document.getElementById("wo-close").addEventListener("click", closeWishOverlay);
woToggle.addEventListener("click", () => {
  WO.list = !WO.list;
  updateWoLabels();
  if (WO.list) {
    popBubbles();
    woList.hidden = false;
  } else {
    woList.hidden = true;
    startBubbles();
  }
});
woDetail.addEventListener("click", () => { woDetail.hidden = true; });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && WO.open) closeWishOverlay();
});

// ---------------- Language buttons ----------------
document.getElementById("lang-bm").addEventListener("click", () => setLang("bm"));
document.getElementById("lang-en").addEventListener("click", () => setLang("en"));

// ---------------- Init ----------------
fillStatic();
applyLang();
startCountdown();
loadWishes();
startMusicEarly();
