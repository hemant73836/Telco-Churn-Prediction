"use strict";



const DEFAULT_API_BASE = "https://telco-churn-prediction-yba4.onrender.com";   // <-- your FastAPI address
const STORAGE_KEY = "churn-api-base";
const BAR_COUNT = 24;
const MIN_LOADING_MS = 600;      // lets the loading animation play once, even if the API answers instantly
const REQUEST_TIMEOUT_MS = 15000;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;



const YES_NO = [
  { value: "Yes", label: "Yes" },
  { value: "No",  label: "No"  },
];
const withNoService = (label) => [...YES_NO, { value: label, label: label === "No phone service" ? "No phone" : "No internet" }];

const SECTIONS = [
  {
    mount: "fields-customer",
    fields: [
      { name: "gender",        label: "Gender",         type: "seg", options: [{ value: "Female", label: "Female" }, { value: "Male", label: "Male" }] },
      { name: "SeniorCitizen", label: "Senior citizen", type: "seg", options: YES_NO },
      { name: "Partner",       label: "Has a partner",  type: "seg", options: YES_NO },
      { name: "Dependents",    label: "Has dependents", type: "seg", options: YES_NO },
    ],
  },
  {
    mount: "fields-services",
    fields: [
      { name: "PhoneService",     label: "Phone service",    type: "seg", options: YES_NO },
      { name: "MultipleLines",    label: "Multiple lines",   type: "seg", options: withNoService("No phone service"),  dependsOn: "phone" },
      { name: "InternetService",  label: "Internet service", type: "seg", options: [{ value: "DSL", label: "DSL" }, { value: "Fiber optic", label: "Fiber optic" }, { value: "No", label: "None" }] },
      { name: "OnlineSecurity",   label: "Online security",  type: "seg", options: withNoService("No internet service"), dependsOn: "internet" },
      { name: "OnlineBackup",     label: "Online backup",    type: "seg", options: withNoService("No internet service"), dependsOn: "internet" },
      { name: "DeviceProtection", label: "Device protection",type: "seg", options: withNoService("No internet service"), dependsOn: "internet" },
      { name: "TechSupport",      label: "Tech support",     type: "seg", options: withNoService("No internet service"), dependsOn: "internet" },
      { name: "StreamingTV",      label: "Streaming TV",     type: "seg", options: withNoService("No internet service"), dependsOn: "internet" },
      { name: "StreamingMovies",  label: "Streaming movies", type: "seg", options: withNoService("No internet service"), dependsOn: "internet" },
    ],
  },
  {
    mount: "fields-account",
    fields: [
      { name: "tenure",           label: "Tenure",           type: "range",  min: 0, max: 72, span: 2 },
      { name: "Contract",         label: "Contract",         type: "seg",    span: 2, options: [{ value: "Month-to-month", label: "Month-to-month" }, { value: "One year", label: "One year" }, { value: "Two year", label: "Two year" }] },
      { name: "PaperlessBilling", label: "Paperless billing",type: "seg",    span: 2, options: YES_NO },
      { name: "PaymentMethod",    label: "Payment method",   type: "tiles",  span: 2, options: [
          { value: "Electronic check",          label: "Electronic check" },
          { value: "Mailed check",              label: "Mailed check" },
          { value: "Bank transfer (automatic)", label: "Bank transfer (automatic)" },
          { value: "Credit card (automatic)",   label: "Credit card (automatic)" },
      ] },
      { name: "MonthlyCharges",   label: "Monthly charges",  type: "number", hint: "Amount billed each month" },
      { name: "TotalCharges",     label: "Total charges",    type: "number", auto: true },
    ],
  },
];

const RADIO_FIELDS = SECTIONS.flatMap((s) => s.fields).filter((f) => f.type === "seg" || f.type === "tiles").map((f) => f.name);

const ADDON_FIELDS = SECTIONS.flatMap((s) => s.fields).filter((f) => f.dependsOn === "internet").map((f) => f.name);

/* Starting values (also used by "Reset form") */
const DEFAULTS = {
  gender: "Female", SeniorCitizen: "No", Partner: "No", Dependents: "No",
  PhoneService: "Yes", MultipleLines: "No", InternetService: "DSL",
  OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No",
  TechSupport: "No", StreamingTV: "No", StreamingMovies: "No",
  tenure: 12, Contract: "Month-to-month", PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check", MonthlyCharges: 70,
};

const EXAMPLES = {
  risky: {
    gender: "Female", SeniorCitizen: "No", Partner: "No", Dependents: "No",
    PhoneService: "Yes", MultipleLines: "No", InternetService: "Fiber optic",
    OnlineSecurity: "No", OnlineBackup: "No", DeviceProtection: "No",
    TechSupport: "No", StreamingTV: "No", StreamingMovies: "No",
    tenure: 2, Contract: "Month-to-month", PaperlessBilling: "Yes",
    PaymentMethod: "Electronic check", MonthlyCharges: 70.7,
  },
  loyal: {
    gender: "Male", SeniorCitizen: "No", Partner: "Yes", Dependents: "Yes",
    PhoneService: "Yes", MultipleLines: "Yes", InternetService: "DSL",
    OnlineSecurity: "Yes", OnlineBackup: "Yes", DeviceProtection: "Yes",
    TechSupport: "Yes", StreamingTV: "No", StreamingMovies: "No",
    tenure: 60, Contract: "Two year", PaperlessBilling: "No",
    PaymentMethod: "Bank transfer (automatic)", MonthlyCharges: 64.95,
  },
};

/* ---------- 3. Small helpers ---------- */

const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "text") node.textContent = v;
    else if (v !== false && v != null) node.setAttribute(k, v === true ? "" : v);
  }
  node.append(...children);
  return node;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function storageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage may be blocked — ignore */ }
}

/* ---------- 4. Build the form ---------- */

const form = $("#churn-form");

function buildOptions(field, wrapClass) {
  const wrap = el("div", { class: wrapClass, role: "radiogroup", "aria-labelledby": `lbl-${field.name}` });
  field.options.forEach((opt) => {
    wrap.append(
      el("label", {},
        el("input", { type: "radio", name: field.name, value: opt.value }),
        el("span", { text: opt.label })
      )
    );
  });
  return wrap;
}

function buildField(field) {
  const wrapper = el("div", { class: `field${field.span === 2 ? " span-2" : ""}`, "data-field": field.name });

  // number inputs get a real <label for=...>; the other controls are groups labelled by a <span>
  if (field.type !== "number") {
    wrapper.append(el("span", { class: "label", id: `lbl-${field.name}`, text: field.label }));
  }

  if (field.type === "seg") {
    wrapper.append(buildOptions(field, "seg"));
  } else if (field.type === "tiles") {
    wrapper.append(buildOptions(field, "tiles"));
  } else if (field.type === "range") {
    wrapper.append(
      el("div", { class: "range-head" },
        el("output", { id: "tenure-out", for: "tenure", text: "12" }),
        el("span", { class: "unit", text: "months" })
      ),
      el("input", { type: "range", id: "tenure", name: "tenure", min: field.min, max: field.max, step: 1, value: 12, "aria-labelledby": `lbl-${field.name}` }),
      el("div", { class: "range-scale", "aria-hidden": "true" }, el("span", { text: "0" }), el("span", { text: "72 months" }))
    );
  } else if (field.type === "number") {
    const header = el("div", { class: "label" },
      el("label", { for: field.name, text: field.label })
    );
    if (field.auto) {
      header.append(el("button", { type: "button", class: "auto-toggle", id: "total-auto", "aria-pressed": "true", title: "Calculate from tenure × monthly charges", text: "Auto" }));
    }
    wrapper.append(
      header,
      el("input", { class: "input", type: "number", id: field.name, name: field.name, min: 0, step: "0.01", inputmode: "decimal", required: true }),
      el("span", { class: "hint", id: `hint-${field.name}`, text: field.hint || "" })
    );
  }
  return wrapper;
}

SECTIONS.forEach((section) => {
  const mount = document.getElementById(section.mount);
  section.fields.forEach((f) => mount.append(buildField(f)));
});

/* ---------- 5. Reading & writing form values ---------- */

const tenureInput  = $("#tenure");
const tenureOut    = $("#tenure-out");
const monthlyInput = $("#MonthlyCharges");
const totalInput   = $("#TotalCharges");
const totalToggle  = $("#total-auto");
const totalHint    = $("#hint-TotalCharges");

let totalAuto = true;

const radiosOf = (name) => [...form.querySelectorAll(`input[type="radio"][name="${name}"]`)];
const getRadio = (name) => radiosOf(name).find((r) => r.checked)?.value ?? null;
const setRadio = (name, value) => radiosOf(name).forEach((r) => { r.checked = r.value === value; });

function updateSlider() {
  const min = +tenureInput.min, max = +tenureInput.max;
  tenureInput.style.setProperty("--p", `${((tenureInput.value - min) / (max - min)) * 100}%`);
  tenureOut.textContent = tenureInput.value;
}

function recalcTotal() {
  const months = parseFloat(tenureInput.value);
  const monthly = parseFloat(monthlyInput.value);
  if (Number.isFinite(months) && Number.isFinite(monthly)) {
    totalInput.value = (months * monthly).toFixed(2);
  }
}

function updateTotalMode() {
  totalToggle.setAttribute("aria-pressed", String(totalAuto));
  totalHint.textContent = totalAuto ? "Calculated as tenure × monthly charges" : "Entered manually";
}

/* Some options only make sense together:
   - No phone service      -> "Multiple lines" must be "No phone service"
   - No internet service   -> every add-on must be "No internet service" */
function lockDependent(name, noService, noServiceValue) {
  radiosOf(name).forEach((r) => {
    const isNoServiceOption = r.value === noServiceValue;
    r.disabled = noService ? !isNoServiceOption : isNoServiceOption;
  });
  if (noService) setRadio(name, noServiceValue);
  else if (getRadio(name) === null || getRadio(name) === noServiceValue) setRadio(name, "No");
}

function syncDependencies() {
  lockDependent("MultipleLines", getRadio("PhoneService") === "No", "No phone service");
  const noInternet = getRadio("InternetService") === "No";
  ADDON_FIELDS.forEach((name) => lockDependent(name, noInternet, "No internet service"));
}

function applyValues(values) {
  RADIO_FIELDS.forEach((name) => { if (values[name] != null) setRadio(name, values[name]); });
  tenureInput.value = values.tenure;
  monthlyInput.value = values.MonthlyCharges;
  totalAuto = true;
  syncDependencies();
  updateSlider();
  recalcTotal();
  updateTotalMode();
  markStale();
}

function collectPayload() {
  const payload = {};
  RADIO_FIELDS.forEach((name) => { payload[name] = getRadio(name); });
  payload.tenure = parseInt(tenureInput.value, 10);
  payload.MonthlyCharges = parseFloat(monthlyInput.value);
  payload.TotalCharges = parseFloat(totalInput.value);
  return payload;
}

/* ---------- 6. Form events ---------- */

form.addEventListener("change", (e) => {
  if (e.target.name === "PhoneService" || e.target.name === "InternetService") syncDependencies();
  markStale();
});

tenureInput.addEventListener("input", () => {
  updateSlider();
  if (totalAuto) recalcTotal();
  markStale();
});

monthlyInput.addEventListener("input", () => {
  if (totalAuto) recalcTotal();
  markStale();
});

totalInput.addEventListener("input", () => {
  totalAuto = false;          // user typed their own value
  updateTotalMode();
  markStale();
});

totalToggle.addEventListener("click", () => {
  totalAuto = !totalAuto;
  if (totalAuto) recalcTotal();
  updateTotalMode();
  markStale();
});

document.querySelectorAll("[data-example]").forEach((btn) => {
  btn.addEventListener("click", () => applyValues(EXAMPLES[btn.dataset.example]));
});

$("#reset").addEventListener("click", () => {
  applyValues(DEFAULTS);
  clearResult();
});

/* ---------- 7. Signal meter ---------- */

const meter       = $("#meter");
const barsEl      = $("#bars");
const pctNumber   = $("#pct-number");
const resultBox   = $("#result");
const verdictTitle= $("#verdict-title");
const verdictSub  = $("#verdict-sub");
const badge       = $("#risk-badge");
const notice      = $("#notice");
const noticeTitle = $("#notice-title");
const noticeBody  = $("#notice-body");
const raw         = $("#raw");
const rawJson     = $("#raw-json");
const rawMeta     = $("#raw-meta");

const bars = [];
for (let i = 0; i < BAR_COUNT; i++) {
  // heights curve upward so the top-left stays free for the big number
  const h = 12 + 88 * Math.pow(i / (BAR_COUNT - 1), 1.4);
  const bar = el("span", { class: "bar" });
  bar.style.setProperty("--i", i);
  bar.style.setProperty("--h", `${h.toFixed(1)}%`);
  barsEl.append(bar);
  bars.push(bar);
}

// after the one-time intro animation, stop re-triggering it
setTimeout(() => { if (meter.dataset.state === "intro") meter.dataset.state = "idle"; },
           reduceMotion ? 0 : 700 + BAR_COUNT * 32);

function setLit(count, animate = true) {
  if (!animate) meter.classList.add("no-delay");
  bars.forEach((bar, i) => bar.classList.toggle("on", i < count));
  if (!animate) {
    void meter.offsetWidth;            // flush so the "no transition" state applies
    meter.classList.remove("no-delay");
  }
}

let countFrame = 0;
function countUp(target, duration = 1000) {
  cancelAnimationFrame(countFrame);
  if (reduceMotion) { pctNumber.textContent = target.toFixed(1); return; }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    pctNumber.textContent = (target * eased).toFixed(1);
    if (t < 1) countFrame = requestAnimationFrame(tick);
  };
  countFrame = requestAnimationFrame(tick);
}

function riskTier(probability) {
  if (probability >= 0.5)  return { key: "high",     label: "High risk" };
  if (probability >= 0.25) return { key: "moderate", label: "Moderate risk" };
  return { key: "low", label: "Low risk" };
}

function markStale() {
  if (meter.dataset.tier !== "none") resultBox.classList.add("is-stale");
}

function hideNotice() { notice.hidden = true; noticeBody.replaceChildren(); }

function clearResult() {
  cancelAnimationFrame(countFrame);
  setLit(0, false);
  meter.dataset.state = "idle";
  meter.dataset.tier = "none";
  pctNumber.textContent = "–";
  verdictTitle.textContent = "No prediction yet";
  verdictSub.textContent = "Fill in the form, then select Predict churn.";
  badge.hidden = true;
  raw.hidden = true;
  resultBox.classList.remove("is-stale");
  hideNotice();
}

function showResult(data, elapsedMs) {
  const churnP = data.churn_probability;
  const stayP  = data.no_churn_probability;
  const tier   = riskTier(churnP);

  hideNotice();
  resultBox.classList.remove("is-stale");
  meter.dataset.state = "done";
  meter.dataset.tier = tier.key;

  setLit(Math.max(Math.round(churnP * BAR_COUNT), churnP > 0.01 ? 1 : 0));
  countUp(churnP * 100);

  verdictTitle.textContent = data.prediction === "Yes" ? "Likely to churn" : "Likely to stay";
  verdictSub.textContent = `Churn probability ${(churnP * 100).toFixed(1)}%. Chance of staying ${(stayP * 100).toFixed(1)}%.`;
  badge.textContent = tier.label;
  badge.dataset.tier = tier.key;
  badge.hidden = false;

  rawJson.textContent = JSON.stringify(data, null, 2);
  rawMeta.textContent = `Responded in ${Math.round(elapsedMs)} ms`;
  raw.hidden = true;
}

function showError(title, ...bodyNodes) {
  cancelAnimationFrame(countFrame);
  setLit(0, false);
  meter.dataset.state = "idle";
  meter.dataset.tier = "none";
  pctNumber.textContent = "–";
  verdictTitle.textContent = "No prediction";
  verdictSub.textContent = "Something went wrong. Details are below.";
  badge.hidden = true;
  raw.hidden = true;
  resultBox.classList.remove("is-stale");

  noticeTitle.textContent = title;
  noticeBody.replaceChildren(...bodyNodes);
  notice.hidden = false;
}

/* ---------- 8. API connection ---------- */

const apiInput = $("#api-url");
const statusEl = $("#status");
const statusText = $("#status-text");

function normalizeBase(value) {
  let v = (value || "").trim().replace(/\/+$/, "");
  if (!v) return DEFAULT_API_BASE;
  if (!/^https?:\/\//i.test(v)) v = `http://${v}`;
  return v;
}

let apiBase = normalizeBase(DEFAULT_API_BASE);
apiInput.value = apiBase;

async function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function setStatus(state) {
  statusEl.dataset.state = state;
  statusText.textContent = {
    checking: "Checking API",
    online: "API connected",
    offline: "API offline",
  }[state];
  statusEl.title = apiBase;
}

/* Any HTTP answer (even a 404) means the server is up; only a network error means offline. */
async function checkApi() {
  setStatus("checking");
  try {
    await fetchWithTimeout(`${apiBase}/openapi.json`, {}, 4000);
    setStatus("online");
    return true;
  } catch {
    setStatus("offline");
    return false;
  }
}

apiInput.addEventListener("change", () => {
  apiBase = normalizeBase(apiInput.value);
  apiInput.value = apiBase;
  storageSet(STORAGE_KEY, apiBase);
  checkApi();
});
$("#api-check").addEventListener("click", () => {
  apiBase = normalizeBase(apiInput.value);
  apiInput.value = apiBase;
  storageSet(STORAGE_KEY, apiBase);
  checkApi();
});
document.addEventListener("visibilitychange", () => { if (!document.hidden) checkApi(); });
setInterval(() => { if (!document.hidden && statusEl.dataset.state !== "checking") checkApi(); }, 20000);

/* The actual call to the model API */
async function requestPrediction(payload) {
  let response;
  try {
    response = await fetchWithTimeout(`${apiBase}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw { kind: err.name === "AbortError" ? "timeout" : "network" };
  }

  if (!response.ok) {
    let body = null;
    try { body = await response.json(); } catch { /* not JSON */ }
    throw { kind: "http", status: response.status, body };
  }

  const data = await response.json();
  const valid = typeof data.churn_probability === "number" && typeof data.no_churn_probability === "number";
  if (!valid) throw { kind: "shape", data };
  return data;
}

/* ---------- 9. Submit ---------- */

const submitBtn = $("#submit");
const submitLabel = $("#submit-label");

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle("is-loading", isLoading);
  submitLabel.textContent = isLoading ? "Predicting" : "Predict churn";
  if (isLoading) {
    hideNotice();
    setLit(0, false);
    meter.dataset.state = "loading";
    resultBox.classList.remove("is-stale");
  }
}

function describeError(err) {
  const startCmd = el("code", { text: "uvicorn main:app --reload --port 8000" });
  switch (err.kind) {
    case "network":
      showError("Can't reach the API",
        el("p", {}, `Nothing responded at ${apiBase}. Start your FastAPI server (for example `, startCmd, "), check the API address, and make sure CORS is enabled, then try again."));
      break;
    case "timeout":
      showError("The API took too long to respond",
        el("p", { text: "No answer after 15 seconds. Check that the server is running and the model has finished loading." }));
      break;
    case "http": {
      const detail = err.body?.detail;
      if (err.status === 422 && Array.isArray(detail)) {
        const list = el("ul");
        detail.forEach((d) => {
          const field = (d.loc || []).filter((p) => p !== "body").join(".");
          list.append(el("li", { text: `${field || "value"}: ${d.msg}` }));
        });
        showError("The API rejected some values", el("p", { text: "Fix these fields and predict again." }), list);
      } else {
        showError(`The API returned an error (${err.status})`,
          el("p", { text: typeof detail === "string" ? detail : "Check the terminal where uvicorn is running for the full error." }));
      }
      break;
    }
    case "shape":
      showError("Unexpected response from the API",
        el("p", {}, "Expected ", el("code", { text: "churn_probability" }), " and ", el("code", { text: "no_churn_probability" }), " as numbers."));
      break;
    default:
      showError("Something went wrong", el("p", { text: String(err?.message || err) }));
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = collectPayload();

  setLoading(true);
  const started = performance.now();
  try {
    const [data] = await Promise.all([requestPrediction(payload), sleep(MIN_LOADING_MS)]);
    setLoading(false);
    showResult(data, performance.now() - started);
    setStatus("online");
  } catch (err) {
    setLoading(false);
    describeError(err);
    if (err.kind === "network" || err.kind === "timeout") setStatus("offline");
  }

  // On narrow screens the result sits above the form, so bring it into view.
  if (window.matchMedia("(max-width: 900px)").matches) {
    $("#panel").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
});

/* ---------- 10. Start ---------- */

applyValues(DEFAULTS);
resultBox.classList.remove("is-stale");
checkApi();
