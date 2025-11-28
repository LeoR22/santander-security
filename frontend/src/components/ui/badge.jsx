/**
 * Simple Badge component
 */
export function Badge({ children, className = '', variant = 'default' }) {
  const variantClass = variant === 'outline' ? 'border border-current' : '';
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${variantClass} ${className}`}>
      {children}
    </span>
  );
}
