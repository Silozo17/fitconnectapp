import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize i18n
import "./i18n";

// Performance instrumentation (DEV-only when VITE_PERF_DEBUG=true)
import { perfLogger } from "./lib/performance-logger";

// Initialize the performance logger FIRST
perfLogger.initLogger();

// Record app start time
const appStartTime = performance.now();

perfLogger.logEvent('main_tsx_execute');
perfLogger.logEvent('react_render_start');

createRoot(document.getElementById("root")!).render(<App />);

// Log first render time
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const firstRenderTime = performance.now() - appStartTime;
    perfLogger.logTimedEvent('first_render_complete', firstRenderTime, { 
      totalMs: Math.round(firstRenderTime) 
    });
  });
});
