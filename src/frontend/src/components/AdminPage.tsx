import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllBookings, useUpdateBookingStatus } from "@/hooks/useQueries";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ClipboardList,
  DollarSign,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type Booking, BookingStatus } from "../backend.d";

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: BookingStatus }) {
  const config = {
    [BookingStatus.pending]: {
      label: "Pending",
      className: "bg-warning/20 text-warning-foreground border-warning/40",
    },
    [BookingStatus.confirmed]: {
      label: "Confirmed",
      className: "bg-secondary/20 text-secondary border-secondary/40",
    },
    [BookingStatus.completed]: {
      label: "Completed",
      className: "bg-success/20 text-success border-success/40",
    },
  };
  const c = config[status] ?? config[BookingStatus.pending];
  return (
    <Badge variant="outline" className={`font-semibold text-xs ${c.className}`}>
      {c.label}
    </Badge>
  );
}

function BookingCard({
  booking,
  index,
}: {
  booking: Booking;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const updateStatus = useUpdateBookingStatus();

  async function handleStatusChange(newStatus: string) {
    const status = newStatus as BookingStatus;
    try {
      await updateStatus.mutateAsync({ bookingId: booking.id, status });
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  }

  const ocidIndex = index + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card rounded-xl border-2 border-border shadow-card overflow-hidden"
      data-ocid={`admin.booking.row.${ocidIndex}`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-black text-secondary text-sm">
              #{booking.id.toString()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-foreground text-base leading-tight truncate">
              {booking.customerName}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5 truncate">
              {booking.serviceName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className="bg-primary text-primary-foreground font-display font-bold text-sm px-2.5">
            ₹{Number(booking.price).toLocaleString("en-IN")}
          </Badge>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Expand toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-muted/50 hover:bg-muted transition-colors text-xs text-muted-foreground font-semibold"
      >
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {formatTimestamp(booking.timestamp)}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {/* Expanded details */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 py-3 space-y-2.5 border-t border-border"
        >
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
            <span className="text-foreground font-medium">{booking.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
            <span className="text-foreground font-medium truncate">
              {booking.email}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
            <span className="text-foreground font-mono text-xs break-all">
              {booking.gpsCoordinates || "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-3.5 h-3.5 text-secondary flex-shrink-0" />
            <span className="text-foreground font-medium">
              ₹{Number(booking.price).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Status update */}
          <div className="pt-1">
            <Select
              value={booking.status}
              onValueChange={handleStatusChange}
              disabled={updateStatus.isPending}
            >
              <SelectTrigger className="h-9 text-xs border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={BookingStatus.pending}>
                  🟡 Pending
                </SelectItem>
                <SelectItem value={BookingStatus.confirmed}>
                  🔵 Confirmed
                </SelectItem>
                <SelectItem value={BookingStatus.completed}>
                  🟢 Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

interface AdminPageProps {
  onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
  const { data: bookings, isLoading, isError, refetch } = useGetAllBookings();

  const stats = bookings
    ? {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === BookingStatus.pending)
          .length,
        confirmed: bookings.filter((b) => b.status === BookingStatus.confirmed)
          .length,
        completed: bookings.filter((b) => b.status === BookingStatus.completed)
          .length,
        revenue: bookings.reduce((sum, b) => sum + Number(b.price), 0),
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-secondary border-b-4 border-primary sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-secondary-foreground hover:bg-secondary-foreground/10 rounded-xl"
            data-ocid="admin.back.button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Zap className="w-5 h-5 text-primary fill-primary" />
            <h1 className="font-display text-xl font-black text-secondary-foreground">
              Admin Bookings
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="text-secondary-foreground hover:bg-secondary-foreground/10 rounded-xl"
            data-ocid="admin.refresh.button"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats row */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="bg-card rounded-xl border-2 border-border shadow-card p-4 col-span-2">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="font-display text-3xl font-black text-foreground mt-1">
                ₹{stats.revenue.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total} total bookings
              </p>
            </div>
            {[
              {
                label: "Pending",
                value: stats.pending,
                color: "bg-warning/15 border-warning/30",
                text: "text-warning-foreground",
              },
              {
                label: "Confirmed",
                value: stats.confirmed,
                color: "bg-secondary/10 border-secondary/30",
                text: "text-secondary",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-xl border-2 ${s.color} p-4`}
              >
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${s.text} opacity-80`}
                >
                  {s.label}
                </p>
                <p
                  className={`font-display text-2xl font-black mt-1 ${s.text}`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Bookings list header */}
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-secondary" />
          <h2 className="font-display font-bold text-foreground text-lg">
            All Bookings
          </h2>
          {bookings && (
            <Badge variant="secondary" className="ml-auto">
              {bookings.length}
            </Badge>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3" data-ocid="admin.bookings.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border-2 border-border p-4 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div
            className="bg-destructive/10 border-2 border-destructive/30 rounded-xl p-6 text-center"
            data-ocid="admin.bookings.error_state"
          >
            <p className="font-display font-bold text-destructive text-lg">
              Failed to load bookings
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Check your connection and try again.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-3 border-destructive text-destructive hover:bg-destructive/10"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && bookings && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-xl border-2 border-dashed border-border p-10 text-center"
            data-ocid="admin.bookings.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-display font-bold text-foreground text-xl">
              No bookings yet
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
              When customers book services, they'll appear here.
            </p>
            <Button
              onClick={onBack}
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
            >
              Go to Booking Form
            </Button>
          </motion.div>
        )}

        {/* Bookings list */}
        {!isLoading && bookings && bookings.length > 0 && (
          <div className="space-y-3" data-ocid="admin.bookings.list">
            {bookings.map((booking, index) => (
              <BookingCard
                key={booking.id.toString()}
                booking={booking}
                index={index}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
