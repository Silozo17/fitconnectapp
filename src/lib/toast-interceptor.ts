import { toast as sonnerToast, ExternalToast } from "sonner";
import { debugLogger } from "./debug-logger";

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'message' | 'loading' | 'promise';

/**
 * Instrumented toast wrapper that logs all toast notifications.
 * Use this instead of importing from 'sonner' directly for automatic logging.
 */
export const instrumentedToast = {
  success: (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('success', msg);
    return sonnerToast.success(message, options);
  },

  error: (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('error', msg);
    return sonnerToast.error(message, options);
  },

  info: (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('info', msg);
    return sonnerToast.info(message, options);
  },

  warning: (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('warning', msg);
    return sonnerToast.warning(message, options);
  },

  // Pass-through for other toast methods
  message: sonnerToast.message,
  loading: sonnerToast.loading,
  promise: sonnerToast.promise,
  custom: sonnerToast.custom,
  dismiss: sonnerToast.dismiss,
};

/**
 * Hook into the global toast to log all notifications.
 * This patches the original sonner toast to add logging.
 */
export const patchGlobalToast = () => {
  if (typeof window === 'undefined') return;
  
  // Store originals
  const originalSuccess = sonnerToast.success;
  const originalError = sonnerToast.error;
  const originalInfo = sonnerToast.info;
  const originalWarning = sonnerToast.warning;

  // Override with logged versions
  (sonnerToast as any).success = (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('success', msg);
    return originalSuccess(message, options);
  };

  (sonnerToast as any).error = (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('error', msg);
    return originalError(message, options);
  };

  (sonnerToast as any).info = (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('info', msg);
    return originalInfo(message, options);
  };

  (sonnerToast as any).warning = (message: string | React.ReactNode, options?: ExternalToast) => {
    const msg = typeof message === 'string' ? message : 'React component';
    debugLogger.toast('warning', msg);
    return originalWarning(message, options);
  };

  console.log('%c[ToastInterceptor] Toast logging enabled', 'color: #22c55e;');
};

export default instrumentedToast;