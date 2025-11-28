/**
 * Simple ScrollArea component (just wraps children in a div with overflow)
 */
export function ScrollArea({ children, className = '' }) {
  return (
    <div className={`overflow-auto ${className}`}>
      {children}
    </div>
  );
}
