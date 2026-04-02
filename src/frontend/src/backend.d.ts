import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Booking {
    id: bigint;
    customerName: string;
    status: BookingStatus;
    serviceName: string;
    gpsCoordinates: string;
    email: string;
    timestamp: Time;
    phone: string;
    price: bigint;
}
export type Time = bigint;
export enum BookingStatus {
    pending = "pending",
    completed = "completed",
    confirmed = "confirmed"
}
export interface backendInterface {
    createBooking(customerName: string, email: string, phone: string, serviceName: string, price: bigint, gpsCoordinates: string): Promise<bigint>;
    getAllBookings(): Promise<Array<Booking>>;
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
}
