import BaseMap from "./containers/BaseMap/BaseMap";
import { ErrorBoundary } from "react-error-boundary";

import "./App.css";

function App() {
  return (
    <>
      <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
        <BaseMap />
      </ErrorBoundary>
    </>
  );
}

export default App;
