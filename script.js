const STORAGE_KEY = "coderhub-progress-v1";
const ALL_PROBLEMS = [
  { id: "contains-duplicate", title: "Contains Duplicate", difficulty: "easy", xpReward: 50, href: "contains-duplicate.html", sectionId: "arrays-hashing" },
  { id: "valid-anagram", title: "Valid Anagram", difficulty: "easy", xpReward: 50, href: "valid-anagram.html", sectionId: "arrays-hashing" },
  { id: "two-sum", title: "Two Sum", difficulty: "easy", xpReward: 50, href: "two-sum.html", sectionId: "arrays-hashing" },
  { id: "group-anagrams", title: "Group Anagrams", difficulty: "medium", xpReward: 100, href: "group-anagrams.html", sectionId: "arrays-hashing" },
  { id: "top-k-frequent-elements", title: "Top K Frequent Elements", difficulty: "medium", xpReward: 100, href: "top-k-frequent-elements.html", sectionId: "arrays-hashing" },
  { id: "products-except-self", title: "Products of Array Except Self", difficulty: "medium", xpReward: 100, href: "products-except-self.html", sectionId: "arrays-hashing" },
  { id: "valid-sudoku", title: "Valid Sudoku", difficulty: "medium", xpReward: 100, href: "valid-sudoku.html", sectionId: "arrays-hashing" },
  { id: "longest-consecutive-sequence", title: "Longest Consecutive Sequence", difficulty: "medium", xpReward: 100, href: "longest-consecutive-sequence.html", sectionId: "arrays-hashing" },
  { id: "valid-palindrome", title: "Valid Palindrome", difficulty: "easy", xpReward: 50, href: "valid-palindrome.html", sectionId: "two-pointers" },
  { id: "two-integer-sum-ii", title: "Two Integer Sum II", difficulty: "medium", xpReward: 100, href: "two-integer-sum-ii.html", sectionId: "two-pointers" },
  { id: "three-sum", title: "3Sum", difficulty: "medium", xpReward: 100, href: "three-sum.html", sectionId: "two-pointers" },
  { id: "container-with-most-water", title: "Container With Most Water", difficulty: "medium", xpReward: 100, href: "container-with-most-water.html", sectionId: "two-pointers" },
  { id: "trapping-rain-water", title: "Trapping Rain Water", difficulty: "hard", xpReward: 200, href: "trapping-rain-water.html", sectionId: "two-pointers" }
];

const ALL_SECTIONS = [
  { id: "arrays-hashing", title: "Arrays & Hashing" },
  { id: "two-pointers", title: "Two Pointers" }
];

const practiceToggle = document.querySelector("#practice-toggle");
const practicePanel = document.querySelector("#practice-panel");
const practiceInput = document.querySelector("#practice-input");
const resetPractice = document.querySelector("#reset-practice");
const qnaToggle = document.querySelector("#qna-toggle");
const qnaPanel = document.querySelector("#qna-panel");
const qnaList = document.querySelector("#qna-list");
const feedbackChip = document.querySelector("#feedback-chip");
const feedbackIcon = document.querySelector("#feedback-icon");
const feedbackText = document.querySelector("#feedback-text");
const practiceConfigElement = document.querySelector("#practice-config");
const randomProblemButton = document.querySelector("#random-problem-button");
const solutionCard = document.querySelector(".solution-card");
const solutionActions = solutionCard?.querySelector(".section-actions");
const solutionCodeBlock = solutionCard?.querySelector(".code-block");
const solutionCopy = solutionCard?.querySelector(".solution-copy");
const complexityStrip = solutionCard?.querySelector(".complexity-strip");
const welcomeView = document.querySelector("#welcome-view");
const hubView = document.querySelector("#hub-view");
const getStartedButton = document.querySelector("#get-started-button");

const defaultConfig = {
  problemId: "",
  problemTitle: "",
  xpReward: 0,
  baseIndent: "        ",
  indentUnit: "    ",
  qnaItems: [],
  targetSolution: ""
};

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderColorSplitCode(codeNode) {
  if (!codeNode) {
    return;
  }

  const source = codeNode.textContent ?? "";
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const defIndex = lines.findIndex((line) => /^\s*def\s+\w+/.test(line));

  if (defIndex === -1) {
    return;
  }

  const shellLines = lines.slice(0, defIndex + 1).join("\n");
  const bodyLines = lines.slice(defIndex + 1).join("\n");
  let html = `<span class="code-shell">${escapeHtml(shellLines)}</span>`;

  if (bodyLines.length > 0) {
    html += `\n<span class="code-body">${escapeHtml(bodyLines)}</span>`;
  }

  codeNode.innerHTML = html;
}

function formatSolutionCodeBlocks() {
  document.querySelectorAll(".code-block code").forEach(renderColorSplitCode);
}

function setupSolutionToggle() {
  if (!solutionCard || !solutionActions || !solutionCodeBlock) {
    return;
  }

  const solutionToggle = document.createElement("button");
  solutionToggle.type = "button";
  solutionToggle.className = "info-toggle";
  solutionToggle.setAttribute("aria-expanded", "false");
  solutionToggle.textContent = "Show Solution";

  const placeholder = document.createElement("div");
  placeholder.className = "solution-placeholder";
  const shellMarkup = solutionCodeBlock.querySelector(".code-shell")?.outerHTML ?? "";
  placeholder.innerHTML = `<pre class="code-block solution-shell-preview"><code>${shellMarkup}</code></pre>`;

  solutionCodeBlock.insertAdjacentElement("beforebegin", placeholder);

  const setSolutionVisible = (isVisible) => {
    solutionToggle.setAttribute("aria-expanded", String(isVisible));
    solutionToggle.textContent = isVisible ? "Hide Solution" : "Show Solution";
    solutionCodeBlock.hidden = !isVisible;
    placeholder.hidden = isVisible;
  };

  setSolutionVisible(false);
  solutionActions.prepend(solutionToggle);

  solutionToggle.addEventListener("click", () => {
    const isVisible = solutionCodeBlock.hidden;
    setSolutionVisible(isVisible);
  });
}

function syncHomeViews() {
  if (!welcomeView || !hubView) {
    return;
  }

  const showHub = window.sessionStorage.getItem("coderhub-home-view") === "hub";
  welcomeView.hidden = showHub;
  hubView.hidden = !showHub;
}

function showHubView() {
  if (!welcomeView || !hubView) {
    return;
  }

  window.sessionStorage.setItem("coderhub-home-view", "hub");
  welcomeView.hidden = true;
  hubView.hidden = false;
}

function getTodayStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDefaultProgress() {
  return {
    xp: 0,
    completions: {}
  };
}

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return getDefaultProgress();
    }

    const parsed = JSON.parse(raw);

    return {
      xp: Number(parsed.xp) || 0,
      completions: parsed.completions && typeof parsed.completions === "object" ? parsed.completions : {}
    };
  } catch (error) {
    console.error("Unable to read saved progress.", error);
    return getDefaultProgress();
  }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getNextProblem(progress) {
  const nextProblem = ALL_PROBLEMS.find((problem) => !progress.completions[problem.id]?.completed);
  return nextProblem ? nextProblem.title : "Replay for mastery";
}

function updateDashboard(progress) {
  const completedCount = ALL_PROBLEMS.filter((problem) => progress.completions[problem.id]?.completed).length;
  const stats = document.querySelectorAll("[data-stat]");
  const prestigeUnlocked = progress.xp >= 1000;

  stats.forEach((node) => {
    const key = node.dataset.stat;

    if (key === "completed-count") {
      node.textContent = node.closest(".mission-card") ? `${completedCount}/${ALL_PROBLEMS.length}` : String(completedCount);
    }

    if (key === "xp-total") {
      node.textContent = String(progress.xp);
    }

    if (key === "next-problem") {
      node.textContent = getNextProblem(progress);
    }
  });

  document.querySelectorAll("[data-problem-id]").forEach((row) => {
    const problemId = row.dataset.problemId;
    const statusNode = row.querySelector("[data-problem-status]");
    const completion = progress.completions[problemId];

    if (!statusNode) {
      return;
    }

    if (completion?.completed) {
      statusNode.textContent = "Mastered";
      statusNode.dataset.state = "mastered";
      row.dataset.state = "mastered";
      row.querySelector("[data-problem-star]")?.classList.add("is-earned");
      return;
    }

    statusNode.textContent = "Not Started";
    statusNode.dataset.state = "fresh";
    row.dataset.state = "fresh";
    row.querySelector("[data-problem-star]")?.classList.remove("is-earned");
  });

  document.querySelectorAll("[data-section-progress]").forEach((node) => {
    const sectionId = node.dataset.sectionProgress;
    const sectionProblems = ALL_PROBLEMS.filter((problem) => problem.sectionId === sectionId);
    const sectionCompleted = sectionProblems.filter((problem) => progress.completions[problem.id]?.completed).length;
    node.textContent = `${sectionCompleted}/${sectionProblems.length}`;
  });

  document.querySelectorAll("[data-section-status]").forEach((node) => {
    const sectionId = node.dataset.sectionStatus;
    const sectionProblems = ALL_PROBLEMS.filter((problem) => problem.sectionId === sectionId);
    const sectionCompleted = sectionProblems.filter((problem) => progress.completions[problem.id]?.completed).length;

    if (sectionCompleted === 0) {
      node.textContent = "In Progress";
      node.dataset.state = "fresh";
      return;
    }

    if (sectionCompleted === sectionProblems.length) {
      node.textContent = "Mastered";
      node.dataset.state = "mastered";
      return;
    }

    node.textContent = `${sectionCompleted}/${sectionProblems.length} Cleared`;
    node.dataset.state = "mastered";
  });

  document.querySelectorAll("[data-prestige-badge]").forEach((node) => {
    node.hidden = !prestigeUnlocked;
  });
}

function getRandomProblem() {
  if (ALL_PROBLEMS.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * ALL_PROBLEMS.length);
  return ALL_PROBLEMS[randomIndex];
}

function showCompletionBanner(problemTitle, xpReward, firstWin) {
  const existingBanner = document.querySelector(".win-banner");

  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement("aside");
  banner.className = "win-banner";
  banner.innerHTML = `
    <p class="win-label">${firstWin ? "New Clear" : "Replay Clear"}</p>
    <h3>${problemTitle}</h3>
    <p>${firstWin ? `You banked ${xpReward} XP and saved this solve to your profile.` : "Still sharp. Your exact solution matched again."}</p>
  `;

  document.body.appendChild(banner);

  window.setTimeout(() => {
    banner.classList.add("is-visible");
  }, 10);

  window.setTimeout(() => {
    banner.classList.remove("is-visible");
    window.setTimeout(() => banner.remove(), 250);
  }, 3200);
}

function showResetBanner() {
  const existingBanner = document.querySelector(".win-banner");

  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement("aside");
  banner.className = "win-banner";
  banner.innerHTML = `
    <p class="win-label">XP Reset</p>
    <h3>Back to Zero</h3>
    <p>Your XP total is now 0.</p>
  `;

  document.body.appendChild(banner);

  window.setTimeout(() => {
    banner.classList.add("is-visible");
  }, 10);

  window.setTimeout(() => {
    banner.classList.remove("is-visible");
    window.setTimeout(() => banner.remove(), 250);
  }, 2200);
}

function showCompletionResetBanner() {
  const existingBanner = document.querySelector(".win-banner");

  if (existingBanner) {
    existingBanner.remove();
  }

  const banner = document.createElement("aside");
  banner.className = "win-banner";
  banner.innerHTML = `
    <p class="win-label">Stats Reset</p>
    <h3>Problems Cleared</h3>
    <p>Your mastered-problem progress is now back to 0.</p>
  `;

  document.body.appendChild(banner);

  window.setTimeout(() => {
    banner.classList.add("is-visible");
  }, 10);

  window.setTimeout(() => {
    banner.classList.remove("is-visible");
    window.setTimeout(() => banner.remove(), 250);
  }, 2200);
}

let practiceConfig = defaultConfig;

if (practiceConfigElement) {
  try {
    practiceConfig = {
      ...defaultConfig,
      ...JSON.parse(practiceConfigElement.textContent)
    };
  } catch (error) {
    console.error("Unable to parse practice config.", error);
  }
}

const { problemId, problemTitle, xpReward, baseIndent, indentUnit, qnaItems, targetSolution } = practiceConfig;
let completionAwardedThisSession = false;

function renderQnaItems() {
  if (!qnaList || !Array.isArray(qnaItems) || qnaItems.length === 0) {
    return;
  }

  qnaList.innerHTML = qnaItems
    .map(
      (item) => `
        <article class="qna-item">
          <h4>${item.title}</h4>
          <p>${item.body}</p>
        </article>
      `
    )
    .join("");
}

function normalizeLine(line) {
  return line.trim().length === 0 ? "" : line;
}

function normalizeSolution(value) {
  return value.replace(/\r\n/g, "\n").split("\n").map(normalizeLine).join("\n");
}

function setFeedback(state, message, icon) {
  if (!feedbackChip || !feedbackIcon || !feedbackText) {
    return;
  }

  feedbackChip.dataset.state = state;
  feedbackIcon.textContent = icon;
  feedbackText.textContent = message;
}

function awardCompletion() {
  if (!problemId || completionAwardedThisSession) {
    return;
  }

  const progress = readProgress();
  const previousCompletion = progress.completions[problemId];
  const firstWin = !previousCompletion?.completed;

  progress.xp += xpReward;

  progress.completions[problemId] = {
    completed: true,
    title: problemTitle,
    completedAt: new Date().toISOString(),
    xpReward
  };

  saveProgress(progress);
  updateDashboard(progress);
  showCompletionBanner(problemTitle, xpReward, firstWin);
  completionAwardedThisSession = true;
}

function updatePracticeState() {
  if (!practiceInput || !targetSolution) {
    return;
  }

  const currentValue = normalizeSolution(practiceInput.value);
  const normalizedTarget = normalizeSolution(targetSolution);
  const exactMatch = currentValue === normalizedTarget;
  const prefixMatch = normalizedTarget.startsWith(currentValue);

  practiceInput.classList.remove("is-error", "is-success");

  if (practiceInput.value.length === 0 || currentValue === baseIndent) {
    setFeedback("idle", "Waiting for your first line", "•");
    completionAwardedThisSession = false;
    return;
  }

  if (!prefixMatch) {
    practiceInput.classList.add("is-error");
    setFeedback("error", "Red X: something is off. Check the last character or indentation.", "✕");
    completionAwardedThisSession = false;
    return;
  }

  if (exactMatch) {
    practiceInput.classList.add("is-success");
    setFeedback("success", "Green check: exact solution matched.", "✓");
    awardCompletion();
    return;
  }

  practiceInput.classList.add("is-success");
  setFeedback("success", "Green check: still matching so far.", "✓");
}

function setCursorPosition(start, end = start) {
  if (!practiceInput) {
    return;
  }

  practiceInput.setSelectionRange(start, end);
}

function insertAtSelection(text, selectionStart = null, selectionEnd = null) {
  if (!practiceInput) {
    return;
  }

  const start = selectionStart ?? practiceInput.selectionStart;
  const end = selectionEnd ?? practiceInput.selectionEnd;
  const currentValue = practiceInput.value;

  practiceInput.value = `${currentValue.slice(0, start)}${text}${currentValue.slice(end)}`;
  setCursorPosition(start + text.length);
  updatePracticeState();
}

function getCurrentLineStart(value, cursorIndex) {
  return value.lastIndexOf("\n", cursorIndex - 1) + 1;
}

function ensureBaseIndent() {
  if (!practiceInput) {
    return;
  }

  if (practiceInput.value.length === 0) {
    practiceInput.value = baseIndent;
    setCursorPosition(baseIndent.length);
  }
}

function handlePracticeKeydown(event) {
  if (!practiceInput) {
    return;
  }

  const { selectionStart, selectionEnd, value } = practiceInput;
  const currentLineStart = getCurrentLineStart(value, selectionStart);
  const currentLine = value.slice(currentLineStart, selectionStart);

  if (event.key === "Tab") {
    event.preventDefault();
    insertAtSelection(indentUnit);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();

    const lineToInspect = value.slice(currentLineStart, selectionStart).trimEnd();
    const indentMatch = value.slice(currentLineStart, selectionStart).match(/^\s*/);
    let nextIndent = indentMatch ? indentMatch[0] : baseIndent;

    if (lineToInspect.endsWith(":")) {
      nextIndent += indentUnit;
    }

    if (nextIndent.length === 0) {
      nextIndent = baseIndent;
    }

    insertAtSelection(`\n${nextIndent}`);
    return;
  }

  if (event.key === "Backspace" && selectionStart === selectionEnd) {
    if (value === baseIndent && selectionStart === baseIndent.length) {
      event.preventDefault();
      return;
    }

    if (selectionStart > 0 && currentLine.trim().length === 0) {
      const linePrefix = value.slice(currentLineStart, selectionStart);

      if (linePrefix.endsWith(indentUnit)) {
        event.preventDefault();
        const deleteStart = selectionStart - indentUnit.length;
        insertAtSelection("", deleteStart, selectionStart);
      }
    }
  }
}

const initialProgress = readProgress();
syncHomeViews();
formatSolutionCodeBlocks();
setupSolutionToggle();
updateDashboard(initialProgress);
renderQnaItems();

if (getStartedButton) {
  getStartedButton.addEventListener("click", showHubView);
}

if (qnaToggle && qnaPanel) {
  if (!Array.isArray(qnaItems) || qnaItems.length === 0) {
    qnaToggle.hidden = true;
  } else {
    qnaToggle.addEventListener("click", () => {
      const isHidden = qnaPanel.hidden;
      qnaPanel.hidden = !isHidden;
      qnaToggle.setAttribute("aria-expanded", String(isHidden));
      qnaToggle.textContent = isHidden ? "Hide Q&A" : "Q&A";
    });
  }
}

if (practiceToggle && practicePanel && practiceInput && targetSolution) {
  practiceToggle.addEventListener("click", () => {
    const isHidden = practicePanel.hidden;

    practicePanel.hidden = !isHidden;
    practiceToggle.setAttribute("aria-expanded", String(isHidden));
    practiceToggle.textContent = isHidden ? "Hide Practice Mode" : "Try It On Your Own";

    if (isHidden) {
      ensureBaseIndent();
      practiceInput.focus();
      updatePracticeState();
    }
  });

  practiceInput.addEventListener("input", updatePracticeState);
  practiceInput.addEventListener("keydown", handlePracticeKeydown);
  practiceInput.addEventListener("focus", ensureBaseIndent);
}

if (resetPractice && practiceInput && targetSolution) {
  resetPractice.addEventListener("click", () => {
    practiceInput.value = baseIndent;
    practiceInput.classList.remove("is-error", "is-success");
    setFeedback("idle", "Waiting for your first line", "•");
    setCursorPosition(baseIndent.length);
    completionAwardedThisSession = false;
    practiceInput.focus();
  });
}

if (randomProblemButton) {
  randomProblemButton.addEventListener("click", () => {
    const randomProblem = getRandomProblem();

    if (!randomProblem) {
      return;
    }

    window.location.href = randomProblem.href;
  });
}

document.querySelectorAll("[data-action='reset-xp']").forEach((button) => {
  button.addEventListener("click", () => {
    const shouldReset = window.confirm("Reset XP back to 0?");

    if (!shouldReset) {
      return;
    }

    const progress = readProgress();
    progress.xp = 0;
    saveProgress(progress);
    updateDashboard(progress);
    showResetBanner();
  });
});

document.querySelectorAll("[data-action='reset-completions']").forEach((button) => {
  button.addEventListener("click", () => {
    const shouldReset = window.confirm("Reset mastered problems back to 0?");

    if (!shouldReset) {
      return;
    }

    const progress = readProgress();
    progress.completions = {};
    saveProgress(progress);
    updateDashboard(progress);
    showCompletionResetBanner();
  });
});
