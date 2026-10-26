import { useState } from "react";
import Home from "./Home";
import Loader from "./Loader";

function App() {
  const [stage, setStage] = useState("loading");

  return (
    <>
      <Home play={stage !== "loading"} showLogo={stage === "done"} />
      {stage !== "done" && (
        <Loader
          onLogoMove={() => setStage("intro")}
          onComplete={() => setStage("done")}
        />
      )}
    </>
  );
}

export default App;
