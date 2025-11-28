/**
 * Simple Button component
 */
export function Button({ children, onClick, className = '', variant = 'default', size = 'md', ...props }) {
  const variantClass = variant === 'outline' ? 'border border-gray-300 text-gray-900 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700';
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-sm' : 'px-4 py-2 text-base';
  return (
    <button className={`rounded font-semibold transition ${variantClass} ${sizeClass} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
