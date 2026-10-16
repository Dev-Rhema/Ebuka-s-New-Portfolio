import { useState } from "react";
import Home from "./Home";
import Loader from "./Loader";

function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Home play={loaded} />
      {!loaded && <Loader onComplete={() => setLoaded(true)} />}
    </>
  );
}

export default App;
