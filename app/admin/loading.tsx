export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-stone-200 rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-24 bg-stone-200 rounded-2xl" />
        <div className="h-24 bg-stone-200 rounded-2xl" />
        <div className="h-24 bg-stone-200 rounded-2xl" />
      </div>
      <div className="h-64 bg-stone-200 rounded-2xl" />
    </div>
  );
}
