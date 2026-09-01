export default function FoglalasLoading() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-20">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-12 animate-pulse">
          <div className="h-4 w-24 bg-forest-100 rounded-full mx-auto mb-4" />
          <div className="h-9 w-72 bg-forest-100 rounded-lg mx-auto" />
        </div>
        <div className="flex items-center justify-center gap-2 mb-12 flex-wrap animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-28 bg-stone-100 rounded-full" />
          ))}
        </div>
        <div className="h-96 bg-white rounded-3xl shadow-card animate-pulse" />
      </div>
    </div>
  );
}
