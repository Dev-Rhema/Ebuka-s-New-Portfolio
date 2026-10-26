import "../index.css";
import { startGame } from "./game";
import { leaders, renderLeaderboard } from "./leaderboard";

renderLeaderboard(document.querySelector("[data-leaders]"), leaders);
renderLeaderboard(
  document.querySelector("[data-sheet-leaders]"),
  leaders,
  "py-24 last:pb-0",
);

const sheet = document.querySelector("[data-sheet]");
document
  .querySelector("[data-open-leaders]")
  .addEventListener("click", () => sheet.showModal());
sheet.addEventListener("click", (event) => {
  if (event.target === sheet || event.target.closest("[data-close]")) {
    sheet.close();
  }
});

startGame(document.getElementById("ride"));
