export type BookingStatus = "PENDING" | "CONFIRMED" | "PAID" | "CANCELLED" | "BLOCKED";

export interface BookingApartmentEntry {
  apartmentId: string;
  apartment: { id: string; name: string; slug: string };
  numberOfAdults: number;
  numberOfTeens: number;
  numberOfBabies: number;
  numberOfChildren2to6: number;
  numberOfChildren6to12: number;
}

export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestAddress?: string | null;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfTeens: number;
  numberOfBabies: number;
  numberOfChildren2to6: number;
  numberOfChildren6to12: number;
  notes?: string | null;
  checkIn: Date | string;
  checkOut: Date | string;
  nights: number;
  basePrice: number;
  childPrice2to6: number;
  childPrice6to12: number;
  guestSurcharge: number;
  cleaningFee: number;
  touristTax: number;
  totalPrice: number;
  depositAmount: number;
  depositPaidAt?: Date | string | null;
  depositPaidAmount?: number | null;
  depositPaidMethod?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraServices?: any;
  extraServicesTotal?: number;
  discountPercent?: number;
  discountAmount?: number;
  status: BookingStatus;
  paymentMethod?: string | null;
  paymentIntentId?: string | null;
  paidAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  apartments?: BookingApartmentEntry[];
}

export interface CreateBookingPayload {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  numberOfGuests: number;
  numberOfAdults: number;
  numberOfChildren2to6: number;
  numberOfChildren6to12: number;
  notes?: string;
  checkIn: string;
  checkOut: string;
}

export interface PricingRule {
  id: string;
  name: string;
  pricePerNight: number;
  price3: number;
  price4: number;
  price5: number;
  price6: number;
  weekendPrice: number;
  weekendPrice3: number;
  weekendPrice4: number;
  weekendPrice5: number;
  weekendPrice6: number;
  dateFrom?: Date | string | null;
  dateTo?: Date | string | null;
  minNights: number;
  childPrice2to6: number;
  childPrice6to12: number;
  extraGuestFee: number;
  extraGuestFrom: number;
  isActive: boolean;
  priority: number;
  depositPercent?: number;
  apartmentId?: string | null;
}

export interface PriceBreakdown {
  nights: number;
  pricePerNight: number;
  baseTotal: number;
  childTotal2to6: number;
  childTotal6to12: number;
  guestSurcharge: number;
  cleaningFee: number;
  touristTax: number;
  total: number;
  minNights: number;
  isValid: boolean;
  validationError?: string;
}

export interface BookedDateRange {
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
}

export interface BookingState {
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children2to6: number;
  children6to12: number;
  priceBreakdown: PriceBreakdown | null;
  isCalculating: boolean;
  step: "dates" | "details" | "confirm" | "success";
  isSubmitting: boolean;
  bookingId: string | null;
  setCheckIn: (date: Date | null) => void;
  setCheckOut: (date: Date | null) => void;
  setAdults: (n: number) => void;
  setChildren2to6: (n: number) => void;
  setChildren6to12: (n: number) => void;
  setStep: (step: BookingState["step"]) => void;
  setPriceBreakdown: (b: PriceBreakdown | null) => void;
  setBookingId: (id: string) => void;
  reset: () => void;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}