import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { BookingStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      customerName,
      email,
      phone,
      serviceName,
      price,
      gpsCoordinates,
    }: {
      customerName: string;
      email: string;
      phone: string;
      serviceName: string;
      price: bigint;
      gpsCoordinates: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createBooking(
        customerName,
        email,
        phone,
        serviceName,
        price,
        gpsCoordinates,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: bigint;
      status: BookingStatus;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateBookingStatus(bookingId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
