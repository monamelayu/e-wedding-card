/* Wedding card logic: i18n, cover, countdown, tentative, RSVP + wishes
   backed by Google Sheets via Apps Script (demo mode when no URL set). */

const C = WEDDING_CONFIG;

// ---------------- i18n ----------------
const I18N = {
  bm: {
    coverEyebrow: "Walimatul Urus",
    openBtn: "Buka Jemputan",
    withJoy: "Dengan penuh kesyukuran, kami",
    inviteText: "menjemput Dato' / Datin / Tuan / Puan / Encik / Cik ke majlis perkahwinan anakanda kami",
    detailsTitle: "Butiran Majlis",
    dateLabel: "Tarikh",
    timeLabel: "Masa",
    venueLabel: "Tempat",
    calendarBtn: "Simpan Tarikh",
    countdownTitle: "Menghitung Hari",
    cdDays: "Hari", cdHours: "Jam", cdMins: "Minit", cdSecs: "Saat",
    countdownDone: "Alhamdulillah, hari yang dinanti telah tiba!",
    tentativeTitle: "Aturcara Majlis",
    rsvpIntro: "Sila sahkan kehadiran anda sebelum tarikh majlis.",
    rsvpName: "Nama",
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
    calendarBtn: "Save the Date",
    countdownTitle: "Counting Down",
    cdDays: "Days", cdHours: "Hours", cdMins: "Minutes", cdSecs: "Seconds",
    countdownDone: "Alhamdulillah, the awaited day has arrived!",
    tentativeTitle: "Programme",
    rsvpIntro: "Kindly confirm your attendance before the event date.",
    rsvpName: "Name",
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
  document.getElementById("lang-bm").classList.toggle("active", lang === "bm");
  document.getElementById("lang-en").classList.toggle("active", lang === "en");
  // Language-dependent config strings
  document.getElementById("cover-date").textContent = C.dateDisplay[lang];
  document.getElementById("event-date").textContent = C.dateDisplay[lang];
  document.getElementById("event-time").textContent = C.timeDisplay[lang];
  renderTentative();
  renderContacts();
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
  document.getElementById("venue-name").textContent = C.venueName;
  document.getElementById("venue-address").textContent = C.venueAddress;
  document.getElementById("maps-btn").href = C.googleMapsUrl;
  document.getElementById("waze-btn").href = C.wazeUrl;
  document.getElementById("footer-names").textContent = `${C.groomName} & ${C.brideName}`;
  document.title = `Walimatul Urus · ${C.groomName} & ${C.brideName}`;

  // Google Calendar link
  const fmt = (iso) => iso.replace(/[-:]/g, "").replace(/\.\d+/, "");
  const calUrl = new URL("https://calendar.google.com/calendar/render");
  calUrl.searchParams.set("action", "TEMPLATE");
  calUrl.searchParams.set("text", `Walimatul Urus ${C.groomName} & ${C.brideName}`);
  calUrl.searchParams.set("dates", `${fmt(C.eventStartISO)}/${fmt(C.eventEndISO)}`);
  calUrl.searchParams.set("location", `${C.venueName}, ${C.venueAddress}`);
  document.getElementById("calendar-btn").href = calUrl.toString();

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
    const name = document.createElement("span");
    name.textContent = c.name;
    const role = document.createElement("span");
    role.className = "c-role";
    role.textContent = c.role[lang];
    a.append(name, role);
    wrap.appendChild(a);
  });
}

// ---------------- Cover ----------------
document.getElementById("open-btn").addEventListener("click", () => {
  document.getElementById("cover").classList.add("closed");
  const card = document.getElementById("card");
  card.hidden = false;
  requestAnimationFrame(revealSections);
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

async function apiGetWishes() {
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
      attending,
      pax: attending === "yes" ? Number(fd.get("pax")) : 0,
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
function renderWishes(wishes) {
  const list = document.getElementById("wishes-list");
  list.innerHTML = "";
  if (!wishes.length) {
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = t("noWishes");
    list.appendChild(p);
    return;
  }
  wishes.forEach((w) => {
    const div = document.createElement("div");
    div.className = "wish";
    const name = document.createElement("p");
    name.className = "w-name";
    name.textContent = w.name;
    const msg = document.createElement("p");
    msg.className = "w-msg";
    msg.textContent = w.message;
    div.append(name, msg);
    list.appendChild(div);
  });
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

// ---------------- Language buttons ----------------
document.getElementById("lang-bm").addEventListener("click", () => setLang("bm"));
document.getElementById("lang-en").addEventListener("click", () => setLang("en"));

// ---------------- Init ----------------
fillStatic();
applyLang();
startCountdown();
loadWishes();
