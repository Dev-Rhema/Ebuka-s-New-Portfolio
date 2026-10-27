import { useState } from "react";
import Home from "./Home";
import Loader from "./Loader";
import { shouldSkipLoader } from "./skipLoader";

// Read once per page load, since reading clears it.
const skipLoader = shouldSkipLoader();

function App() {
  const [stage, setStage] = useState(skipLoader ? "done" : "loading");

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
