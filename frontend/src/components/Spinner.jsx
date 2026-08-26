export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}
