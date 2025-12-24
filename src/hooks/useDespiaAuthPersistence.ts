/**
 * @deprecated This hook is no longer needed.
 * Auth persistence for Despia native apps is now handled directly in AuthContext.tsx
 * via the consolidated visibility change and focus event handlers.
 * 
 * This file is kept for backwards compatibility but does nothing.
 * You can safely remove any usages of this hook.
 */
export const useDespiaAuthPersistence = () => {
  // No-op: Auth persistence is now handled in AuthContext
};
