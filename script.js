(() => {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Config — swap these for the real clinic before launch
   * ------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = "919840012345"; // country code + number, digits only
  const FRAME_COUNT = 192;
  const framePath = (i) => `frames/frame-${String(i + 1).padStart(4, "0")}.webp`;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

  /* ------------------------------------------------------------------ *
   * Data
   * ------------------------------------------------------------------ */
  const ICONS = {
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 12h8"/>',
    root: '<path d="M8 3c-2.2 0-3.5 1.7-3.5 4 0 3 1.7 4.5 2.3 8 .4 2.8.9 6 2.2 6 1.6 0 1.3-5 3-5s1.4 5 3 5c1.3 0 1.8-3.2 2.2-6 .6-3.5 2.3-5 2.3-8 0-2.3-1.3-4-3.5-4-1.7 0-2.6 1-4 1S9.7 3 8 3Z"/><path d="M12 7v7"/>',
    fill: '<path d="M8 3c-2.2 0-3.5 1.7-3.5 4 0 3 1.7 4.5 2.3 8 .4 2.8.9 6 2.2 6 1.6 0 1.3-5 3-5s1.4 5 3 5c1.3 0 1.8-3.2 2.2-6 .6-3.5 2.3-5 2.3-8 0-2.3-1.3-4-3.5-4-1.7 0-2.6 1-4 1S9.7 3 8 3Z"/><circle cx="12" cy="9" r="2"/>',
    gum: '<path d="M3 9c3 2 6 3 9 3s6-1 9-3"/><path d="M6 11v4a2 2 0 0 0 4 0v-3M14 12v3a2 2 0 0 0 4 0v-4"/>',
    crown: '<path d="M4 9l3 3 5-6 5 6 3-3-2 10H6L4 9Z"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c1 1.5 2.3 2.2 4 2.2s3-.7 4-2.2M9 9.5h.01M15 9.5h.01"/>',
    aligner: '<path d="M3 10c0-2 2-4 4.5-4h9C19 6 21 8 21 10c0 4-4 8-9 8s-9-4-9-8Z"/><path d="M7 10h10"/>',
    braces: '<path d="M3 12h18"/><rect x="5" y="9" width="3" height="6" rx="1"/><rect x="10.5" y="9" width="3" height="6" rx="1"/><rect x="16" y="9" width="3" height="6" rx="1"/>',
    implant: '<path d="M8 3h8l-1 5H9L8 3Z"/><path d="M9 8h6M10 11h4M10 14h4M11 17h2M12 17v4"/>',
    wisdom: '<path d="M8 3c-2.2 0-3.5 1.7-3.5 4 0 3 1.7 4.5 2.3 8 .4 2.8.9 6 2.2 6 1.6 0 1.3-5 3-5s1.4 5 3 5c1.3 0 1.8-3.2 2.2-6 .6-3.5 2.3-5 2.3-8 0-2.3-1.3-4-3.5-4-1.7 0-2.6 1-4 1S9.7 3 8 3Z"/><path d="M17 2l4 4"/>',
    kids: '<circle cx="12" cy="8" r="4"/><path d="M5 21c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/><path d="M10.5 8h.01M13.5 8h.01"/>'
  };
  const icon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

  // Service mix drawn from what Chennai's top chains and independent clinics lead with,
  // plus the gaps patients complain about (sittings, transparency, warranty).
  const SERVICES = [
    { cat: "general", label: "General", icon: "scan", name: "Check-up & cleaning", desc: "Full exam, ultrasonic scaling and polishing with an intraoral camera tour of your teeth.", price: 799, dur: "45 min", tag: "Digital X-ray incl." },
    { cat: "general", label: "General", icon: "root", name: "Single-sitting root canal", desc: "Rotary endodontics with apex locator and local anaesthesia. Most cases finish in one visit.", price: 4500, dur: "60–90 min", tag: "Painless" },
    { cat: "general", label: "General", icon: "fill", name: "Tooth-coloured fillings", desc: "Light-cured composite fillings shade-matched to your enamel. No silver, no mercury.", price: 1200, dur: "30 min" },
    { cat: "general", label: "General", icon: "gum", name: "Gum & laser treatment", desc: "Deep cleaning, laser gum therapy and treatment for bleeding gums and bad breath.", price: 2500, dur: "45 min" },
    { cat: "cosmetic", label: "Cosmetic", icon: "spark", name: "Teeth whitening", desc: "In-clinic whitening that lifts several shades in one session, with sensitivity care.", price: 7999, dur: "60 min" },
    { cat: "cosmetic", label: "Cosmetic", icon: "smile", name: "Veneers & smile makeover", desc: "Digital smile design lets you preview the result on your own face before we begin.", price: 12000, unit: "/tooth", dur: "2–3 visits", tag: "Preview first" },
    { cat: "cosmetic", label: "Cosmetic", icon: "crown", name: "Crowns & bridges", desc: "Zirconia and E.max crowns milled for a natural fit, to restore broken or missing teeth.", price: 9000, unit: "/crown", dur: "2 visits" },
    { cat: "ortho", label: "Orthodontics", icon: "aligner", name: "Clear aligners", desc: "Near-invisible aligners planned on a 3D scan. See your final smile before you start.", price: 65000, dur: "6–18 months", tag: "3D plan" },
    { cat: "ortho", label: "Orthodontics", icon: "braces", name: "Braces", desc: "Metal, ceramic and self-ligating braces for teens and adults, with monthly reviews.", price: 30000, dur: "12–24 months" },
    { cat: "surgical", label: "Surgical", icon: "implant", name: "Dental implants", desc: "Titanium implants planned on 3D CBCT, plus implant-supported dentures for full arches.", price: 25000, unit: "/implant", dur: "2–3 visits", tag: "Lifetime warranty" },
    { cat: "surgical", label: "Surgical", icon: "wisdom", name: "Wisdom tooth removal", desc: "Gentle surgical extraction of impacted wisdom teeth, with a clear aftercare plan.", price: 3500, dur: "45 min" },
    { cat: "kids", label: "Kids", icon: "kids", name: "Children's dentistry", desc: "Fluoride, sealants and baby-tooth care by a paediatric dentist in a calm, friendly room.", price: 600, dur: "30 min", tag: "Ages 2+" }
  ];

  const COMPARE = [
    ["Root canal visits", "Usually 1 sitting", "2–3 sittings"],
    ["Cost before treatment", "Fixed written quote", "Verbal estimate, extras later"],
    ["X-rays & 3D CBCT", "In-house, same visit", "Referred to a scan centre"],
    ["Sterilisation", "Class-B autoclave, logged", "Class-N, rarely logged"],
    ["Implant warranty", "Lifetime on fixture", "1–5 years, or none"],
    ["Opening hours", "7 days, until 9 pm", "Closed Sundays"],
    ["Booking & follow-up", "WhatsApp, next-day check-in", "Phone calls only"],
    ["Payment", "0% EMI above ₹15,000", "Full payment upfront"]
  ];

  const REVIEWS = [
    { n: "Priya Raman", a: "Anna Nagar", s: "Root canal", t: "I was dreading my root canal but it was done in one sitting and I felt nothing. Dr. Karthik showed me the X-ray on screen and explained every step." },
    { n: "Arjun Venkatesh", a: "Velachery", s: "Implants", t: "Got two implants after losing teeth in an accident. The written quote matched the final bill to the rupee. Six months on, they feel like my own." },
    { n: "Lakshmi Subramanian", a: "Kilpauk", s: "Kids", t: "My 5-year-old actually asks when we are going back. The team is so patient with children and the room is cheerful, not scary at all." },
    { n: "Mohammed Irfan", a: "Adyar", s: "Clear aligners", t: "Saw my final smile on the 3D scan before I paid anything. Aligners finished two weeks early. Monthly check-ins on WhatsApp were very convenient." },
    { n: "Divya Krishnan", a: "Mogappair", s: "Whitening", t: "Spotless clinic. They opened the sealed instrument kit in front of me, which I really appreciated. Whitening result was natural, not too white." },
    { n: "Sanjay Natarajan", a: "Guindy", s: "Emergency", t: "Cracked a tooth on a Sunday morning. Messaged on WhatsApp and was in the chair by noon. Brilliant, calm service." },
    { n: "Ananya Iyer", a: "Anna Nagar", s: "Veneers", t: "The digital smile preview sold me. Veneers look completely natural and the shade match is perfect. Worth every rupee." },
    { n: "Ravi Shankar", a: "Pallikaranai", s: "Check-up", t: "Honest dentists. They told me I did not need the crown another clinic had quoted. Just a cleaning and a filling. Rare to find." },
    { n: "Fathima Begum", a: "Velachery", s: "Braces", t: "Ceramic braces for my daughter. Flexible evening appointments meant she never missed school. Clear updates at every visit." },
    { n: "Vignesh Kumar", a: "T. Nagar", s: "Wisdom tooth", t: "Impacted wisdom tooth removed in 30 minutes. Swelling was minimal and they called the next day to check on me." }
  ];

  const CLINICS = [
    {
      id: "anna-nagar", name: "Anna Nagar", kind: "Main studio",
      addr: ["No. 14, 2nd Avenue, Block AE", "Anna Nagar West, Chennai 600040", "Near Anna Nagar Tower Park"],
      q: "2nd Avenue, Anna Nagar, Chennai 600040",
      phone: "+91 98400 12345",
      hours: [["Mon – Sat", "9:00 am – 9:00 pm", [9, 21]], ["Sunday", "10:00 am – 2:00 pm", [10, 14]]],
      parking: "Free parking for 12 cars"
    },
    {
      id: "velachery", name: "Velachery", kind: "South Chennai studio",
      addr: ["Plot 22, 100 Feet Bypass Road", "Velachery, Chennai 600042", "Opposite Phoenix MarketCity"],
      q: "100 Feet Bypass Road, Velachery, Chennai 600042",
      phone: "+91 98400 12346",
      hours: [["Mon – Sat", "10:00 am – 9:00 pm", [10, 21]], ["Sunday", "10:00 am – 2:00 pm", [10, 14]]],
      parking: "Valet parking available"
    }
  ];

  const fmtINR = (n) => "₹" + n.toLocaleString("en-IN");

  /* ------------------------------------------------------------------ *
   * WhatsApp links
   * ------------------------------------------------------------------ */
  $$(".js-wa").forEach((a) => {
    a.href = waLink("Hi Aster Dental, I'd like to book an appointment.");
  });
  const waFloat = $("#waFloat");
  setTimeout(() => { waFloat.classList.add("peek"); setTimeout(() => waFloat.classList.remove("peek"), 4000); }, 6000);

  /* ------------------------------------------------------------------ *
   * Scroll-scrubbed hero
   * ------------------------------------------------------------------ */
  const hero = $("#hero");
  const canvas = $("#heroCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const frames = new Array(FRAME_COUNT);
  const chapters = $$(".chapter");
  const hudBar = $("#hudBar"), hudFrame = $("#hudFrame"), hudSteps = $$("#hudSteps span"), scrollCue = $("#scrollCue");
  const loader = $("#loader"), loaderBar = $("#loaderBar"), loaderNum = $("#loaderNum");
  const BG = "#46494b";

  let cw = 0, ch = 0, dpr = 1;
  let target = 0, current = 0, lastDrawn = -1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";
    lastDrawn = -1;
  }

  function nearestLoaded(i) {
    if (frames[i]) return frames[i];
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (frames[i - d]) return frames[i - d];
      if (frames[i + d]) return frames[i + d];
    }
    return null;
  }

  // Must match the split-layout media query in styles.css.
  const splitLayout = window.matchMedia("(min-aspect-ratio: 9/10) and (min-width: 860px)");

  // Soften the frame's top and bottom edges into the panel background.
  function feather(dy, dh) {
    const fade = dh * 0.2;
    let g = ctx.createLinearGradient(0, dy, 0, dy + fade);
    g.addColorStop(0, BG); g.addColorStop(1, "rgba(70,73,75,0)");
    ctx.fillStyle = g; ctx.fillRect(0, dy - 1, cw, fade + 1);
    g = ctx.createLinearGradient(0, dy + dh - fade, 0, dy + dh);
    g.addColorStop(0, "rgba(70,73,75,0)"); g.addColorStop(1, BG);
    ctx.fillStyle = g; ctx.fillRect(0, dy + dh - fade, cw, fade + 1);
  }

  function draw(index) {
    const img = nearestLoaded(index);
    if (!img) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const p = index / (FRAME_COUNT - 1);
    // Focal point drifts from the chair (left) toward the cabinetry (right) as the scene explodes.
    const focal = 0.42 + 0.18 * smooth(0.55, 0.9, p);
    let scale, dy;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, cw, ch);
    if (splitLayout.matches) {
      // Desktop: the canvas is the framed left panel. Fill its width, keep most of the scene visible.
      scale = Math.max(cw / iw, (ch * 0.8) / ih);
      dy = (ch - ih * scale) / 2;
    } else {
      // Phones: show more of the scene, park it in the upper half, copy sits below.
      scale = (cw * 1.75) / iw;
      dy = ch * 0.3 - (ih * scale) / 2;
    }
    const dw = iw * scale, dh = ih * scale;
    const dx = clamp(cw / 2 - focal * dw, cw - dw, 0);
    ctx.drawImage(img, dx, dy, dw, dh);
    if (dh < ch + 1) feather(dy, dh);
  }

  function heroProgress() {
    const total = hero.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-hero.getBoundingClientRect().top / total) : 0;
  }

  function updateChapters(p) {
    const fade = 0.045;
    chapters.forEach((el, idx) => {
      const a = +el.dataset.from, b = +el.dataset.to;
      const fadeIn = idx === 0 ? 1 : smooth(a, a + fade, p);
      const fadeOut = 1 - smooth(b - fade, b, p);
      const o = Math.min(fadeIn, fadeOut);
      const dir = p < a + fade ? 1 : -1; // enter from below, leave upward
      el.style.opacity = o.toFixed(3);
      el.style.setProperty("--ty", `${((1 - o) * 36 * dir).toFixed(1)}px`);
      el.classList.toggle("show", o > 0.01);
    });
    const step = p < 0.22 ? 0 : p < 0.54 ? 1 : p < 0.82 ? 2 : 3;
    hudSteps.forEach((s, i) => s.classList.toggle("on", i === step));
    hudBar.style.width = `${(p * 100).toFixed(2)}%`;
    scrollCue.style.opacity = String(1 - smooth(0.02, 0.08, p));
  }

  function tick() {
    target = heroProgress() * (FRAME_COUNT - 1);
    current += (target - current) * (reduceMotion ? 1 : 0.12);
    if (Math.abs(target - current) < 0.01) current = target;
    const idx = Math.round(current);
    if (idx !== lastDrawn) {
      draw(idx);
      lastDrawn = idx;
      hudFrame.textContent = `${String(idx + 1).padStart(3, "0")} / ${FRAME_COUNT}`;
    }
    updateChapters(current / (FRAME_COUNT - 1));
    requestAnimationFrame(tick);
  }

  // Load the first frame, then a coarse pass (every 6th) so scrubbing works
  // immediately, then fill in the rest in the background.
  function loadFrames() {
    const order = [0];
    for (let i = 6; i < FRAME_COUNT; i += 6) order.push(i);
    order.push(FRAME_COUNT - 1);
    const coarse = new Set(order);
    for (let i = 1; i < FRAME_COUNT; i++) if (!coarse.has(i)) order.push(i);

    const coarseCount = coarse.size;
    let loadedCoarse = 0, done = false;
    const finish = () => { if (!done) { done = true; loader.classList.add("done"); } };
    setTimeout(finish, 8000); // never hold the page hostage on a slow network

    let next = 0;
    const PARALLEL = 6;
    const loadOne = () => {
      if (next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.decoding = "async";
      img.onload = img.onerror = () => {
        if (img.naturalWidth) { frames[i] = img; lastDrawn = -1; }
        if (coarse.has(i)) {
          loadedCoarse++;
          const pct = Math.round((loadedCoarse / coarseCount) * 100);
          loaderBar.style.width = pct + "%";
          loaderNum.textContent = `Preparing the operatory · ${pct}%`;
          if (loadedCoarse >= coarseCount) finish();
        }
        loadOne();
      };
      img.src = framePath(i);
    };
    for (let k = 0; k < PARALLEL; k++) loadOne();
  }

  resize();
  window.addEventListener("resize", resize);
  loadFrames();
  requestAnimationFrame(tick);

  /* ------------------------------------------------------------------ *
   * Nav: transparent over the hero, solid after
   * ------------------------------------------------------------------ */
  const nav = $("#nav");
  const onScroll = () => {
    const heroEnd = hero.offsetTop + hero.offsetHeight - window.innerHeight * 0.6;
    nav.classList.toggle("solid", window.scrollY > heroEnd);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ *
   * Services + filters
   * ------------------------------------------------------------------ */
  const grid = $("#servicesGrid");
  grid.innerHTML = SERVICES.map((s) => `
    <article class="service reveal" data-cat="${s.cat}">
      <div class="service-top">
        <span class="service-icon">${icon(s.icon)}</span>
        ${s.tag ? `<span class="tag">${s.tag}</span>` : `<span class="service-cat">${s.label}</span>`}
      </div>
      <h3>${s.name}</h3>
      <p>${s.desc}</p>
      <div class="service-meta"><span class="price">From ${fmtINR(s.price)}${s.unit || ""}</span><span class="dur">${s.dur}</span></div>
    </article>`).join("");

  $$("#filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#filters .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      const f = chip.dataset.filter;
      $$(".service", grid).forEach((card, i) => {
        const show = f === "all" || card.dataset.cat === f;
        card.hidden = !show;
        if (show && !reduceMotion) {
          card.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }],
            { duration: 450, delay: (i % 4) * 50, easing: "cubic-bezier(.2,.7,.1,1)", fill: "backwards" });
        }
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * Comparison table
   * ------------------------------------------------------------------ */
  $("#compareBody").innerHTML = COMPARE.map(([k, us, them]) => `
    <tr><th scope="row">${k}</th>
      <td class="us"><span class="yes"><svg><use href="#i-check"/></svg></span>${us}</td>
      <td class="them"><span class="no"><svg><use href="#i-x"/></svg></span>${them}</td></tr>`).join("");

  /* ------------------------------------------------------------------ *
   * Reviews marquee
   * ------------------------------------------------------------------ */
  const HUES = ["#2c5f8e", "#8a5a2b", "#2f7a64", "#7a3f6b", "#5b6b2f", "#9a3b3b"];
  const reviewCard = (r, i) => `
    <article class="review">
      <div class="review-top"><span class="stars" aria-label="5 out of 5 stars">★★★★★</span><span class="svc">${r.s}</span></div>
      <p>“${r.t}”</p>
      <footer><span class="avatar" style="background:${HUES[i % HUES.length]}">${r.n.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
        <div><b>${r.n}</b><small>${r.a}, Chennai · Google review</small></div></footer>
    </article>`;
  const half = Math.ceil(REVIEWS.length / 2);
  const rows = [REVIEWS.slice(0, half), REVIEWS.slice(half)];
  $("#marquee").innerHTML = rows.map((row, ri) => {
    const cards = row.map((r, i) => reviewCard(r, i + ri * half)).join("");
    // duplicated once so the -50% translate loops seamlessly
    return `<div class="marquee-row${ri ? " rev" : ""}">${cards}<div style="display:contents" aria-hidden="true">${cards}</div></div>`;
  }).join("");

  /* ------------------------------------------------------------------ *
   * Booking form
   * ------------------------------------------------------------------ */
  const form = $("#bookForm");
  const svcSelect = $("#f-service");
  svcSelect.innerHTML = `<option value="">Choose a treatment</option>` +
    SERVICES.map((s) => `<option>${s.name}</option>`).join("") +
    `<option>Dental emergency / pain</option><option>Not sure, need advice</option>`;

  const SLOTS = ["10:00", "11:30", "13:00", "16:00", "17:30", "19:00"];
  const slotWrap = $("#slots");
  slotWrap.innerHTML = SLOTS.map((t, i) => {
    const [h, m] = t.split(":").map(Number);
    const label = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
    return `<input type="radio" name="slot" id="slot-${i}" value="${label}" data-hour="${h}"><label for="slot-${i}">${label}</label>`;
  }).join("");

  const dateInput = $("#f-date");
  const isoDate = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const today = new Date();
  dateInput.min = isoDate(today);
  const maxD = new Date(); maxD.setDate(maxD.getDate() + 60);
  dateInput.max = isoDate(maxD);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  dateInput.value = isoDate(tomorrow);

  // Sundays close at 2 pm, so afternoon slots are disabled for them.
  function syncSlots() {
    const d = dateInput.value ? new Date(dateInput.value + "T00:00") : null;
    const sunday = d && d.getDay() === 0;
    $$("input[name=slot]", slotWrap).forEach((r) => {
      const off = sunday && +r.dataset.hour >= 14;
      r.disabled = off;
      r.nextElementSibling.style.opacity = off ? ".35" : "";
      r.nextElementSibling.style.textDecoration = off ? "line-through" : "";
      if (off && r.checked) r.checked = false;
    });
  }
  dateInput.addEventListener("change", syncSlots);
  syncSlots();

  const setErr = (el, msg) => {
    const field = el.closest(".field");
    field.classList.toggle("invalid", !!msg);
    $(".err", field).textContent = msg || "";
    return !msg;
  };

  function validate() {
    let ok = true;
    const name = $("#f-name"), phone = $("#f-phone"), email = $("#f-email");
    ok = setErr(name, name.value.trim().length < 2 ? "Enter your name so we know who to expect." : "") && ok;
    const digits = phone.value.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
    ok = setErr(phone, /^[6-9]\d{9}$/.test(digits) ? "" : "Enter a 10-digit Indian mobile number.") && ok;
    ok = setErr(email, email.value && !email.checkValidity() ? "Check the email address, or leave it blank." : "") && ok;
    ok = setErr(svcSelect, svcSelect.value ? "" : "Choose a treatment, or pick “Not sure”.") && ok;
    ok = setErr(dateInput, dateInput.value && dateInput.value >= dateInput.min ? "" : "Choose a date from today onwards.") && ok;
    ok = setErr(slotWrap, $("input[name=slot]:checked", slotWrap) ? "" : "Pick a time slot.") && ok;
    return ok;
  }

  $$("input, select", form).forEach((el) => el.addEventListener("input", () => {
    if (el.closest(".field")?.classList.contains("invalid")) validate();
  }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) { $(".field.invalid input, .field.invalid select", form)?.focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    const niceDate = new Date(data.date + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    const msg = [
      "Hi Aster Dental, I'd like to book an appointment.",
      `Name: ${data.name}`, `Phone: ${data.phone}`,
      `Clinic: ${data.clinic}`, `Treatment: ${data.service}`,
      `Preferred: ${niceDate}, ${data.slot}`,
      data.note ? `Note: ${data.note}` : ""
    ].filter(Boolean).join("\n");
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

    // Prototype: no backend yet. Hook a real endpoint (e.g. fetch('/api/appointments')) here.
    form.innerHTML = `
      <div class="confirm" role="status">
        <span class="confirm-badge"><svg><use href="#i-check"/></svg></span>
        <h3>Request received, ${esc(data.name.split(" ")[0])}.</h3>
        <p style="color:var(--ink-soft)">Our ${esc(data.clinic)} front desk will call you on ${esc(data.phone)} to confirm. For a faster reply, send these details on WhatsApp.</p>
        <dl>
          <dt>Clinic</dt><dd>${esc(data.clinic)}</dd>
          <dt>Treatment</dt><dd>${esc(data.service)}</dd>
          <dt>When</dt><dd>${esc(niceDate)}, ${esc(data.slot)}</dd>
        </dl>
        <div class="actions">
          <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>Send on WhatsApp</a>
          <button class="btn btn-outline" type="button" id="bookAgain">Book another</button>
        </div>
      </div>`;
    $("#bookAgain").addEventListener("click", () => location.reload());
    form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  });

  /* ------------------------------------------------------------------ *
   * Locations + maps
   * ------------------------------------------------------------------ */
  // Inside a sandboxed preview frame, third-party map embeds are blocked,
  // so show a drawn map card with a link out instead.
  const canEmbedMap = window.self === window.top;
  // Clinic hours are in IST (UTC+5:30) whatever the visitor's timezone.
  const istNow = () => new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000);
  function openStatus(c) {
    const now = istNow();
    const h = now.getHours() + now.getMinutes() / 60;
    const [from, to] = c.hours[now.getDay() === 0 ? 1 : 0][2];
    return h >= from && h < to;
  }

  $("#locTabs").innerHTML = CLINICS.map((c, i) =>
    `<button role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${c.name}</button>`).join("");

  $("#locPanels").innerHTML = CLINICS.map((c, i) => {
    const open = openStatus(c);
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.q)}`;
    const dirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(c.q)}`;
    const map = canEmbedMap
      ? `<iframe title="Map of Aster Dental ${c.name}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
           src="https://maps.google.com/maps?q=${encodeURIComponent(c.q)}&z=16&output=embed"></iframe>`
      : `<a class="map-fallback" href="${mapsUrl}" target="_blank" rel="noopener" style="text-decoration:none;color:var(--ink)">
           <span class="map-pin"><svg><use href="#i-pin"/></svg><span>Aster Dental · ${c.name} — open in Google Maps</span></span></a>`;
    return `
      <div class="loc-panel reveal" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}" ${i ? "hidden" : ""}>
        <div class="loc-info">
          <span class="open-now ${open ? "" : "closed"}"><i></i>${open ? "Open now" : "Closed now"}</span>
          <span class="loc-kind">${c.kind}</span>
          <h3>${c.name}</h3>
          <address>${c.addr.join("<br>")}</address>
          <div class="hours">${c.hours.map(([d, t]) => `<div><span>${d}</span><b>${t}</b></div>`).join("")}
            <div><span>Phone</span><b>${c.phone}</b></div>
            <div><span>Parking</span><b>${c.parking}</b></div>
          </div>
          <div class="loc-actions">
            <a class="btn btn-primary" href="${dirUrl}" target="_blank" rel="noopener"><svg><use href="#i-pin"/></svg>Get directions</a>
            <a class="btn btn-wa" href="${waLink(`Hi Aster Dental ${c.name}, I'd like to book an appointment.`)}" target="_blank" rel="noopener"><svg><use href="#i-wa"/></svg>WhatsApp</a>
          </div>
        </div>
        <div class="map">${map}</div>
      </div>`;
  }).join("");

  const tabs = $$("#locTabs [role=tab]");
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
        selectTab(n); n.focus();
      }
    });
  });
  $("#f-clinic").addEventListener("change", (e) => selectTab(tabs[e.target.selectedIndex]));

  /* ------------------------------------------------------------------ *
   * Reveal on scroll + count-up stats
   * ------------------------------------------------------------------ */
  if ("IntersectionObserver" in window && !reduceMotion) {
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.remove("pre"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) {
        el.classList.add("pre");
        el.style.transitionDelay = `${(i % 4) * 70}ms`;
        io.observe(el);
      }
    });

    const counters = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        counters.unobserve(en.target);
        const el = en.target, end = +el.dataset.count, dec = +(el.dataset.dec || 0), k = el.dataset.format === "k";
        const t0 = performance.now(), D = 1600;
        const step = (t) => {
          const p = clamp((t - t0) / D), v = end * (1 - Math.pow(1 - p, 3));
          el.textContent = k ? (v / 1000).toFixed(1) + "k" : v.toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    $$("[data-count]").forEach((el) => counters.observe(el));
  }
})();
