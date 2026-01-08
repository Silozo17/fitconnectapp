import { useEffect, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { debugLogger } from "@/lib/debug-logger";

interface DebugEventInterceptorProps {
  children: ReactNode;
}

// Helper to get a description of an element for logging
const getElementDescription = (element: Element): string => {
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const className = element.className && typeof element.className === 'string' 
    ? `.${element.className.split(" ").filter(Boolean).slice(0, 2).join(".")}` 
    : "";
  const text = element.textContent?.trim().slice(0, 30);
  const ariaLabel = element.getAttribute("aria-label");
  const href = element.getAttribute("href");
  
  let description = `${tagName}${id}${className}`;
  if (ariaLabel) description += ` [${ariaLabel}]`;
  else if (text) description += ` "${text}${text.length > 30 ? "..." : ""}"`;
  if (href) description += ` → ${href}`;
  
  return description;
};

// Check if debug logging is enabled
const isDebugEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('debug_logging_disabled') !== 'true';
};

export const DebugEventInterceptor = ({ children }: DebugEventInterceptorProps) => {
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);
  const originalFetchRef = useRef<typeof fetch | null>(null);

  useEffect(() => {
    if (!isDebugEnabled()) return;

    // ============================================
    // 1. CLICK EVENT INTERCEPTOR
    // ============================================
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const interactiveElement = target.closest('button, a, [role="button"], [role="link"], [role="menuitem"], input[type="submit"], input[type="button"]');
      
      if (interactiveElement) {
        const description = getElementDescription(interactiveElement);
        debugLogger.click(description, {
          tagName: interactiveElement.tagName,
          text: interactiveElement.textContent?.trim().slice(0, 50) || null,
          href: interactiveElement.getAttribute("href") || null,
          type: interactiveElement.getAttribute("type") || null,
          disabled: interactiveElement.hasAttribute("disabled"),
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
        });
      }
    };

    // ============================================
    // 2. FORM SUBMIT INTERCEPTOR
    // ============================================
    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      if (form.tagName === "FORM") {
        debugLogger.interaction("form_submit", {
          formId: form.id || null,
          formAction: form.action || null,
          formMethod: form.method || "GET",
        });
      }
    };

    // ============================================
    // 3. FOCUS TRACKING (for debugging focus issues)
    // ============================================
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        debugLogger.interaction("focus", {
          element: getElementDescription(target),
          inputType: target.getAttribute("type") || target.tagName.toLowerCase(),
          inputName: target.getAttribute("name") || null,
        });
      }
    };

    // ============================================
    // 4. VISIBILITY CHANGE (tab switch)
    // ============================================
    const handleVisibilityChange = () => {
      debugLogger.lifecycle("Document", document.hidden ? "visibility_hidden" : "visibility_visible", {
        visibilityState: document.visibilityState,
      });
    };

    // ============================================
    // 5. GLOBAL ERROR HANDLER
    // ============================================
    const handleError = (e: ErrorEvent) => {
      debugLogger.error(e.message, e.error, "GlobalErrorHandler");
    };

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      debugLogger.error("Unhandled Promise Rejection", e.reason, "GlobalErrorHandler");
    };

    // ============================================
    // 6. FETCH INTERCEPTOR
    // ============================================
    if (!originalFetchRef.current) {
      originalFetchRef.current = window.fetch;
      window.fetch = async (...args) => {
        const startTime = performance.now();
        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;
        const method = (args[1]?.method || "GET").toUpperCase();
        
        // Skip logging for the debug logs endpoint itself to avoid recursion
        if (url.includes("user_debug_logs")) {
          return originalFetchRef.current!(...args);
        }

        try {
          const response = await originalFetchRef.current!(...args);
          const duration = Math.round(performance.now() - startTime);
          
          debugLogger.fetch(url, {
            method,
            status: response.status,
            statusText: response.statusText,
            duration,
            ok: response.ok,
          });
          
          return response;
        } catch (error) {
          const duration = Math.round(performance.now() - startTime);
          debugLogger.fetch(url, {
            method,
            status: 0,
            error: error instanceof Error ? error.message : String(error),
            duration,
            ok: false,
          });
          throw error;
        }
      };
    }

    // Add event listeners
    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      
      // Restore original fetch
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
        originalFetchRef.current = null;
      }
    };
  }, []);

  // ============================================
  // 7. NAVIGATION TRACKING
  // ============================================
  useEffect(() => {
    if (!isDebugEnabled()) return;
    
    const prevPath = prevLocationRef.current;
    const currentPath = location.pathname;
    
    if (prevPath !== currentPath) {
      debugLogger.navigation(prevPath, currentPath, {
        search: location.search,
        hash: location.hash,
      });
      prevLocationRef.current = currentPath;
    }
  }, [location]);

  return <>{children}</>;
};

export default DebugEventInterceptor;
