import { useEffect, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { debugLogger } from "@/lib/debug-logger";
import { patchGlobalToast } from "@/lib/toast-interceptor";

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
  const originalLocalStorageSetItem = useRef<typeof localStorage.setItem | null>(null);
  const originalLocalStorageRemoveItem = useRef<typeof localStorage.removeItem | null>(null);
  const hasPatched = useRef(false);

  useEffect(() => {
    if (!isDebugEnabled()) return;
    
    // Only patch once
    if (hasPatched.current) return;
    hasPatched.current = true;

    // ============================================
    // 0. PATCH TOAST NOTIFICATIONS
    // ============================================
    patchGlobalToast();

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

          // Log slow requests as performance issues
          if (duration > 500) {
            debugLogger.performance(`slow_fetch:${url.split('?')[0]}`, {
              duration,
              threshold: 500,
              method,
              status: response.status,
            });
          }
          
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

    // ============================================
    // 7. LOCALSTORAGE INTERCEPTOR
    // ============================================
    if (!originalLocalStorageSetItem.current) {
      originalLocalStorageSetItem.current = localStorage.setItem.bind(localStorage);
      originalLocalStorageRemoveItem.current = localStorage.removeItem.bind(localStorage);

      localStorage.setItem = (key: string, value: string) => {
        // Skip logging debug-related keys to avoid noise
        if (!key.includes('debug')) {
          debugLogger.storage(key, 'set', { 
            size: value.length,
            preview: value.slice(0, 100),
          });
        }
        return originalLocalStorageSetItem.current!(key, value);
      };

      localStorage.removeItem = (key: string) => {
        if (!key.includes('debug')) {
          debugLogger.storage(key, 'remove');
        }
        return originalLocalStorageRemoveItem.current!(key);
      };
    }

    // ============================================
    // 8. KEYBOARD SHORTCUTS TRACKING
    // ============================================
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only log keyboard shortcuts (with modifiers) or escape key
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Escape') {
        debugLogger.interaction("keyboard_shortcut", {
          key: e.key,
          meta: e.metaKey,
          ctrl: e.ctrlKey,
          alt: e.altKey,
          shift: e.shiftKey,
          target: (e.target as HTMLElement)?.tagName || 'unknown',
        });
      }
    };

    // ============================================
    // 9. SCROLL DEPTH TRACKING
    // ============================================
    let lastScrollDepth = 0;
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      
      const scrollDepth = Math.round((window.scrollY / scrollHeight) * 100);
      const depthMilestone = Math.floor(scrollDepth / 25) * 25; // 0, 25, 50, 75, 100
      
      if (depthMilestone > lastScrollDepth && depthMilestone > 0) {
        debugLogger.interaction("scroll_depth", {
          depth: depthMilestone,
          scrollY: Math.round(window.scrollY),
        });
        lastScrollDepth = depthMilestone;
      }
    };

    // Debounced scroll handler
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    const debouncedScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 200);
    };

    // ============================================
    // 10. MODAL/DIALOG TRACKING
    // ============================================
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            // Check for dialog/modal elements
            const dialog = node.querySelector('[role="dialog"], [role="alertdialog"], [data-state="open"]');
            if (dialog || node.getAttribute('role') === 'dialog' || node.getAttribute('role') === 'alertdialog') {
              const dialogName = 
                node.getAttribute('aria-label') || 
                node.querySelector('h2, h3, [role="heading"]')?.textContent?.trim().slice(0, 30) ||
                'unknown';
              debugLogger.modal(dialogName, 'open');
            }
          }
        });
        
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            const dialog = node.querySelector('[role="dialog"], [role="alertdialog"]');
            if (dialog || node.getAttribute('role') === 'dialog' || node.getAttribute('role') === 'alertdialog') {
              const dialogName = 
                node.getAttribute('aria-label') || 
                node.querySelector('h2, h3, [role="heading"]')?.textContent?.trim().slice(0, 30) ||
                'unknown';
              debugLogger.modal(dialogName, 'close');
            }
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Add event listeners
    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("scroll", debouncedScroll, { passive: true });
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("scroll", debouncedScroll);
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      observer.disconnect();
      
      // Restore original fetch
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
        originalFetchRef.current = null;
      }

      // Restore original localStorage
      if (originalLocalStorageSetItem.current) {
        localStorage.setItem = originalLocalStorageSetItem.current;
        originalLocalStorageSetItem.current = null;
      }
      if (originalLocalStorageRemoveItem.current) {
        localStorage.removeItem = originalLocalStorageRemoveItem.current;
        originalLocalStorageRemoveItem.current = null;
      }
    };
  }, []);

  // ============================================
  // 11. NAVIGATION TRACKING
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