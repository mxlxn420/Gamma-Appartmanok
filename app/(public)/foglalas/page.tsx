import type { Metadata } from "next";
import BookingPage from "@/components/booking/BookingPage";

export const metadata: Metadata = {
  title: "Foglalás",
  description:
    "Foglaljon közvetlenül a Gamma Apartmanok Miskolctapolca 4 apartmanjából a legalacsonyabb áron — válasszon apartmant, vendégszámot és dátumot néhány lépésben.",
  alternates: { canonical: "/foglalas" },
  openGraph: {
    title: "Foglalás | Gamma Apartmanok",
    description: "Foglaljon közvetlenül a Gamma Apartmanok Miskolctapolca 4 apartmanjából a legalacsonyabb áron.",
    url: "https://gammaapartmanok.hu/foglalas",
  },
};

export default function FoglalasOldal() {
  return <BookingPage />;
}
