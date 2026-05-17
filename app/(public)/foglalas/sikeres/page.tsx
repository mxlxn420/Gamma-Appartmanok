import { Suspense } from "react";
import StripeSuccessContent from "./StripeSuccessContent";

export const metadata = { title: "Sikeres fizetés – Gamma Apartmanok" };

export default function StripeSikeresPage() {
  return (
    <div className="min-h-screen bg-cream pt-28 pb-20 flex items-center justify-center">
      <div className="container-custom max-w-xl text-center">
        <Suspense>
          <StripeSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
