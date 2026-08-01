
const STORAGE_KEY = "lararplaneraren-beta-1-1-projects";

const questions = [
  {
    key: "topic",
    question: "Vad ska arbetsområdet handla om?",
    placeholder: "Exempel: Vasatiden i historia, årskurs 6.",
    reason: "Ämne, årskurs och innehåll ger ramen för resten av samtalet."
  },
  {
    key: "understanding",
    question: "Vad vill du att eleverna verkligen ska förstå när arbetsområdet är klart?",
    placeholder: "Beskriv den viktigaste förståelsen, inte bara vad eleverna ska göra.",
    reason: "En tydlig kärna hjälper Lärarkollegan att skapa progression och relevanta aktiviteter."
  },
  {
    key: "works",
    question: "Vad brukar fungera bra i den här klassen?",
    placeholder: "Exempel: samarbete, tydliga modeller, praktiska moment...",
    reason: "Planeringen blir bättre när den bygger vidare på sådant som redan fungerar."
  },
  {
    key: "challenges",
    question: "Vad brukar eleverna fastna på eller tycka är svårt?",
    placeholder: "Exempel: långa instruktioner, centrala begrepp, att utveckla resonemang...",
    reason: "Det hjälper Lärarkollegan att lägga stödet där det faktiskt behövs."
  },
  {
    key: "needs",
    question: "Vilka behov i gruppen behöver vi ta hänsyn till?",
    placeholder: "Beskriv behov utan namn eller andra personuppgifter.",
    reason: "Vi kan skapa flera vägar mot samma mål utan att läraren behöver börja om."
  },
  {
    key: "methods",
    question: "Hur vill du helst arbeta i det här arbetsområdet?",
    placeholder: "Välj gärna flera eller skriv ett eget arbetssätt.",
    reason: "Arbetssätten ska passa både läraren, elevgruppen och innehållet.",
    choices: ["Samarbete", "Praktiska övningar", "Diskussioner", "Enskilt arbete", "Stationsarbete", "Digitala verktyg"],
    multiple: true
  },
  {
    key: "assessment",
    question: "Hur vill du att eleverna ska få visa sina kunskaper?",
    placeholder: "Exempel: muntligt resonemang, text, gruppuppgift, quiz, presentation...",
    reason: "Bedömningen behöver hänga ihop med målen och undervisningen."
  },
  {
    key: "scope",
    question: "Hur många lektioner har du och hur långa är de?",
    placeholder: "Exempel: 5 lektioner à 60 minuter.",
    reason: "Tidsramen avgör hur mycket innehåll och progression som är realistiskt."
  }
];

let currentQuestion = 0;
let answers = {};
let selectedChoices = [];
let currentProject = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function startConversation() {
  currentQuestion = 0;
  answers = {};
  selectedChoices = [];
  $("#conversationSection").classList.remove("hidden");
  $("#resultSection").classList.add("hidden");
  $("#confirmationArea").classList.add("hidden");
  $("#answerArea").classList.remove("hidden");
  renderConversation();
  $("#conversationSection").scrollIntoView({ behavior: "smooth" });
}

function renderConversation() {
  const messages = [];
  messages.push({
    role: "colleague",
    text: "Hej! Jag är Lärarkollegan. Jag kommer ställa några frågor för att förstå din idé, din klass och dina pedagogiska val."
  });

  for (let index = 0; index < currentQuestion; index += 1) {
    messages.push({ role: "colleague", text: questions[index].question });
    messages.push({ role: "teacher", text: answers[questions[index].key] || "" });
  }

  if (currentQuestion < questions.length) {
    messages.push({ role: "colleague", text: questions[currentQuestion].question });
  }

  $("#chatMessages").innerHTML = messages.map((message) => `
    <div class="chat-row ${message.role}">
      <div class="chat-bubble">
        <strong>${message.role === "colleague" ? "Lärarkollegan" : "Du"}</strong>
        <p>${escapeHtml(message.text)}</p>
      </div>
    </div>
  `).join("");

  const question = questions[currentQuestion];
  $("#answerInput").value = answers[question.key] || "";
  $("#answerInput").placeholder = question.placeholder;
  $("#questionReason").textContent = question.reason;
  $("#backButton").disabled = currentQuestion === 0;
  $("#progressText").textContent = `${currentQuestion + 1} av ${questions.length}`;
  $("#progressBar").style.width = `${((currentQuestion + 1) / questions.length) * 100}%`;

  selectedChoices = question.multiple && answers[question.key]
    ? answers[question.key].split(", ").filter(Boolean)
    : [];

  renderChoices(question);
  $("#answerInput").focus();
  $("#chatMessages").scrollTop = $("#chatMessages").scrollHeight;
}

function renderChoices(question) {
  const target = $("#quickChoices");
  if (!question.choices) {
    target.classList.add("hidden");
    target.innerHTML = "";
    return;
  }

  target.classList.remove("hidden");
  target.innerHTML = question.choices.map((choice) => `
    <button type="button" class="quick-choice ${selectedChoices.includes(choice) ? "selected" : ""}" data-choice="${escapeHtml(choice)}">${escapeHtml(choice)}</button>
  `).join("");

  $$(".quick-choice").forEach((button) => {
    button.addEventListener("click", () => {
      const choice = button.dataset.choice;
      if (selectedChoices.includes(choice)) {
        selectedChoices = selectedChoices.filter((item) => item !== choice);
      } else {
        selectedChoices.push(choice);
      }
      $("#answerInput").value = selectedChoices.join(", ");
      renderChoices(question);
    });
  });
}

function continueConversation() {
  const question = questions[currentQuestion];
  const value = $("#answerInput").value.trim();

  if (!value) {
    $("#answerInput").focus();
    return;
  }

  answers[question.key] = value;

  if (currentQuestion === questions.length - 1) {
    showConfirmation();
    return;
  }

  currentQuestion += 1;
  renderConversation();
}

function showConfirmation() {
  const messages = [];
  messages.push({
    role: "colleague",
    text: "Tack. Jag tror att jag har förstått din planering. Kontrollera gärna sammanfattningen innan jag skapar underlaget."
  });

  $("#chatMessages").innerHTML += messages.map((message) => `
    <div class="chat-row colleague">
      <div class="chat-bubble">
        <strong>Lärarkollegan</strong>
        <p>${escapeHtml(message.text)}</p>
      </div>
    </div>
  `).join("");

  $("#answerArea").classList.add("hidden");
  $("#confirmationArea").classList.remove("hidden");
  $("#progressText").textContent = "Klart";
  $("#progressBar").style.width = "100%";
  $("#questionReason").textContent = "Läraren har alltid sista ordet innan planeringen skapas.";

  $("#summaryCard").innerHTML = `
    <dl>
      <dt>Arbetsområde</dt><dd>${escapeHtml(answers.topic)}</dd>
      <dt>Viktig förståelse</dt><dd>${escapeHtml(answers.understanding)}</dd>
      <dt>Det som fungerar</dt><dd>${escapeHtml(answers.works)}</dd>
      <dt>Utmaningar</dt><dd>${escapeHtml(answers.challenges)}</dd>
      <dt>Gruppens behov</dt><dd>${escapeHtml(answers.needs)}</dd>
      <dt>Arbetssätt</dt><dd>${escapeHtml(answers.methods)}</dd>
      <dt>Visa kunskaper</dt><dd>${escapeHtml(answers.assessment)}</dd>
      <dt>Tidsram</dt><dd>${escapeHtml(answers.scope)}</dd>
    </dl>
  `;
}

function parseLessonCount(scope) {
  const match = String(scope).match(/\d+/);
  return match ? Math.min(12, Math.max(1, Number(match[0]))) : 5;
}

function buildPlan() {
  const lessonCount = parseLessonCount(answers.scope);
  const methods = answers.methods.split(",").map((item) => item.trim()).filter(Boolean);
  const lessonCards = Array.from({ length: lessonCount }, (_, index) => `
    <article class="lesson-card">
      <span class="eyebrow">Lektion ${index + 1}</span>
      <h3>${escapeHtml(answers.topic)}</h3>
      <ul>
        <li><strong>Delmål:</strong> Eleverna tar ett tydligt steg mot att förstå ${escapeHtml(answers.understanding.toLowerCase())}.</li>
        <li><strong>Start:</strong> Aktivera förkunskaper med en bild, fråga eller kort begreppsaktivitet.</li>
        <li><strong>Modellering:</strong> Visa hur ett ämnesresonemang eller en strategi byggs steg för steg.</li>
        <li><strong>Elevaktivitet:</strong> ${escapeHtml(methods[index % Math.max(1, methods.length)] || "Varierat arbete")} med en gemensam kärnuppgift.</li>
        <li><strong>Stödspår:</strong> Kortare instruktioner, meningsstarter, begreppsstöd och ett gemensamt exempel.</li>
        <li><strong>Fördjupningsspår:</strong> Jämföra perspektiv, pröva en alternativ förklaring eller formulera en självständig slutsats.</li>
        <li><strong>Avslutning:</strong> Exit ticket som visar vad eleverna har förstått och vad som behöver följas upp.</li>
      </ul>
    </article>
  `).join("");

  return `
    <article>
      <h3>Lärarkollegans pedagogiska tanke</h3>
      <p>Planeringen utgår från lärarens mål och bygger vidare på det som redan fungerar i gruppen: ${escapeHtml(answers.works)}. Progressionen riktas mot ${escapeHtml(answers.understanding.toLowerCase())}.</p>
      <div class="assistant-note"><strong>Pedagogiskt råd:</strong> Eftersom eleverna brukar fastna på ${escapeHtml(answers.challenges.toLowerCase())} rekommenderas korta avstämningar mellan modellering och självständigt arbete.</div>
    </article>
    <article>
      <h3>Övergripande mål</h3>
      <ul>
        <li>Utveckla förståelse för ${escapeHtml(answers.understanding.toLowerCase())}.</li>
        <li>Använda centrala ämnesbegrepp och relevanta exempel.</li>
        <li>Visa kunskaper genom ${escapeHtml(answers.assessment.toLowerCase())}.</li>
      </ul>
    </article>
    <article>
      <h3>Progression</h3>
      <p>Arbetsområdet går från förförståelse och gemensam modellering till tillämpning, jämförelse och ett mer självständigt kunskapsvisande.</p>
    </article>
    ${lessonCards}
    <article>
      <h3>Anpassningar</h3>
      <p>Planeringen ska särskilt ta hänsyn till: ${escapeHtml(answers.needs)}. Alla elever arbetar mot samma centrala mål, men stöd, uttrycksform och grad av självständighet varierar.</p>
    </article>
    <article>
      <h3>Bedömningsstöd</h3>
      <p>Observera om eleven använder relevanta begrepp, förklarar samband, ger exempel och kan visa sin förståelse genom ${escapeHtml(answers.assessment.toLowerCase())}.</p>
    </article>
  `;
}

function createPlan() {
  const finalNote = $("#finalNote").value.trim();
  currentProject = {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    answers: { ...answers, finalNote },
    title: answers.topic,
    html: buildPlan()
  };

  $("#resultTitle").textContent = answers.topic;
  $("#planPanel").innerHTML = currentProject.html;
  saveProject(currentProject);
  renderSavedProjects();
  $("#resultSection").classList.remove("hidden");
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
  projects.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 20)));
}

function renderSavedProjects() {
  const projects = getProjects();
  const target = $("#savedProjects");

  if (!projects.length) {
    target.innerHTML = `<div class="assistant-note">Du har inga sparade arbetsområden ännu.</div>`;
    return;
  }

  target.innerHTML = projects.map((project) => `
    <article class="saved-card">
      <span class="eyebrow">Sparad planering</span>
      <h3>${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.answers.scope)}</p>
      <button class="secondary open-project" data-id="${project.id}">Öppna</button>
    </article>
  `).join("");

  $$(".open-project").forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.id));
  });
}

function openProject(id) {
  const project = getProjects().find((item) => item.id === id);
  if (!project) return;
  currentProject = project;
  answers = { ...project.answers };
  $("#resultTitle").textContent = project.title;
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

$("#startButton").addEventListener("click", startConversation);
$("#restartButton").addEventListener("click", startConversation);
$("#newConversationButton").addEventListener("click", startConversation);
$("#continueButton").addEventListener("click", continueConversation);

$("#answerInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    continueConversation();
  }
});

$("#backButton").addEventListener("click", () => {
  if (currentQuestion === 0) return;
  currentQuestion -= 1;
  renderConversation();
});

$("#editButton").addEventListener("click", () => {
  currentQuestion = 0;
  $("#confirmationArea").classList.add("hidden");
  $("#answerArea").classList.remove("hidden");
  renderConversation();
});

$("#createPlanButton").addEventListener("click", createPlan);

$$(".tab").forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

$$(".adapt-grid button").forEach((button) => {
  button.addEventListener("click", () => {
    $("#adaptMessage").innerHTML = `
      <strong>${escapeHtml(button.textContent)}</strong><br>
      I den AI-kopplade versionen ändrar Lärarkollegan endast den valda delen och bevarar mål, progression och övriga pedagogiska val.
    `;
  });
});

$("#reflectionButton").addEventListener("click", () => {
  const good = $("#reflectionGood").value.trim() || "det som fungerade i lektionen";
  const hard = $("#reflectionHard").value.trim() || "det som blev svårt";
  const change = $("#reflectionChange").value.trim() || "mer gemensam modellering";

  $("#reflectionResult").classList.remove("hidden");
  $("#reflectionResult").innerHTML = `
    <strong>Lärarkollegans förslag</strong>
    <p>Behåll ${escapeHtml(good.toLowerCase())}. Före nästa självständiga moment rekommenderas en kort avstämning kring ${escapeHtml(hard.toLowerCase())} och därefter ${escapeHtml(change.toLowerCase())}.</p>
  `;
});

$("#copyButton").addEventListener("click", async () => {
  await navigator.clipboard.writeText($("#planPanel").innerText);
  $("#copyButton").textContent = "Kopierat";
  setTimeout(() => { $("#copyButton").textContent = "Kopiera"; }, 1200);
});

$("#clearSavedButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  renderSavedProjects();
});

renderSavedProjects();
