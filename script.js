
const STORAGE_KEY = "lararplaneraren-beta-projects";
let currentStep = 1;
let currentProject = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function getData() {
  return {
    grade: $("#grade").value,
    subject: $("#subject").value,
    topic: $("#topic").value.trim() || "Nytt arbetsområde",
    lessonCount: Math.max(1, Number($("#lessonCount").value) || 1),
    duration: Number($("#duration").value) || 60,
    works: $("#works").value.trim(),
    challenges: $("#challenges").value.trim(),
    needs: $("#needs").value.trim(),
    methods: $$(".choice input:checked").map((item) => item.value),
    focus: $("#focus").value.trim(),
    finalNote: $("#finalNote").value.trim()
  };
}

function showStep(step) {
  currentStep = step;
  $$(".screen").forEach((panel) => {
    panel.classList.toggle("active", Number(panel.dataset.screen) === step);
  });
  $$(".step").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.step) === step);
  });

  $("#previousButton").disabled = step === 1;
  $("#nextButton").classList.toggle("hidden", step === 4);
  $("#generateButton").classList.toggle("hidden", step !== 4);

  if (step === 4) renderSummary();
}

function renderSummary() {
  const data = getData();
  $("#summary").innerHTML = `
    <strong>${escapeHtml(data.subject)}, årskurs ${escapeHtml(data.grade)}</strong>
    <p>${escapeHtml(data.topic)} · ${data.lessonCount} lektioner · ${data.duration} minuter</p>
    <p><strong>Fokus:</strong> ${escapeHtml(data.focus)}</p>
    <p><strong>Arbetssätt:</strong> ${escapeHtml(data.methods.join(", ") || "Varierade arbetssätt")}</p>
    <p><strong>Behov:</strong> ${escapeHtml(data.needs)}</p>
  `;
}

function buildPlan(data) {
  const lessonCards = Array.from({ length: data.lessonCount }, (_, index) => `
    <article class="lesson-card">
      <span class="eyebrow">Lektion ${index + 1}</span>
      <h3>${escapeHtml(data.topic)}</h3>
      <ul>
        <li><strong>Mål:</strong> Eleverna utvecklar förståelse för arbetsområdets centrala innehåll och tränar på ${escapeHtml(data.focus.toLowerCase())}.</li>
        <li><strong>Start, 10 min:</strong> Aktivera förkunskaper med en bild, fråga eller kort begreppsaktivitet.</li>
        <li><strong>Modellering, 15 min:</strong> Visa hur ett utvecklat ämnesresonemang byggs steg för steg.</li>
        <li><strong>Elevaktivitet, 25 min:</strong> ${escapeHtml(data.methods[index % Math.max(1, data.methods.length)] || "Varierat arbete")} med en gemensam kärnuppgift.</li>
        <li><strong>Stödspår:</strong> Kortare instruktioner, meningsstarter, begreppslista och ett gemensamt exempel.</li>
        <li><strong>Fördjupningsspår:</strong> Jämföra perspektiv, pröva en alternativ förklaring eller formulera en självständig slutsats.</li>
        <li><strong>Avslutning, 10 min:</strong> Exit ticket kopplad till lektionens mål.</li>
      </ul>
    </article>
  `).join("");

  return `
    <article>
      <h3>Pedagogisk idé</h3>
      <p>Planeringen bygger vidare på det läraren vet fungerar i gruppen: ${escapeHtml(data.works)}. Alla elever arbetar mot samma centrala mål men får olika stöd och fördjupning.</p>
    </article>
    <article>
      <h3>Lärandemål</h3>
      <ul>
        <li>Använda centrala ämnesbegrepp i rätt sammanhang.</li>
        <li>Förklara relevanta samband med exempel.</li>
        <li>Utveckla resonemang och slutsatser efter återkoppling.</li>
      </ul>
    </article>
    <article>
      <h3>Progression</h3>
      <p>Arbetsområdet går från förförståelse och gemensam modellering till tillämpning, jämförelse och mer självständiga resonemang.</p>
    </article>
    ${lessonCards}
    <article>
      <h3>Bedömningsstöd</h3>
      <p>Observera om eleven använder relevanta begrepp, förklarar samband, ger exempel och utvecklar sitt resonemang efter återkoppling.</p>
    </article>
  `;
}

function generateProject() {
  const data = getData();
  currentProject = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...data,
    html: buildPlan(data)
  };

  $("#resultTitle").textContent = `${data.subject} · ${data.topic}`;
  $("#planPanel").innerHTML = currentProject.html;
  $("#resultSection").classList.remove("hidden");
  saveProject(currentProject);
  renderSavedProjects();
  $("#resultSection").scrollIntoView({ behavior: "smooth" });
}

function getProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveProject(project) {
  const projects = getProjects();
  const existingIndex = projects.findIndex((item) => item.id === project.id);
  if (existingIndex >= 0) projects[existingIndex] = project;
  else projects.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 20)));
}

function renderSavedProjects() {
  const projects = getProjects();
  const target = $("#savedProjects");

  if (projects.length === 0) {
    target.innerHTML = `<div class="assistant-message">Du har inga sparade arbetsområden ännu.</div>`;
    return;
  }

  target.innerHTML = projects.map((project) => `
    <article class="saved-card">
      <span class="eyebrow">${escapeHtml(project.subject)} · Åk ${escapeHtml(project.grade)}</span>
      <h3>${escapeHtml(project.topic)}</h3>
      <p>${project.lessonCount} lektioner · ${project.duration} minuter</p>
      <button class="secondary open-project" data-id="${project.id}">Öppna</button>
    </article>
  `).join("");

  $$(".open-project").forEach((button) => {
    button.addEventListener("click", () => openSavedProject(button.dataset.id));
  });
}

function openSavedProject(id) {
  const project = getProjects().find((item) => item.id === id);
  if (!project) return;

  currentProject = project;
  $("#resultTitle").textContent = `${project.subject} · ${project.topic}`;
  $("#planPanel").innerHTML = project.html;
  $("#resultSection").classList.remove("hidden");
  switchTab("plan");
  $("#resultSection").scrollIntoView({ behavior: "smooth" });
}

function switchTab(tabName) {
  $$(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  $$(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
  if (tabName === "saved") renderSavedProjects();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

$("#startButton").addEventListener("click", () => {
  $("#planner").classList.remove("hidden");
  $("#planner").scrollIntoView({ behavior: "smooth" });
});

$("#nextButton").addEventListener("click", () => showStep(Math.min(4, currentStep + 1)));
$("#previousButton").addEventListener("click", () => showStep(Math.max(1, currentStep - 1)));
$("#generateButton").addEventListener("click", generateProject);

$$(".step").forEach((button) => {
  button.addEventListener("click", () => showStep(Number(button.dataset.step)));
});

$$(".tab").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

$$(".adapt-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    $("#adaptMessage").innerHTML = `
      <strong>${escapeHtml(button.textContent)}</strong><br>
      I den AI-kopplade versionen skapas en alternativ variant av den valda delen medan mål och övrig planering behålls.
    `;
  });
});

$("#reflectionButton").addEventListener("click", () => {
  const good = $("#reflectionGood").value.trim() || "den tydliga strukturen";
  const hard = $("#reflectionHard").value.trim() || "det som blev svårt";
  const change = $("#reflectionChange").value.trim() || "mer modellering före det självständiga arbetet";

  $("#reflectionResult").classList.remove("hidden");
  $("#reflectionResult").innerHTML = `
    <strong>Förslag till nästa lektion</strong>
    <p>Behåll ${escapeHtml(good.toLowerCase())}. Lägg in en kort gemensam modellering kring ${escapeHtml(hard.toLowerCase())} och genomför ${escapeHtml(change.toLowerCase())}.</p>
  `;
});

$("#copyButton").addEventListener("click", async () => {
  const text = $("#planPanel").innerText;
  await navigator.clipboard.writeText(text);
  $("#copyButton").textContent = "Kopierat";
  setTimeout(() => { $("#copyButton").textContent = "Kopiera planeringen"; }, 1300);
});

$("#clearSavedButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderSavedProjects();
});

showStep(1);
renderSavedProjects();
