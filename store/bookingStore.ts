import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface BookingState {
  checkIn:       Date | null;
  checkOut:      Date | null;
  adults:        number;
  teens:         number;
  babies:        number;
  children2to6:  number;
  children6to12: number;
  setCheckIn:       (date: Date | null) => void;
  setCheckOut:      (date: Date | null) => void;
  setAdults:        (n: number) => void;
  setTeens:         (n: number) => void;
  setBabies:        (n: number) => void;
  setChildren2to6:  (n: number) => void;
  setChildren6to12: (n: number) => void;
  reset:            () => void;
}

export const useBookingStore = create<BookingState>()(
  devtools(
    (set) => ({
      checkIn:       null,
      checkOut:      null,
      adults:        2,
      teens:         0,
      babies:        0,
      children2to6:  0,
      children6to12: 0,
      setCheckIn:       (date) => set({ checkIn: date }),
      setCheckOut:      (date) => set({ checkOut: date }),
      setAdults:        (n) => set({ adults:        Math.max(1, Math.min(6, n)) }),
      setTeens:         (n) => set({ teens:         Math.max(0, Math.min(6, n)) }),
      setBabies:        (n) => set({ babies:        Math.max(0, Math.min(4, n)) }),
      setChildren2to6:  (n) => set({ children2to6:  Math.max(0, Math.min(4, n)) }),
      setChildren6to12: (n) => set({ children6to12: Math.max(0, Math.min(4, n)) }),
      reset: () => set({
        checkIn: null, checkOut: null,
        adults: 2, teens: 0, babies: 0,
        children2to6: 0, children6to12: 0,
      }),
    }),
    { name: "gamma-apartmanok-booking" }
  )
);