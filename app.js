const STORAGE_KEY = "planificadorDocentSessions.v030";
const OLD_STORAGE_KEYS = ["planificadorDocentSessions.v020", "planificadorDocentSessions.v010"];
const APP_VERSION = "0.3.0";
const WEEKDAYS = ["diumenge", "dilluns", "dimarts", "dimecres", "dijous", "divendres", "dissabte"];
const CLASS_DAYS = ["dilluns", "dimarts", "dimecres", "dijous", "divendres"];
const STATES = ["prevista", "feta", "parcial", "ajornada", "cancel·lada", "substituïda"];
const INCIDENCE_TYPES = ["vaga", "falta_docent", "sortida", "festa", "activitat_centre", "avaluacio", "altres"];
let installPrompt = null;
let currentFilter = "totes";
let timelineMode = "sessions";
let calendarCursor = new Date();

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
    const raw = localStorage.getItem(STORAGE_KEY) || OLD_STORAGE_KEYS.map(k => localStorage.getItem(k)).find(Boolean);
    if (!raw) return defaultData();
    const loaded = normalizeData(JSON.parse(raw));
    loaded.app.versio = APP_VERSION;
    return loaded;
  } catch (error) {
    console.error(error);
    return defaultData();
  }
}

function normalizeData(input = {}) {
  const base = defaultData();
  const merged = { ...base, ...input };
  merged.app = { ...base.app, ...(input.app || {}), versio: APP_VERSION };
  merged.configuracio = { ...base.configuracio, ...(input.configuracio || {}) };
  merged.configuracio.diesNoLectiusGenerals = Array.isArray(merged.configuracio.diesNoLectiusGenerals) ? merged.configuracio.diesNoLectiusGenerals : [];
  merged.grups = Array.isArray(input.grups) ? input.grups.map(normalizeGroup) : [];
  return merged;
}

function normalizeGroup(group = {}) {
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
    dataModificacio: group.dataModificacio || todayISO(),
    etiquetes: Array.isArray(group.etiquetes) ? group.etiquetes : []
  };
}

function normalizeSession(session = {}, index = 0) {
  return {
    id: session.id || `sessio-${cryptoId()}`,
    num: session.num || index + 1,
    titol: session.titol || "",
    bloc: session.bloc || "",
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
    substitucio: session.substitucio || { hiHaSubstitucio: false, descripcio: "" },
    foraCalendari: Boolean(session.foraCalendari)
  };
}

function normalizeIncidence(inc = {}) {
  return {
    id: inc.id || `inc-${cryptoId()}`,
    data: inc.data || "",
    motiu: inc.motiu || "",
    tipus: INCIDENCE_TYPES.includes(inc.tipus) ? inc.tipus : "altres",
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

function todayISO() { return new Date().toISOString().slice(0, 10); }

function guessAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const start = month >= 8 ? year : year - 1;
  return `${start}-${start + 1}`;
}

function cryptoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID().slice(0, 8);
  return Math.random().toString(36).slice(2, 10);
}

function slug(text) {
  return String(text).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + cryptoId();
}

function stringToList(text) { return String(text || "").split(/[\n,;]/).map(x => x.trim()).filter(Boolean); }
function listToText(list) { return Array.isArray(list) ? list.join("\n") : ""; }
function activeGroup() { return data.grups.find(g => g.id === activeGroupId) || data.grups[0] || null; }

function createGroup() {
  const group = normalizeGroup({
    nivell: "1r ESO", grup: "A", assignatura: "Nova assignatura", cursAcademic: data.cursAcademic,
    dataInici: "", dataFinal: "", diesSetmana: ["dilluns"], sessions: [], incidencies: []
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
  copy.id = slug(`${group.nivell}-${group.grup}-${group.assignatura}-${nextYear ? "curs-seguent" : "copia"}`);
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
    motiuReprogramacio: "",
    foraCalendari: false
  }, i));
  copy.incidencies = [];
  if (nextYear) {
    data.cursAcademic = copy.cursAcademic;
    copy.dataInici = "";
    copy.dataFinal = "";
  }
  data.grups.push(copy);
  activeGroupId = copy.id;
  saveData(nextYear ? "Planificació preparada per al curs següent" : "Grup duplicat");
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
  if (["parcial", "substituïda"].includes(patch.estat) && !session.dataReal) session.dataReal = session.dataPrevista || todayISO();
  if (patch.estat && !["feta", "parcial", "substituïda"].includes(patch.estat)) session.dataReal = null;
  recalculateGroup(group);
  saveData("Sessió actualitzada");
}

function moveSession(id, direction) {
  const group = activeGroup();
  if (!group) return;
  const index = group.sessions.findIndex(s => s.id === id);
  const newIndex = index + direction;
  if (index < 0 || newIndex < 0 || newIndex >= group.sessions.length) return;
  [group.sessions[index], group.sessions[newIndex]] = [group.sessions[newIndex], group.sessions[index]];
  group.sessions = group.sessions.map((s, i) => ({ ...s, num: i + 1 }));
  recalculateGroup(group);
  saveData("Ordre de sessions actualitzat");
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
    session.foraCalendari = false;
    if (["feta", "parcial", "substituïda"].includes(session.estat) && session.dataReal) return;
    if (session.estat === "cancel·lada") return;
    const nextDate = availableDays[dayIndex] || "";
    if (!session.dataOriginal && nextDate) session.dataOriginal = nextDate;
    const oldDate = session.dataPrevista;
    session.dataPrevista = nextDate;
    session.foraCalendari = !nextDate;
    session.reprogramada = Boolean(session.dataOriginal && session.dataPrevista && session.dataOriginal !== session.dataPrevista);
    if (session.reprogramada && oldDate !== nextDate) session.motiuReprogramacio = "Reprogramada automàticament per incidències o canvis de calendari";
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
    if (group.diesSetmana.includes(weekday) && !generalBlocked.has(iso) && !groupBlocked.has(iso)) days.push(iso);
  }
  return days;
}

function parseDate(value) { if (!value) return null; const [y, m, d] = value.split("-").map(Number); return new Date(y, m - 1, d); }
function toISODate(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function formatDate(value) { if (!value) return "Sense data"; const date = parseDate(value); return date ? date.toLocaleDateString("ca-ES", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }) : value; }
function escapeHtml(text) { return String(text || "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c])); }

function render() {
  renderGeneralConfig(); renderGroups(); renderGroupEditor(); renderAlerts(); renderSessions(); renderCalendar(); renderTimeline(); renderIncidences(); renderStats(); renderGlobalStats(); renderDiagnostics();
}

function renderGeneralConfig() {
  $("cursAcademic").value = data.cursAcademic || "";
  $("nomCentre").value = data.configuracio.nomCentre || "";
  $("docent").value = data.configuracio.docent || "";
  $("diesNoLectiusGenerals").value = (data.configuracio.diesNoLectiusGenerals || []).join("\n");
}

function renderGroups() {
  const selector = $("groupSelector"); selector.innerHTML = "";
  if (!data.grups.length) { selector.innerHTML = `<option>No hi ha cap grup creat</option>`; return; }
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
  $("nivell").value = group.nivell; $("grup").value = group.grup; $("assignatura").value = group.assignatura;
  $("dataInici").value = group.dataInici; $("dataFinal").value = group.dataFinal; $("notesGenerals").value = group.notesGenerals;
  document.querySelectorAll('input[name="diesSetmana"]').forEach(input => { input.checked = group.diesSetmana.includes(input.value); });
}

function renderAlerts() {
  const group = activeGroup(); const box = $("alertsPanel");
  if (!box) return;
  if (!group) { box.innerHTML = `<p>Crea un grup per veure avisos.</p>`; return; }
  const warnings = [];
  if (!group.dataInici || !group.dataFinal) warnings.push("Falten les dates d'inici o final del grup.");
  if (!group.diesSetmana.length) warnings.push("No hi ha dies de classe seleccionats.");
  const fora = group.sessions.filter(s => s.foraCalendari).length;
  if (fora) warnings.push(`${fora} sessió/ns han quedat fora del calendari disponible.`);
  const senseData = group.sessions.filter(s => !s.dataPrevista && s.estat !== "cancel·lada").length;
  if (senseData) warnings.push(`${senseData} sessió/ns encara no tenen data prevista.`);
  const incidenciesSenseMotiu = group.incidencies.filter(i => !i.motiu).length;
  if (incidenciesSenseMotiu) warnings.push(`${incidenciesSenseMotiu} incidència/es no tenen motiu escrit.`);
  box.innerHTML = warnings.length ? warnings.map(w => `<div class="alert-box">${escapeHtml(w)}</div>`).join("") : `<div class="ok-box">No hi ha avisos importants per a aquest grup.</div>`;
}

function filteredSessions(group) {
  if (!group) return [];
  let sessions = group.sessions.slice();
  if (currentFilter !== "totes") sessions = sessions.filter(s => s.estat === currentFilter || (currentFilter === "reprogramades" && s.reprogramada) || (currentFilter === "fora" && s.foraCalendari));
  return sessions;
}

function renderSessions() {
  const group = activeGroup(); const box = $("sessionsList");
  if (!group) { box.innerHTML = `<p>Crea un grup per començar.</p>`; return; }
  const sessions = filteredSessions(group);
  if (!group.sessions.length) { box.innerHTML = `<p>Encara no hi ha sessions. Pots afegir-ne una o crear-les en bloc.</p>`; return; }
  if (!sessions.length) { box.innerHTML = `<p>No hi ha sessions amb aquest filtre.</p>`; return; }
  box.innerHTML = sessions.map(session => `
    <article class="session-card estat-${session.estat} ${session.foraCalendari ? "fora-calendari" : ""}">
      <header>
        <div>
          <h3>Sessió ${session.num}: ${escapeHtml(session.titol || "Sense títol")}</h3>
          <p><strong>Data prevista:</strong> ${formatDate(session.dataPrevista)} ${session.reprogramada ? " · reprogramada" : ""} ${session.foraCalendari ? " · fora de calendari" : ""}</p>
          ${session.dataOriginal && session.dataOriginal !== session.dataPrevista ? `<p><strong>Data original:</strong> ${formatDate(session.dataOriginal)}</p>` : ""}
          ${session.dataReal ? `<p><strong>Data real:</strong> ${formatDate(session.dataReal)}</p>` : ""}
        </div>
        <div class="mini-actions">
          <button class="secondary" type="button" data-action="move-up" data-id="${session.id}">↑</button>
          <button class="secondary" type="button" data-action="move-down" data-id="${session.id}">↓</button>
          <button class="danger" type="button" data-action="delete-session" data-id="${session.id}">Elimina</button>
        </div>
      </header>
      <div class="session-fields">
        <label>Títol<input data-action="edit-session" data-field="titol" data-id="${session.id}" value="${escapeHtml(session.titol)}"></label>
        <label>Bloc o unitat<input data-action="edit-session" data-field="bloc" data-id="${session.id}" value="${escapeHtml(session.bloc)}" placeholder="Opcional"></label>
        <label>Estat<select data-action="edit-session" data-field="estat" data-id="${session.id}">${STATES.map(state => `<option value="${state}" ${state === session.estat ? "selected" : ""}>${state}</option>`).join("")}</select></label>
        <label>Data real<input type="date" data-action="edit-session" data-field="dataReal" data-id="${session.id}" value="${session.dataReal || ""}"></label>
        <label class="wide">Què es treballarà?<textarea rows="2" data-action="edit-session" data-field="queEsTreballa" data-id="${session.id}">${escapeHtml(session.queEsTreballa)}</textarea></label>
        <label>Objectiu<textarea rows="2" data-action="edit-session" data-field="objectiu" data-id="${session.id}">${escapeHtml(session.objectiu)}</textarea></label>
        <label>Activitats, una per línia<textarea rows="3" data-action="edit-session-list" data-field="activitats" data-id="${session.id}">${escapeHtml(listToText(session.activitats))}</textarea></label>
        <label>Recursos, un per línia<textarea rows="3" data-action="edit-session-list" data-field="recursos" data-id="${session.id}">${escapeHtml(listToText(session.recursos))}</textarea></label>
        <label class="wide">Observacions de seguiment<textarea rows="2" data-action="edit-session" data-field="observacions" data-id="${session.id}">${escapeHtml(session.observacions)}</textarea></label>
      </div>
    </article>`).join("");
}


function renderCalendar() {
  const group = activeGroup();
  const grid = $("calendarGrid");
  const title = $("calendarTitle");
  const details = $("calendarDetails");
  if (!grid || !title || !details) return;
  if (!group) {
    title.textContent = "Calendari";
    grid.innerHTML = `<p>Crea un grup per veure el calendari mensual.</p>`;
    details.innerHTML = "";
    return;
  }
  if (!calendarCursor || Number.isNaN(calendarCursor.getTime())) calendarCursor = group.dataInici ? parseDate(group.dataInici) : new Date();
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  title.textContent = calendarCursor.toLocaleDateString("ca-ES", { month: "long", year: "numeric" });
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(first);
  start.setDate(first.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 41);
  const sessionsByDate = group.sessions.reduce((map, session) => {
    if (!session.dataPrevista) return map;
    (map[session.dataPrevista] ||= []).push(session);
    return map;
  }, {});
  const incidencesByDate = group.incidencies.reduce((map, inc) => {
    if (!inc.data) return map;
    (map[inc.data] ||= []).push(inc);
    return map;
  }, {});
  const generalBlocked = new Set(data.configuracio.diesNoLectiusGenerals || []);
  const today = todayISO();
  const weekdayNames = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];
  const cells = weekdayNames.map(day => `<div class="calendar-weekday">${day}</div>`);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = toISODate(d);
    const inMonth = d.getMonth() === month;
    const sessions = sessionsByDate[iso] || [];
    const incs = incidencesByDate[iso] || [];
    const weekday = WEEKDAYS[d.getDay()];
    const isClassDay = group.diesSetmana.includes(weekday);
    const isGeneralBlocked = generalBlocked.has(iso);
    const classes = ["calendar-day", inMonth ? "" : "muted-month", isClassDay ? "class-day" : "", iso === today ? "today" : "", (incs.length || isGeneralBlocked) ? "blocked" : ""].filter(Boolean).join(" ");
    const sessionHtml = sessions.slice(0, 3).map(s => `<button class="calendar-event estat-${s.estat}" type="button" data-action="show-calendar-day" data-date="${iso}">S${s.num} · ${escapeHtml(s.titol || s.estat)}</button>`).join("");
    const more = sessions.length > 3 ? `<button class="calendar-more" type="button" data-action="show-calendar-day" data-date="${iso}">+${sessions.length - 3} més</button>` : "";
    const incHtml = incs.length ? `<button class="calendar-inc" type="button" data-action="show-calendar-day" data-date="${iso}">Incidència</button>` : "";
    const generalHtml = isGeneralBlocked ? `<button class="calendar-inc" type="button" data-action="show-calendar-day" data-date="${iso}">No lectiu</button>` : "";
    cells.push(`<div class="${classes}" data-date="${iso}"><button class="calendar-date" type="button" data-action="show-calendar-day" data-date="${iso}">${d.getDate()}</button>${sessionHtml}${more}${incHtml}${generalHtml}</div>`);
  }
  grid.innerHTML = cells.join("");
  const monthSessions = group.sessions.filter(s => s.dataPrevista && parseDate(s.dataPrevista)?.getMonth() === month && parseDate(s.dataPrevista)?.getFullYear() === year);
  const monthInc = group.incidencies.filter(i => i.data && parseDate(i.data)?.getMonth() === month && parseDate(i.data)?.getFullYear() === year);
  details.innerHTML = `<div class="calendar-summary"><span class="pill">Sessions del mes: ${monthSessions.length}</span><span class="pill">Incidències: ${monthInc.length}</span><span class="pill">Dies de classe: ${group.diesSetmana.join(", ") || "cap"}</span></div>`;
}

function changeCalendarMonth(delta) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + delta, 1);
  renderCalendar();
}

function setCalendarToToday() {
  calendarCursor = new Date();
  renderCalendar();
}

function showCalendarDay(iso) {
  const group = activeGroup();
  const details = $("calendarDetails");
  if (!group || !details) return;
  const sessions = group.sessions.filter(s => s.dataPrevista === iso);
  const incidencies = group.incidencies.filter(i => i.data === iso);
  const general = (data.configuracio.diesNoLectiusGenerals || []).includes(iso);
  const weekday = WEEKDAYS[parseDate(iso).getDay()];
  const sessionHtml = sessions.length ? sessions.map(s => `<li><strong>Sessió ${s.num}: ${escapeHtml(s.titol || "Sense títol")}</strong> · ${escapeHtml(s.estat)}${s.queEsTreballa ? `<br><span>${escapeHtml(s.queEsTreballa)}</span>` : ""}</li>`).join("") : `<li>No hi ha sessions previstes.</li>`;
  const incHtml = incidencies.length ? incidencies.map(i => `<li>${escapeHtml(i.motiu || i.tipus)} · ${escapeHtml(i.accio)}</li>`).join("") : "";
  details.innerHTML = `<div class="calendar-day-detail"><h3>${formatDate(iso)}</h3><p>${group.diesSetmana.includes(weekday) ? "Dia de classe configurat" : "No és un dia de classe configurat"}${general ? " · dia no lectiu general" : ""}</p><h4>Sessions</h4><ul>${sessionHtml}</ul>${incidencies.length || general ? `<h4>Incidències o bloquejos</h4><ul>${incHtml}${general ? "<li>Dia no lectiu general</li>" : ""}</ul>` : ""}</div>`;
}

function renderTimeline() {
  const group = activeGroup(); const box = $("timelineList");
  if (!box) return;
  if (!group) { box.innerHTML = `<p>Crea un grup per veure la línia temporal.</p>`; return; }
  let items = [];
  if (timelineMode === "sessions") {
    items = group.sessions.filter(s => s.dataPrevista).map(s => ({ data: s.dataPrevista, tipus: "sessio", html: `<strong>${formatDate(s.dataPrevista)}</strong> · Sessió ${s.num}: ${escapeHtml(s.titol || "Sense títol")} · <span class="pill small">${escapeHtml(s.estat)}</span>` }));
  } else {
    items = group.incidencies.map(i => ({ data: i.data, tipus: "incidencia", html: `<strong>${formatDate(i.data)}</strong> · ${escapeHtml(i.motiu || i.tipus)} · <span class="pill small">${escapeHtml(i.accio)}</span>` }));
  }
  items.sort((a, b) => a.data.localeCompare(b.data));
  box.innerHTML = items.length ? items.map(item => `<div class="timeline-item ${item.tipus}">${item.html}</div>`).join("") : `<p>No hi ha elements per mostrar.</p>`;
}

function renderIncidences() {
  const group = activeGroup(); const box = $("incidencesList");
  if (!group || !group.incidencies.length) { box.innerHTML = `<p>No hi ha incidències registrades.</p>`; return; }
  box.innerHTML = group.incidencies.slice().sort((a, b) => a.data.localeCompare(b.data)).map(inc => `
    <article class="incidence-card">
      <header><div><h3>${formatDate(inc.data)} · ${escapeHtml(inc.motiu || inc.tipus)}</h3><p>${escapeHtml(inc.tipus)} · acció: ${escapeHtml(inc.accio)}</p>${inc.observacions ? `<p>${escapeHtml(inc.observacions)}</p>` : ""}</div>
      <button class="danger" type="button" data-action="delete-incidence" data-id="${inc.id}">Elimina</button></header>
    </article>`).join("");
}

function statsForGroup(group) {
  if (!group) return {};
  const total = group.sessions.length; const count = (state) => group.sessions.filter(s => s.estat === state).length;
  const fetes = count("feta"); const parcials = count("parcial");
  const aprofitament = total ? Math.round(((fetes + parcials * 0.5) / total) * 1000) / 10 : 0;
  const byInc = Object.fromEntries(INCIDENCE_TYPES.map(t => [t, group.incidencies.filter(i => i.tipus === t).length]));
  const foraCalendari = group.sessions.filter(s => s.foraCalendari).length;
  return { total, fetes, parcials, previstes: count("prevista"), ajornades: count("ajornada"), cancelades: count("cancel·lada"), substituides: count("substituïda"), incidencies: group.incidencies.length, reprogramades: group.sessions.filter(s => s.reprogramada).length, foraCalendari, aprofitament, byInc };
}

function renderStats() {
  const group = activeGroup(); const s = statsForGroup(group);
  $("statsPanel").innerHTML = group ? [
    ["Sessions", s.total], ["Fetes", s.fetes], ["Parcials", s.parcials], ["Previstes", s.previstes], ["Ajornades", s.ajornades], ["Cancel·lades", s.cancelades], ["Substituïdes", s.substituides], ["Incidències", s.incidencies], ["Reprogramades", s.reprogramades], ["Fora calendari", s.foraCalendari], ["Aprofitament", `${s.aprofitament}%`]
  ].map(([label, value]) => `<div class="stat-box"><strong>${value}</strong><span>${label}</span></div>`).join("") + renderIncidenceStats(s) : `<p>Crea o selecciona un grup.</p>`;
}

function renderIncidenceStats(s) {
  const labels = { vaga: "Vagues", falta_docent: "Faltes docent", sortida: "Sortides", festa: "Festes", activitat_centre: "Activitats centre", avaluacio: "Avaluacions", altres: "Altres" };
  return `<div class="stat-wide"><h3>Incidències per tipus</h3>${INCIDENCE_TYPES.map(t => `<span class="pill">${labels[t]}: ${s.byInc[t]}</span>`).join(" ")}</div>`;
}

function renderGlobalStats() {
  const totalSessions = data.grups.reduce((sum, g) => sum + g.sessions.length, 0);
  const totalInc = data.grups.reduce((sum, g) => sum + g.incidencies.length, 0);
  $("globalStats").innerHTML = `<div class="stat-box"><strong>${data.grups.length}</strong><span>Grups</span></div><div class="stat-box"><strong>${totalSessions}</strong><span>Sessions</span></div><div class="stat-box"><strong>${totalInc}</strong><span>Incidències</span></div><div class="stat-box"><strong>${data.cursAcademic}</strong><span>Curs</span></div>`;
}

async function cacheCount() { if (!("caches" in window)) return "No disponible"; const keys = await caches.keys(); return keys.length; }
function renderDiagnostics() {
  const localOk = testLocalStorage(); const swOk = "serviceWorker" in navigator; const online = navigator.onLine;
  $("diagnostics").innerHTML = `<div class="diag-box"><strong>${swOk ? "Sí" : "No"}</strong><span>Service worker disponible</span></div><div class="diag-box"><strong>${online ? "Online" : "Offline"}</strong><span>Connexió actual</span></div><div class="diag-box"><strong>${localOk ? "Sí" : "No"}</strong><span>localStorage</span></div><div class="diag-box"><strong>${localStorage.getItem(STORAGE_KEY) ? "Sí" : "No"}</strong><span>Dades locals v0.3</span></div><div class="diag-box"><strong>${APP_VERSION}</strong><span>Versió</span></div><div class="diag-box"><strong>${data.app.dataModificacio || "-"}</strong><span>Últim canvi</span></div>`;
  cacheCount().then(n => { const el = $("cacheCount"); if (el) el.textContent = n; });
}
function testLocalStorage() { try { localStorage.setItem("__test", "1"); localStorage.removeItem("__test"); return true; } catch { return false; } }

function exportJson(payload, filename) { const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); URL.revokeObjectURL(a.href); }

function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (imported.grups) {
        const mode = confirm("D'acord = substituir dades locals. Cancel·la = afegir aquests grups com a còpia.");
        if (mode) { data = normalizeData(imported); activeGroupId = data.grups[0]?.id || null; }
        else { normalizeData(imported).grups.forEach(g => { g.id = slug(`${g.nivell}-${g.grup}-${g.assignatura}-importat`); data.grups.push(g); }); activeGroupId = data.grups.at(-1)?.id || activeGroupId; }
      } else if (imported.sessions || imported.assignatura) {
        const g = normalizeGroup(imported); g.id = slug(`${g.nivell}-${g.grup}-${g.assignatura}-importat`); data.grups.push(g); activeGroupId = g.id;
      } else { alert("Aquest JSON no sembla una planificació vàlida."); return; }
      data.grups.forEach(recalculateGroup); saveData("JSON importat");
    } catch (error) { alert("No s'ha pogut importar el JSON."); console.error(error); }
  };
  reader.readAsText(file);
}

function buildSummaryHtml(group) {
  if (!group) return ""; const s = statsForGroup(group);
  return `<h2>Resum de curs</h2><p><strong>${escapeHtml(group.nivell)} ${escapeHtml(group.grup)} · ${escapeHtml(group.assignatura)}</strong></p><p>Curs acadèmic: ${escapeHtml(group.cursAcademic)} · Del ${formatDate(group.dataInici)} al ${formatDate(group.dataFinal)}</p>${data.configuracio.nomCentre ? `<p>Centre: ${escapeHtml(data.configuracio.nomCentre)}</p>` : ""}${data.configuracio.docent ? `<p>Docent: ${escapeHtml(data.configuracio.docent)}</p>` : ""}<h3>Estadístiques</h3><ul><li>Total de sessions: ${s.total}</li><li>Fetes: ${s.fetes}</li><li>Parcials: ${s.parcials}</li><li>Ajornades: ${s.ajornades}</li><li>Cancel·lades: ${s.cancelades}</li><li>Substituïdes: ${s.substituides}</li><li>Reprogramades: ${s.reprogramades}</li><li>Fora de calendari: ${s.foraCalendari}</li><li>Aprofitament estimat: ${s.aprofitament}%</li></ul><h3>Incidències</h3>${group.incidencies.length ? group.incidencies.map(i => `<p>${formatDate(i.data)} · ${escapeHtml(i.tipus)} · ${escapeHtml(i.motiu || "Sense motiu")}</p>`).join("") : "<p>No n'hi ha.</p>"}<h3>Sessions</h3>${group.sessions.map(session => `<article><h4>Sessió ${session.num}: ${escapeHtml(session.titol)}</h4><p><strong>Data prevista:</strong> ${formatDate(session.dataPrevista)} · <strong>Estat:</strong> ${escapeHtml(session.estat)}</p>${session.bloc ? `<p><strong>Bloc:</strong> ${escapeHtml(session.bloc)}</p>` : ""}${session.queEsTreballa ? `<p><strong>Què es treballarà:</strong> ${escapeHtml(session.queEsTreballa)}</p>` : ""}${session.objectiu ? `<p><strong>Objectiu:</strong> ${escapeHtml(session.objectiu)}</p>` : ""}${session.observacions ? `<p><strong>Observacions:</strong> ${escapeHtml(session.observacions)}</p>` : ""}</article>`).join("")}`;
}
function printSummary() { const html = buildSummaryHtml(activeGroup()); $("printArea").innerHTML = html; $("printArea").classList.remove("hidden"); window.print(); }

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
  $("btnExportAll").addEventListener("click", () => exportJson(data, `planificador-docent-${data.cursAcademic}-v030.json`));
  $("btnExportGroup").addEventListener("click", () => { const g = activeGroup(); if (g) exportJson(g, `${slug(`${g.nivell}-${g.grup}-${g.assignatura}`)}.json`); });
  $("btnPrintSummary").addEventListener("click", printSummary);
  $("btnDiagnostics").addEventListener("click", renderDiagnostics);
  $("groupSelector").addEventListener("change", (e) => { activeGroupId = e.target.value; render(); });
  $("sessionFilter").addEventListener("change", (e) => { currentFilter = e.target.value; renderSessions(); });
  $("timelineMode").addEventListener("change", (e) => { timelineMode = e.target.value; renderTimeline(); });
  $("btnPrevMonth").addEventListener("click", () => changeCalendarMonth(-1));
  $("btnNextMonth").addEventListener("click", () => changeCalendarMonth(1));
  $("btnTodayMonth").addEventListener("click", setCalendarToToday);
  $("importFile").addEventListener("change", (e) => e.target.files[0] && importJson(e.target.files[0]));
  $("btnBulkSessions").addEventListener("click", () => $("bulkDialog").showModal());
  $("btnConfirmBulk").addEventListener("click", () => { const lines = $("bulkText").value.split("\n").map(x => x.trim()).filter(Boolean); lines.forEach(line => { const [titol, queEsTreballa, objectiu, bloc] = line.split(";").map(x => x?.trim() || ""); addSession({ titol, queEsTreballa, objectiu, bloc }); }); $("bulkText").value = ""; $("bulkDialog").close(); saveData("Sessions creades"); });
  ["cursAcademic", "nomCentre", "docent", "diesNoLectiusGenerals"].forEach(id => { $(id).addEventListener("change", () => { data.cursAcademic = $("cursAcademic").value.trim() || guessAcademicYear(); data.configuracio.nomCentre = $("nomCentre").value.trim(); data.configuracio.docent = $("docent").value.trim(); data.configuracio.diesNoLectiusGenerals = $("diesNoLectiusGenerals").value.split("\n").map(x => x.trim()).filter(Boolean); data.grups.forEach(recalculateGroup); saveData("Configuració actualitzada"); }); });
  document.body.addEventListener("change", (e) => { const target = e.target; if (target.dataset.action === "edit-session") updateSession(target.dataset.id, { [target.dataset.field]: target.value || null }); if (target.dataset.action === "edit-session-list") updateSession(target.dataset.id, { [target.dataset.field]: stringToList(target.value) }); });
  document.body.addEventListener("click", (e) => { const button = e.target.closest("button"); if (!button) return; if (button.dataset.action === "delete-session") deleteSession(button.dataset.id); if (button.dataset.action === "delete-incidence") deleteIncidence(button.dataset.id); if (button.dataset.action === "move-up") moveSession(button.dataset.id, -1); if (button.dataset.action === "move-down") moveSession(button.dataset.id, 1); if (button.dataset.action === "show-calendar-day") showCalendarDay(button.dataset.date); });
  $("btnClearData").addEventListener("click", () => { if (!confirm("Aquesta acció eliminarà totes les planificacions desades en aquest navegador. Vols continuar?")) return; localStorage.removeItem(STORAGE_KEY); data = defaultData(); activeGroupId = null; render(); });
  $("btnClearCache").addEventListener("click", async () => { if (!("caches" in window)) return alert("Aquest navegador no informa de cap cache disponible."); const keys = await caches.keys(); await Promise.all(keys.map(key => caches.delete(key))); alert("Cache esborrada. Recarrega l'aplicació."); });
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; $("btnInstall").classList.remove("hidden"); });
  $("btnInstall").addEventListener("click", async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; $("btnInstall").classList.add("hidden"); });
  window.addEventListener("online", renderDiagnostics); window.addEventListener("offline", renderDiagnostics);
}

async function registerServiceWorker() { if (!("serviceWorker" in navigator)) return; try { await navigator.serviceWorker.register("sw.js"); } catch (error) { console.warn("No s'ha pogut registrar el service worker", error); } }

bindEvents(); render(); registerServiceWorker();
