import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize i18n
import "./i18n";

// Performance instrumentation (DEV-only when VITE_PERF_DEBUG=true)
import { perfLogger } from "./lib/performance-logger";

// Record app start time
const appStartTime = performance.now();
perfLogger.startTiming('startup', 'app-init');

createRoot(document.getElementById("root")!).render(<App />);

// Log first render time
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const firstRenderTime = performance.now() - appStartTime;
    perfLogger.endTiming(perfLogger.startTiming('startup', 'first-render'), { 
      totalMs: Math.round(firstRenderTime) 
    });
  });
});
