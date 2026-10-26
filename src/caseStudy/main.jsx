import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import "../smoothScroll";
import { CaseStudyData } from "../Data";
import CaseStudyPage from "./CaseStudyPage";

// The page lives at /case-study/<id>.
const id = location.pathname.split("/")[2];
const index = CaseStudyData.findIndex((study) => study.id === id);

if (index === -1) {
  location.replace("/404.html");
} else {
  const study = CaseStudyData[index];
  const next = CaseStudyData[index + 1];
  document.title = `${study.name} case study · Ebuka's Portfolio`;

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <CaseStudyPage study={study} next={next} />
    </StrictMode>,
  );
}
