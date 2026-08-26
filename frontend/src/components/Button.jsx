const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-black disabled:bg-gray-400',
  accent: 'bg-brand-accent text-black hover:brightness-95 disabled:opacity-50',
  outline: 'border border-brand text-brand hover:bg-gray-50 disabled:opacity-50',
  ghost: 'text-brand hover:bg-gray-100 disabled:opacity-50',
};

export default function Button({ variant = 'primary', className = '', as: As = 'button', ...props }) {
  return (
    <As
      className={`inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
