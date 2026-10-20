import "../index.css";
import { startGame } from "./game";
import { leaders, renderLeaderboard } from "./leaderboard";

renderLeaderboard(document.querySelector("[data-leaders]"), leaders);
startGame(document.getElementById("ride"));
