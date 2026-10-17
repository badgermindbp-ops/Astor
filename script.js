(() => {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Config — swap these for the real clinic before launch
   * ------------------------------------------------------------------ */
  const WHATSAPP_NUMBER = "919840012345"; // country code + number, digits only
  const FRAME_COUNT = 240;
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
  // Service mix drawn from what Chennai's top chains and independent clinics lead with,
  // plus the gaps patients complain about (sittings, transparency, warranty).
  const SERVICES = [
    { cat: "general", label: "General", name: "Check-up & cleaning", desc: "Full exam, ultrasonic scaling and polishing with an intraoral camera tour of your teeth.", price: 799, dur: "45 min", tag: "Digital X-ray incl." },
    { cat: "general", label: "General", name: "Single-sitting root canal", desc: "Rotary endodontics with apex locator and local anaesthesia. Most cases finish in one visit.", price: 4500, dur: "60–90 min", tag: "Painless" },
    { cat: "general", label: "General", name: "Tooth-coloured fillings", desc: "Light-cured composite fillings shade-matched to your enamel. No silver, no mercury.", price: 1200, dur: "30 min" },
    { cat: "general", label: "General", name: "Gum & laser treatment", desc: "Deep cleaning, laser gum therapy and treatment for bleeding gums and bad breath.", price: 2500, dur: "45 min" },
    { cat: "cosmetic", label: "Cosmetic", name: "Teeth whitening", desc: "In-clinic whitening that lifts several shades in one session, with sensitivity care.", price: 7999, dur: "60 min" },
    { cat: "cosmetic", label: "Cosmetic", name: "Veneers & smile makeover", desc: "Digital smile design lets you preview the result on your own face before we begin.", price: 12000, unit: "/tooth", dur: "2–3 visits", tag: "Preview first" },
    { cat: "cosmetic", label: "Cosmetic", name: "Crowns & bridges", desc: "Zirconia and E.max crowns milled for a natural fit, to restore broken or missing teeth.", price: 9000, unit: "/crown", dur: "2 visits" },
    { cat: "ortho", label: "Orthodontics", name: "Clear aligners", desc: "Near-invisible aligners planned on a 3D scan. See your final smile before you start.", price: 65000, dur: "6–18 months", tag: "3D plan" },
    { cat: "ortho", label: "Orthodontics", name: "Braces", desc: "Metal, ceramic and self-ligating braces for teens and adults, with monthly reviews.", price: 30000, dur: "12–24 months" },
    { cat: "surgical", label: "Surgical", name: "Dental implants", desc: "Titanium implants planned on 3D CBCT, plus implant-supported dentures for full arches.", price: 25000, unit: "/implant", dur: "2–3 visits", tag: "Lifetime warranty" },
    { cat: "surgical", label: "Surgical", name: "Wisdom tooth removal", desc: "Gentle surgical extraction of impacted wisdom teeth, with a clear aftercare plan.", price: 3500, dur: "45 min" },
    { cat: "kids", label: "Kids", name: "Children's dentistry", desc: "Fluoride, sealants and baby-tooth care by a paediatric dentist in a calm, friendly room.", price: 600, dur: "30 min", tag: "Ages 2+" }
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
   * Scroll-scrubbed hero: the canvas lives in the stage window below the hook
   * ------------------------------------------------------------------ */
  const hero = $("#hero");
  const canvas = $("#heroCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const buf = document.createElement("canvas");
  const bctx = buf.getContext("2d");
  const frames = new Array(FRAME_COUNT);
  const hudBar = $("#hudBar"), hudFrame = $("#hudFrame"), hudSteps = $$("#hudSteps li"), scrollCue = $("#scrollCue");
  const loader = $("#loader"), loaderBar = $("#loaderBar"), loaderNum = $("#loaderNum");
  // Where each stage of the animation starts, as a share of the scroll.
  const STEPS = [0, 0.33, 0.5, 0.7];

  const hook = $("#hook"), hudWrap = $(".hud-wrap");
  let cw = 0, ch = 0, dpr = 1;
  let target = 0, current = 0, lastDrawn = -1;
  // Free space for the subject, measured around the hook text and the stage readout.
  let room = { x0: 0, x1: 0, y0: 0, y1: 0 };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingQuality = "high";
    const box = canvas.getBoundingClientRect(), h = hook.getBoundingClientRect(), hud = hudWrap.getBoundingClientRect();
    const bottom = hud.top - box.top - 8;
    room = cw / ch > 1
      ? { x0: h.right - box.left + cw * 0.03, x1: cw * 0.98, y0: 72, y1: bottom }   // beside the words
      : { x0: 0, x1: cw, y0: h.bottom - box.top + 4, y1: bottom };                // below the words
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

  // Studio backdrop matching the frames' grey cyclorama; the frame melts into it.
  function paintBackdrop() {
    const g = ctx.createLinearGradient(0, 0, 0, ch);
    g.addColorStop(0, "#4b4c4d"); g.addColorStop(0.6, "#6a6b6b"); g.addColorStop(1, "#707171");
    ctx.fillStyle = g; ctx.fillRect(0, 0, cw, ch);
    const r = ctx.createRadialGradient(cw * 0.62, ch * 0.5, 0, cw * 0.62, ch * 0.5, Math.max(cw, ch) * 0.65);
    r.addColorStop(0, "rgba(138,139,139,.5)"); r.addColorStop(1, "rgba(138,139,139,0)");
    ctx.fillStyle = r; ctx.fillRect(0, 0, cw, ch);
  }

  // Alpha ramp across one axis: fade in over `a` (0..1 of length) at the start, out over `b` at the end.
  function ramp(len, a, b, vertical) {
    const g = vertical ? bctx.createLinearGradient(0, 0, 0, len) : bctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, a ? "rgba(0,0,0,0)" : "#000");
    if (a) g.addColorStop(a, "#000");
    if (b) g.addColorStop(1 - b, "#000");
    g.addColorStop(1, b ? "rgba(0,0,0,0)" : "#000");
    return g;
  }

  function draw(index) {
    const img = nearestLoaded(index);
    if (!img) return;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const p = index / (FRAME_COUNT - 1);
    // Subject box in frame space (dentist to tooth, tooth tip to feet). It tightens
    // as the tooth starts to shine, so the camera eases in for the finale.
    const z = smooth(0.62, 0.85, p);
    const sx0 = 0.29 - 0.02 * z, sx1 = 0.85 - 0.14 * z, sy0 = 0.1, sy1 = 0.93;
    const rw = Math.max(room.x1 - room.x0, 1), rh = Math.max(room.y1 - room.y0, 1);
    const scale = Math.min(rw / ((sx1 - sx0) * iw), rh / ((sy1 - sy0) * ih));
    const dw = iw * scale, dh = ih * scale;
    const dx = room.x0 + (rw - (sx1 - sx0) * dw) / 2 - sx0 * dw;
    const dy = room.y0 + (rh - (sy1 - sy0) * dh) / 2 - sy0 * dh;

    paintBackdrop();
    // Feather every frame edge that lands inside the screen, so there is no seam.
    const bw = Math.round(dw * dpr), bh = Math.round(dh * dpr);
    if (buf.width !== bw || buf.height !== bh) { buf.width = bw; buf.height = bh; }
    bctx.globalCompositeOperation = "source-over";
    bctx.clearRect(0, 0, bw, bh);
    bctx.drawImage(img, 0, 0, bw, bh);
    bctx.globalCompositeOperation = "destination-in";
    const fl = dx > 0 ? 0.16 : 0, fr = dx + dw < cw ? 0.16 : 0;
    const ft = dy > 0 ? 0.14 : 0, fb = dy + dh < ch ? 0.12 : 0;
    if (fl || fr) { bctx.fillStyle = ramp(bw, fl, fr, false); bctx.fillRect(0, 0, bw, bh); }
    if (ft || fb) { bctx.fillStyle = ramp(bh, ft, fb, true); bctx.fillRect(0, 0, bw, bh); }
    ctx.drawImage(buf, dx, dy, dw, dh);
  }

  function heroProgress() {
    const total = hero.offsetHeight - window.innerHeight;
    return total > 0 ? clamp(-hero.getBoundingClientRect().top / total) : 0;
  }

  function updateHud(p) {
    let step = 0;
    STEPS.forEach((s, i) => { if (p >= s) step = i; });
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
    updateHud(current / (FRAME_COUNT - 1));
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
          loaderNum.textContent = `Loading the studio · ${pct}%`;
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
  // The hook's size changes once the display font arrives; re-measure the free space then.
  if (document.fonts) document.fonts.ready.then(resize);
  loadFrames();
  requestAnimationFrame(tick);

  /* ------------------------------------------------------------------ *
   * Nav: see-through over the scene, solid after it
   * ------------------------------------------------------------------ */
  const nav = $("#nav");
  const onScroll = () => {
    const overHero = window.scrollY < hero.offsetTop + hero.offsetHeight - window.innerHeight * 1.05;
    nav.classList.toggle("on-hero", overHero);
    nav.classList.toggle("scrolled", !overHero);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ *
   * Treatment menu + filters (rows prefill the booking form)
   * ------------------------------------------------------------------ */
  const list = $("#servicesList");
  list.innerHTML = SERVICES.map((s) => `
    <li data-cat="${s.cat}">
      <button class="menu-item" type="button" data-service="${s.name}" aria-label="Book ${s.name}, from ${fmtINR(s.price)}">
        <span class="menu-name"><h3>${s.name}</h3>${s.tag ? `<span class="menu-tag">${s.tag}</span>` : ""}</span>
        <span class="menu-price">${fmtINR(s.price)}<small>${s.unit || ""}</small></span>
        <span class="menu-desc">${s.desc}</span>
        <span class="menu-meta">${s.label} · ${s.dur}<svg aria-hidden="true"><use href="#i-arrow"/></svg></span>
      </button>
    </li>`).join("");

  $$("#filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      $$("#filters .chip").forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      const f = chip.dataset.filter;
      let n = 0;
      $$("li", list).forEach((row) => {
        const show = f === "all" || row.dataset.cat === f;
        row.hidden = !show;
        if (show && !reduceMotion) {
          row.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
            { duration: 420, delay: n++ * 40, easing: "cubic-bezier(.2,.7,.1,1)", fill: "backwards" });
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
   * Reviews: rotating featured quote + marquee
   * ------------------------------------------------------------------ */
  const FEATURED = REVIEWS.slice(0, 5);
  const fq = $("#featureQuote"), fqDots = $("#fqDots");
  let fqIndex = 0, fqTimer = null;
  fqDots.innerHTML = FEATURED.map((r, i) => `<button type="button" aria-label="Review by ${r.n}" aria-pressed="${i === 0}"></button>`).join("");
  function showQuote(i, animate = true) {
    fqIndex = i;
    const r = FEATURED[i];
    const apply = () => {
      $("#fqText").textContent = r.t;
      $("#fqName").textContent = r.n;
      $("#fqMeta").textContent = `${r.s} · ${r.a}, Chennai`;
      fq.classList.remove("swap");
    };
    $$("button", fqDots).forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
    if (animate && !reduceMotion) { fq.classList.add("swap"); setTimeout(apply, 350); } else apply();
  }
  const startRotation = () => { clearInterval(fqTimer); if (!reduceMotion) fqTimer = setInterval(() => showQuote((fqIndex + 1) % FEATURED.length), 7000); };
  $$("button", fqDots).forEach((b, i) => b.addEventListener("click", () => { showQuote(i); startRotation(); }));
  showQuote(0, false);
  startRotation();

  const HUES = ["#3a6fbd", "#8a5a2b", "#2f7a64", "#7a3f6b", "#5b6b2f", "#9a3b3b"];
  const reviewCard = (r, i) => `
    <article class="review">
      <div class="review-top"><span class="stars" aria-label="5 out of 5 stars">★★★★★</span><span class="svc">${r.s}</span></div>
      <p>“${r.t}”</p>
      <footer><span class="avatar" style="background:${HUES[i % HUES.length]}">${r.n.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
        <div><b>${r.n}</b><small>${r.a}, Chennai · Google review</small></div></footer>
    </article>`;
  const cards = REVIEWS.map(reviewCard).join("");
  // duplicated once so the -50% translate loops seamlessly
  $("#marquee").innerHTML = `<div class="marquee-row">${cards}<div style="display:contents" aria-hidden="true">${cards}</div></div>`;

  /* ------------------------------------------------------------------ *
   * Booking form
   * ------------------------------------------------------------------ */
  const form = $("#bookForm");
  const svcSelect = $("#f-service");
  svcSelect.innerHTML = `<option value="">Choose a treatment</option>` +
    SERVICES.map((s) => `<option>${s.name}</option>`).join("") +
    `<option>Dental emergency / pain</option><option>Not sure, need advice</option>`;

  // Tapping a treatment in the menu carries it into the form.
  $$(".menu-item", list).forEach((btn) => btn.addEventListener("click", () => {
    svcSelect.value = btn.dataset.service;
    setErr(svcSelect, "");
    $("#book").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => $("#f-name").focus({ preventScroll: true }), reduceMotion ? 0 : 700);
  }));

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
          <button class="btn btn-line" type="button" id="bookAgain">Book another</button>
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
            <a class="btn btn-blue" href="${dirUrl}" target="_blank" rel="noopener"><svg><use href="#i-pin"/></svg>Get directions</a>
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
