/**
 * Simple Card component wrapper
 */
export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-lg bg-white ${className}`}>
      {children}
    </div>
  );
}
