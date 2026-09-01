"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-cream pt-28 pb-20">
      <div className="container-custom max-w-lg text-center">
        <div className="section-badge">Hiba történt</div>
        <h1 className="font-serif text-display-lg font-light text-forest-900 mb-4">
          Valami elromlott.
        </h1>
        <p className="text-stone-500 mb-10 leading-relaxed">
          Elnézést a kellemetlenségért — próbálja meg újratölteni az oldalt. Ha a hiba továbbra is fennáll, keressen minket a{" "}
          <a href="mailto:gammaapartmanok@gmail.com" className="text-forest-700 underline">
            gammaapartmanok@gmail.com
          </a>{" "}
          címen.
        </p>
        <button onClick={reset} className="btn-accent inline-flex">
          Újrapróbálás
        </button>
      </div>
    </main>
  );
}
