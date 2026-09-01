import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center bg-cream pt-28 pb-20">
        <div className="container-custom max-w-lg text-center">
          <div className="section-badge">404</div>
          <h1 className="font-serif text-display-lg font-light text-forest-900 mb-4">
            Ez az oldal nem található.
          </h1>
          <p className="text-stone-500 mb-10 leading-relaxed">
            A keresett oldal nem létezik, vagy időközben átkerült máshova. Ellenőrizze a linket, vagy térjen vissza a kezdőlapra.
          </p>
          <Link href="/" className="btn-accent inline-flex">
            Vissza a kezdőlapra
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
