const STORAGE_KEY = "planificadorDocentSessions.v010";
const APP_VERSION = "0.1.0";
const WEEKDAYS = ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"];
const CLASS_DAYS = ["dilluns", "dimarts", "dimecres", "dijous", "divendres"];
const STATES = ["prevista", "feta", "parcial", "ajornada", "cancel·lada", "substituïda"];
let installPrompt = null;

let data = loadData();
let activeGroupId = data.grups[0]?.id || null;

const $ = (id) => document.getElementById(id);

function defaultData() {
  return {
    app: {
      nom: "Planificador docent · Sessions i seguiment de curs",
      versio: APP_VERSION,
      idioma: "ca",
      dataCreacio: todayISO(),
      dataModificacio: todayISO()
    },
    cursAcademic: guessAcademicYear(),
    configuracio: {
      diesNoLectiusGenerals: [],
      nomCentre: "",
      docent: ""
    },
    grups: []
  };
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    return normalizeData(JSON.parse(raw));
  } catch (error) {
    console.error(error);
    return defaultData();
  }
}

function normalizeData(input) {
  const base = defaultData();
  const merged = { ...base, ...input };
  merged.app = { ...base.app, ...(input.app || {}), versio: APP_VERSION };
  merged.configuracio = { ...base.configuracio, ...(input.configuracio || {}) };
  merged.grups = Array.isArray(input.grups) ? input.grups.map(normalizeGroup) : [];
  return merged;
}

function normalizeGroup(group) {
  const id = group.id || slug(`${group.nivell || "grup"}-${group.grup || "x"}-${group.assignatura || Date.now()}`);
  return {
    id,
    nivell: group.nivell || "1r ESO",
    grup: group.grup || "A",
    assignatura: group.assignatura || "",
    cursAcademic: group.cursAcademic || guessAcademicYear(),
    dataInici: group.dataInici || "",
    dataFinal: group.dataFinal || "",
    diesSetmana: Array.isArray(group.diesSetmana) ? group.diesSetmana : [],
    sessions: Array.isArray(group.sessions) ? group.sessions.map(normalizeSession) : [],
    incidencies: Array.isArray(group.incidencies) ? group.incidencies.map(normalizeIncidence) : [],
    notesGenerals: group.notesGenerals || "",
    dataCreacio: group.dataCreacio || todayISO(),
    dataModificacio: todayISO()
  };
}

function normalizeSession(session, index = 0) {
  return {
    id: session.id || `sessio-${cryptoId()}`,
    num: session.num || index + 1,
    titol: session.titol || "",
    queEsTreballa: session.queEsTreballa || "",
    objectiu: session.objectiu || "",
    activitats: Array.isArray(session.activitats) ? session.activitats : stringToList(session.activitats || ""),
    recursos: Array.isArray(session.recursos) ? session.recursos : stringToList(session.recursos || ""),
    dataPrevista: session.dataPrevista || "",
    dataOriginal: session.dataOriginal || session.dataPrevista || "",
    dataReal: session.dataReal || null,
    estat: STATES.includes(session.estat) ? session.estat : "prevista",
    observacions: session.observacions || "",
    reprogramada: Boolean(session.reprogramada),
    motiuReprogramacio: session.motiuReprogramacio || "",
    substitucio: session.substitucio || { hiHaSubstitucio: false, descripcio: "" }
  };
}

function normalizeIncidence(inc) {
  return {
    id: inc.id || `inc-${cryptoId()}`,
    data: inc.data || "",
    motiu: inc.motiu || "",
    tipus: inc.tipus || "altres",
    accio: inc.accio || "ajornar",
    afectaTotElGrup: inc.afectaTotElGrup !== false,
    observacions: inc.observacions || ""
  };
}

function saveData(message = "Desat") {
  data.app.dataModificacio = todayISO();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data, null, 2));
  setSaveStatus(message);
  render();
}

function setSaveStatus(text) {
  const el = $("saveStatus");
  if (!el) return;
  el.textContent = text;
  setTimeout(() => { el.textContent = "Desat localment"; }, 1600);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function guessAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const start = month >= 8 ? year : year - 1;
  return `${start}-${start + 1}`;
}

function cryptoId() {
  if (crypto?.randomUUID) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

function slug(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + cryptoId();
}

function stringToList(text) {
  return String(text || "").split(/[\n,;]/).map(x => x.trim()).filter(Boolean);
}

function listToText(list) {
  return Array.isArray(list) ? list.join("\n") : "";
}

function activeGroup() {
  return data.grups.find(g => g.id === activeGroupId) || data.grups[0] || null;
}

function createGroup() {
  const group = normalizeGroup({
    nivell: "1r ESO",
    grup: "A",
    assignatura: "Nova assignatura",
    cursAcademic: data.cursAcademic,
    dataInici: "",
    dataFinal: "",
    diesSetmana: ["dilluns"],
    sessions: [],
    incidencies: []
  });
  data.grups.push(group);
  activeGroupId = group.id;
  saveData("Grup creat");
}

function updateGroupFromForm() {
  const group = activeGroup();
  if (!group) return;
  group.nivell = $("nivell").value;
  group.grup = $("grup").value.trim() || "A";
  group.assignatura = $("assignatura").value.trim();
  group.cursAcademic = data.cursAcademic;
  group.dataInici = $("dataInici").value;
  group.dataFinal = $("dataFinal").value;
  group.notesGenerals = $("notesGenerals").value.trim();
  group.diesSetmana = [...document.querySelectorAll('input[name="diesSetmana"]:checked')].map(x => x.value);
  group.dataModificacio = todayISO();
  recalculateGroup(group);
  saveData("Grup actualitzat");
}

function duplicateGroup(nextYear = false) {
  const group = activeGroup();
  if (!group) return;
  const copy = JSON.parse(JSON.stringify(group));
  copy.id = slug(`${group.nivell}-${group.grup}-${group.assignatura}-copia`);
  copy.grup = nextYear ? group.grup : `${group.grup} còpia`;
  copy.cursAcademic = nextYear ? nextAcademicYear(group.cursAcademic) : group.cursAcademic;
  copy.sessions = copy.sessions.map((s, i) => normalizeSession({
    ...s,
    id: `sessio-${cryptoId()}`,
    num: i + 1,
    estat: "prevista",
    dataPrevista: "",
    dataOriginal: "",
    dataReal: null,
    observacions: "",
    reprogramada: false,
    motiuReprogramacio: ""
  }, i));
  copy.incidencies = [];
  if (nextYear) {
    data.cursAcademic = copy.cursAcademic;
    copy.dataInici = "";
    copy.dataFinal = "";
  }
  data.grups.push(copy);
  activeGroupId = copy.id;
  saveData(nextYear ? "Planificació duplicada per al curs següent" : "Grup duplicat");
}

function nextAcademicYear(value) {
  const match = String(value).match(/(\d{4})\D+(\d{4})/);
  if (!match) return guessAcademicYear();
  return `${Number(match[1]) + 1}-${Number(match[2]) + 1}`;
}

function deleteGroup() {
  const group = activeGroup();
  if (!group) return;
  if (!confirm(`Vols eliminar el grup ${group.nivell} ${group.grup} · ${group.assignatura}?`)) return;
  data.grups = data.grups.filter(g => g.id !== group.id);
  activeGroupId = data.grups[0]?.id || null;
  saveData("Grup eliminat");
}

function addSession(session = {}) {
  const group = activeGroup();
  if (!group) return;
  const nextNum = group.sessions.length + 1;
  group.sessions.push(normalizeSession({ num: nextNum, titol: session.titol || `Sessió ${nextNum}`, ...session }, nextNum - 1));
  recalculateGroup(group);
  saveData("Sessió afegida");
}

function updateSession(id, patch) {
  const group = activeGroup();
  if (!group) return;
  const session = group.sessions.find(s => s.id === id);
  if (!session) return;
  Object.assign(session, patch);
  if (patch.estat === "feta" && !session.dataReal) session.dataReal = session.dataPrevista || todayISO();
  if (patch.estat && patch.estat !== "feta" && patch.estat !== "parcial" && patch.estat !== "substituïda") session.dataReal = null;
  recalculateGroup(group);
  saveData("Sessió actualitzada");
}

function deleteSession(id) {
  const group = activeGroup();
  if (!group) return;
  group.sessions = group.sessions.filter(s => s.id !== id).map((s, i) => ({ ...s, num: i + 1 }));
  recalculateGroup(group);
  saveData("Sessió eliminada");
}

function addIncidence() {
  const group = activeGroup();
  if (!group) return;
  const inc = normalizeIncidence({
    data: $("incData").value,
    tipus: $("incTipus").value,
    motiu: $("incMotiu").value.trim(),
    accio: $("incAccio").value,
    observacions: $("incObservacions").value.trim()
  });
  if (!inc.data) return alert("Cal indicar una data per a la incidència.");
  group.incidencies.push(inc);
  $("incData").value = "";
  $("incMotiu").value = "";
  $("incObservacions").value = "";
  recalculateGroup(group);
  saveData("Incidència afegida");
}

function deleteIncidence(id) {
  const group = activeGroup();
  if (!group) return;
  group.incidencies = group.incidencies.filter(i => i.id !== id);
  recalculateGroup(group);
  saveData("Incidència eliminada");
}

function recalculateGroup(group) {
  if (!group.dataInici || !group.dataFinal || !group.diesSetmana.length) return;
  const availableDays = generateClassDays(group);
  let dayIndex = 0;
  group.sessions.forEach(session => {
    if (session.estat === "feta") {
      if (!session.dataReal) session.dataReal = session.dataPrevista || null;
      return;
    }
    if (session.estat === "cancel·lada") return;
    const nextDate = availableDays[dayIndex] || "";
    if (!session.dataOriginal && nextDate) session.dataOriginal = nextDate;
    const oldDate = session.dataPrevista;
    session.dataPrevista = nextDate;
    session.reprogramada = Boolean(session.dataOriginal && session.dataPrevista && session.dataOriginal !== session.dataPrevista);
    if (session.reprogramada && oldDate !== nextDate) {
      session.motiuReprogramacio = "Reprogramada automàticament per incidències o canvis de calendari";
    }
    dayIndex++;
  });
}

function generateClassDays(group) {
  const start = parseDate(group.dataInici);
  const end = parseDate(group.dataFinal);
  if (!start || !end || start > end) return [];
  const generalBlocked = new Set(data.configuracio.diesNoLectiusGenerals || []);
  const groupBlocked = new Set(group.incidencies.filter(i => ["ajornar", "cancel·lar"].includes(i.accio)).map(i => i.data));
  const days = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toISODate(d);
    const weekday = WEEKDAYS[d.getDay()];
    if (group.diesSetmana.includes(weekday) && !generalBlocked.has(iso) && !groupBlocked.has(iso)) {
      days.push(iso);
    }
  }
  return days;
}

function parseDate(value) {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(value) {
  if (!value) return "Sense data";
  const date = parseDate(value);
  return date ? date.toLocaleDateString("ca-ES", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }) : value;
}

function escapeHtml(text) {
  return String(text || "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
}

function render() {
  renderGeneralConfig();
  renderGroups();
  renderGroupEditor();
  renderSessions();
  renderIncidences();
  renderStats();
  renderGlobalStats();
  renderDiagnostics();
}

function renderGeneralConfig() {
  $("cursAcademic").value = data.cursAcademic || "";
  $("nomCentre").value = data.configuracio.nomCentre || "";
  $("docent").value = data.configuracio.docent || "";
  $("diesNoLectiusGenerals").value = (data.configuracio.diesNoLectiusGenerals || []).join("\n");
}

function renderGroups() {
  const selector = $("groupSelector");
  selector.innerHTML = "";
  if (!data.grups.length) {
    selector.innerHTML = `<option>No hi ha cap grup creat</option>`;
    return;
  }
  data.grups.forEach(group => {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = `${group.nivell} ${group.grup} · ${group.assignatura || "Sense assignatura"}`;
    option.selected = group.id === activeGroupId;
    selector.appendChild(option);
  });
}

function renderGroupEditor() {
  const group = activeGroup();
  $("groupEditorCard").classList.toggle("hidden", !group);
  if (!group) return;
  $("nivell").value = group.nivell;
  $("grup").value = group.grup;
  $("assignatura").value = group.assignatura;
  $("dataInici").value = group.dataInici;
  $("dataFinal").value = group.dataFinal;
  $("notesGenerals").value = group.notesGenerals;
  document.querySelectorAll('input[name="diesSetmana"]').forEach(input => {
    input.checked = group.diesSetmana.includes(input.value);
  });
}

function renderSessions() {
  const group = activeGroup();
  const box = $("sessionsList");
  if (!group) {
    box.innerHTML = `<p>Crea un grup per començar.</p>`;
    return;
  }
  if (!group.sessions.length) {
    box.innerHTML = `<p>Encara no hi ha sessions. Pots afegir-ne una o crear-les en bloc.</p>`;
    return;
  }
  box.innerHTML = group.sessions.map(session => `
    <article class="session-card estat-${session.estat}">
      <header>
        <div>
          <h3>Sessió ${session.num}: ${escapeHtml(session.titol || "Sense títol")}</h3>
          <p><strong>Data prevista:</strong> ${formatDate(session.dataPrevista)} ${session.reprogramada ? " · reprogramada" : ""}</p>
          ${session.dataOriginal && session.dataOriginal !== session.dataPrevista ? `<p><strong>Data original:</strong> ${formatDate(session.dataOriginal)}</p>` : ""}
        </div>
        <button class="danger" type="button" data-action="delete-session" data-id="${session.id}">Elimina</button>
      </header>
      <div class="session-fields">
        <label>Títol
          <input data-action="edit-session" data-field="titol" data-id="${session.id}" value="${escapeHtml(session.titol)}">
        </label>
        <label>Estat
          <select data-action="edit-session" data-field="estat" data-id="${session.id}">
            ${STATES.map(state => `<option value="${state}" ${state === session.estat ? "selected" : ""}>${state}</option>`).join("")}
          </select>
        </label>
        <label class="wide">Què es treballarà?
          <textarea rows="2" data-action="edit-session" data-field="queEsTreballa" data-id="${session.id}">${escapeHtml(session.queEsTreballa)}</textarea>
        </label>
        <label>Objectiu
          <textarea rows="2" data-action="edit-session" data-field="objectiu" data-id="${session.id}">${escapeHtml(session.objectiu)}</textarea>
        </label>
        <label>Data real
          <input type="date" data-action="edit-session" data-field="dataReal" data-id="${session.id}" value="${session.dataReal || ""}">
        </label>
        <label>Activitats, una per línia
          <textarea rows="3" data-action="edit-session-list" data-field="activitats" data-id="${session.id}">${escapeHtml(listToText(session.activitats))}</textarea>
        </label>
        <label>Recursos, un per línia
          <textarea rows="3" data-action="edit-session-list" data-field="recursos" data-id="${session.id}">${escapeHtml(listToText(session.recursos))}</textarea>
        </label>
        <label class="wide">Observacions de seguiment
          <textarea rows="2" data-action="edit-session" data-field="observacions" data-id="${session.id}">${escapeHtml(session.observacions)}</textarea>
        </label>
      </div>
    </article>
  `).join("");
}

function renderIncidences() {
  const group = activeGroup();
  const box = $("incidencesList");
  if (!group || !group.incidencies.length) {
    box.innerHTML = `<p>No hi ha incidències registrades.</p>`;
    return;
  }
  box.innerHTML = group.incidencies.slice().sort((a, b) => a.data.localeCompare(b.data)).map(inc => `
    <article class="incidence-card">
      <header>
        <div>
          <h3>${formatDate(inc.data)} · ${escapeHtml(inc.motiu || inc.tipus)}</h3>
          <p>${escapeHtml(inc.tipus)} · acció: ${escapeHtml(inc.accio)}</p>
          ${inc.observacions ? `<p>${escapeHtml(inc.observacions)}</p>` : ""}
        </div>
        <button class="danger" type="button" data-action="delete-incidence" data-id="${inc.id}">Elimina</button>
      </header>
    </article>
  `).join("");
}

function statsForGroup(group) {
  if (!group) return {};
  const total = group.sessions.length;
  const count = (state) => group.sessions.filter(s => s.estat === state).length;
  const fetes = count("feta");
  const parcials = count("parcial");
  const aprofitament = total ? Math.round(((fetes + parcials * 0.5) / total) * 1000) / 10 : 0;
  return {
    total,
    fetes,
    parcials,
    previstes: count("prevista"),
    ajornades: count("ajornada"),
    cancelades: count("cancel·lada"),
    substituides: count("substituïda"),
    incidencies: group.incidencies.length,
    reprogramades: group.sessions.filter(s => s.reprogramada).length,
    aprofitament
  };
}

function renderStats() {
  const group = activeGroup();
  const s = statsForGroup(group);
  $("statsPanel").innerHTML = group ? [
    ["Sessions", s.total], ["Fetes", s.fetes], ["Parcials", s.parcials], ["Previstes", s.previstes],
    ["Ajornades", s.ajornades], ["Cancel·lades", s.cancelades], ["Substituïdes", s.substituides],
    ["Incidències", s.incidencies], ["Reprogramades", s.reprogramades], ["Aprofitament", `${s.aprofitament}%`]
  ].map(([label, value]) => `<div class="stat-box"><strong>${value}</strong><span>${label}</span></div>`).join("") : `<p>Crea o selecciona un grup.</p>`;
}

function renderGlobalStats() {
  const totalSessions = data.grups.reduce((sum, g) => sum + g.sessions.length, 0);
  const totalInc = data.grups.reduce((sum, g) => sum + g.incidencies.length, 0);
  $("globalStats").innerHTML = `
    <div class="stat-box"><strong>${data.grups.length}</strong><span>Grups</span></div>
    <div class="stat-box"><strong>${totalSessions}</strong><span>Sessions</span></div>
    <div class="stat-box"><strong>${totalInc}</strong><span>Incidències</span></div>
    <div class="stat-box"><strong>${data.cursAcademic}</strong><span>Curs</span></div>
  `;
}

function renderDiagnostics() {
  const localOk = testLocalStorage();
  const swOk = "serviceWorker" in navigator;
  const online = navigator.onLine;
  $("diagnostics").innerHTML = `
    <div class="diag-box"><strong>${swOk ? "Sí" : "No"}</strong><span>Service worker disponible</span></div>
    <div class="diag-box"><strong>${online ? "Online" : "Offline"}</strong><span>Connexió actual</span></div>
    <div class="diag-box"><strong>${localOk ? "Sí" : "No"}</strong><span>localStorage</span></div>
    <div class="diag-box"><strong>${localStorage.getItem(STORAGE_KEY) ? "Sí" : "No"}</strong><span>Dades locals</span></div>
    <div class="diag-box"><strong>${APP_VERSION}</strong><span>Versió</span></div>
    <div class="diag-box"><strong>${data.app.dataModificacio || "-"}</strong><span>Últim canvi</span></div>
  `;
}

function testLocalStorage() {
  try {
    localStorage.setItem("__test", "1");
    localStorage.removeItem("__test");
    return true;
  } catch {
    return false;
  }
}

function exportJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (imported.grups) {
        if (!confirm("Vols substituir les dades locals per aquest fitxer?")) return;
        data = normalizeData(imported);
        activeGroupId = data.grups[0]?.id || null;
      } else if (imported.sessions || imported.assignatura) {
        data.grups.push(normalizeGroup(imported));
        activeGroupId = data.grups.at(-1).id;
      } else {
        alert("Aquest JSON no sembla una planificació vàlida.");
        return;
      }
      saveData("JSON importat");
    } catch (error) {
      alert("No s'ha pogut importar el JSON.");
      console.error(error);
    }
  };
  reader.readAsText(file);
}

function buildSummaryHtml(group) {
  if (!group) return "";
  const s = statsForGroup(group);
  return `
    <h2>Resum de curs</h2>
    <p><strong>${escapeHtml(group.nivell)} ${escapeHtml(group.grup)} · ${escapeHtml(group.assignatura)}</strong></p>
    <p>Curs acadèmic: ${escapeHtml(group.cursAcademic)} · Del ${formatDate(group.dataInici)} al ${formatDate(group.dataFinal)}</p>
    <h3>Estadístiques</h3>
    <ul>
      <li>Total de sessions: ${s.total}</li>
      <li>Fetes: ${s.fetes}</li>
      <li>Parcials: ${s.parcials}</li>
      <li>Ajornades: ${s.ajornades}</li>
      <li>Cancel·lades: ${s.cancelades}</li>
      <li>Substituïdes: ${s.substituides}</li>
      <li>Reprogramades: ${s.reprogramades}</li>
      <li>Aprofitament estimat: ${s.aprofitament}%</li>
    </ul>
    <h3>Sessions</h3>
    ${group.sessions.map(session => `
      <article>
        <h4>Sessió ${session.num}: ${escapeHtml(session.titol)}</h4>
        <p><strong>Data prevista:</strong> ${formatDate(session.dataPrevista)} · <strong>Estat:</strong> ${escapeHtml(session.estat)}</p>
        ${session.queEsTreballa ? `<p><strong>Què es treballarà:</strong> ${escapeHtml(session.queEsTreballa)}</p>` : ""}
        ${session.objectiu ? `<p><strong>Objectiu:</strong> ${escapeHtml(session.objectiu)}</p>` : ""}
        ${session.observacions ? `<p><strong>Observacions:</strong> ${escapeHtml(session.observacions)}</p>` : ""}
      </article>
    `).join("")}
  `;
}

function printSummary() {
  const html = buildSummaryHtml(activeGroup());
  $("printArea").innerHTML = html;
  $("printArea").classList.remove("hidden");
  window.print();
}

function bindEvents() {
  $("btnSave").addEventListener("click", () => saveData("Desat manualment"));
  $("btnNewGroup").addEventListener("click", createGroup);
  $("btnUpdateGroup").addEventListener("click", updateGroupFromForm);
  $("btnRecalculate").addEventListener("click", () => { const g = activeGroup(); if (g) { recalculateGroup(g); saveData("Dates recalculades"); } });
  $("btnDuplicateGroup").addEventListener("click", () => duplicateGroup(false));
  $("btnNextYear").addEventListener("click", () => duplicateGroup(true));
  $("btnDeleteGroup").addEventListener("click", deleteGroup);
  $("btnAddSession").addEventListener("click", () => addSession());
  $("btnAddIncidence").addEventListener("click", addIncidence);
  $("btnExportAll").addEventListener("click", () => exportJson(data, `planificador-docent-${data.cursAcademic}.json`));
  $("btnExportGroup").addEventListener("click", () => { const g = activeGroup(); if (g) exportJson(g, `${slug(`${g.nivell}-${g.grup}-${g.assignatura}`)}.json`); });
  $("btnPrintSummary").addEventListener("click", printSummary);
  $("btnDiagnostics").addEventListener("click", renderDiagnostics);
  $("groupSelector").addEventListener("change", (e) => { activeGroupId = e.target.value; render(); });
  $("importFile").addEventListener("change", (e) => e.target.files[0] && importJson(e.target.files[0]));
  $("btnBulkSessions").addEventListener("click", () => $("bulkDialog").showModal());
  $("btnConfirmBulk").addEventListener("click", () => {
    const lines = $("bulkText").value.split("\n").map(x => x.trim()).filter(Boolean);
    lines.forEach(line => {
      const [titol, queEsTreballa, objectiu] = line.split(";").map(x => x?.trim() || "");
      addSession({ titol, queEsTreballa, objectiu });
    });
    $("bulkText").value = "";
    $("bulkDialog").close();
    saveData("Sessions creades");
  });

  ["cursAcademic", "nomCentre", "docent", "diesNoLectiusGenerals"].forEach(id => {
    $(id).addEventListener("change", () => {
      data.cursAcademic = $("cursAcademic").value.trim() || guessAcademicYear();
      data.configuracio.nomCentre = $("nomCentre").value.trim();
      data.configuracio.docent = $("docent").value.trim();
      data.configuracio.diesNoLectiusGenerals = $("diesNoLectiusGenerals").value.split("\n").map(x => x.trim()).filter(Boolean);
      data.grups.forEach(recalculateGroup);
      saveData("Configuració actualitzada");
    });
  });

  document.body.addEventListener("change", (e) => {
    const target = e.target;
    if (target.dataset.action === "edit-session") {
      updateSession(target.dataset.id, { [target.dataset.field]: target.value || null });
    }
    if (target.dataset.action === "edit-session-list") {
      updateSession(target.dataset.id, { [target.dataset.field]: stringToList(target.value) });
    }
  });

  document.body.addEventListener("click", (e) => {
    const button = e.target.closest("button");
    if (!button) return;
    if (button.dataset.action === "delete-session") deleteSession(button.dataset.id);
    if (button.dataset.action === "delete-incidence") deleteIncidence(button.dataset.id);
  });

  $("btnClearData").addEventListener("click", () => {
    if (!confirm("Aquesta acció eliminarà totes les planificacions desades en aquest navegador. Vols continuar?")) return;
    localStorage.removeItem(STORAGE_KEY);
    data = defaultData();
    activeGroupId = null;
    render();
  });

  $("btnClearCache").addEventListener("click", async () => {
    if (!("caches" in window)) return alert("Aquest navegador no informa de cap cache disponible.");
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    alert("Cache esborrada. Recarrega l'aplicació.");
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    installPrompt = e;
    $("btnInstall").classList.remove("hidden");
  });
  $("btnInstall").addEventListener("click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    $("btnInstall").classList.add("hidden");
  });

  window.addEventListener("online", renderDiagnostics);
  window.addEventListener("offline", renderDiagnostics);
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("sw.js");
  } catch (error) {
    console.warn("No s'ha pogut registrar el service worker", error);
  }
}

bindEvents();
render();
registerServiceWorker();
