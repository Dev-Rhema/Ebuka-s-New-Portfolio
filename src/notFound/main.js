import "../index.css";
import "../rollText";
import { startGame } from "./game";
import { renderLeaderboard } from "./leaderboard";
import { loadScores, submitScore } from "../scoresApi";

const leadersEl = document.querySelector("[data-leaders]");
const sheetLeadersEl = document.querySelector("[data-sheet-leaders]");
const showLeaders = (entries) => {
  renderLeaderboard(leadersEl, entries);
  renderLeaderboard(sheetLeadersEl, entries, "py-24 last:pb-0");
};

const refreshLeaders = async () => {
  try {
    showLeaders((await loadScores()).slice(0, 3));
  } catch {
    showLeaders("Leaderboard unavailable right now.");
  }
};

showLeaders("Loading...");
refreshLeaders();

const sheet = document.querySelector("[data-sheet]");
document
  .querySelectorAll("[data-open-leaders]")
  .forEach((button) =>
    button.addEventListener("click", () => sheet.showModal()),
  );
sheet.addEventListener("click", (event) => {
  if (event.target === sheet || event.target.closest("[data-close]")) {
    sheet.close();
  }
});

const form = document.querySelector("[data-save]");
const nameInput = form.elements.name;
const saveButton = form.querySelector("button");
const saveError = form.querySelector("[data-save-error]");
let finalScore = null;
let saving = false;

const syncSave = () => {
  saveButton.disabled =
    finalScore === null || saving || !nameInput.value.trim();
  saveButton.textContent = saving ? "Saving..." : `Save ${finalScore}`;
};
nameInput.addEventListener("input", syncSave);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (saveButton.disabled) return;
  saving = true;
  saveError.textContent = "";
  syncSave();
  try {
    await submitScore(nameInput.value, finalScore);
    form.hidden = true;
    refreshLeaders();
  } catch (error) {
    saveError.textContent = error.message;
  } finally {
    saving = false;
    syncSave();
  }
});

// The leaderboard appears with the first run and stays up on the fail screen.
const boardEl = document.querySelector("[data-board]");
const overLeadersButton = document.querySelector("[data-over-leaders]");

startGame(document.getElementById("ride"), {
  onStart() {
    finalScore = null;
    form.hidden = true;
    boardEl.classList.remove("invisible");
  },
  onEnd(score) {
    finalScore = score;
    saveError.textContent = "";
    form.hidden = false;
    overLeadersButton.hidden = false;
    syncSave();
  },
});
