export function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1 block font-medium text-gray-700">{label}</span>}
      <input
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1 block font-medium text-gray-700">{label}</span>}
      <textarea
        className={`w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="mb-1 block font-medium text-gray-700">{label}</span>}
      <select
        className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
