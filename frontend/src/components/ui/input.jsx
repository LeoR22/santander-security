/**
 * Simple Input component
 */
export function Input({ placeholder = '', value, onChange, onKeyDown, className = '', ...props }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      className={`border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-600 ${className}`}
      {...props}
    />
  );
}
