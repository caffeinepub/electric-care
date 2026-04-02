import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateBooking } from "@/hooks/useQueries";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const SERVICES = [
  { value: "AC Setup", label: "AC Setup", price: 1200, icon: "❄️" },
  { value: "Water Motor", label: "Water Motor Repair", price: 499, icon: "💧" },
  { value: "Fan Repair", label: "Fan Repair", price: 299, icon: "🌀" },
  { value: "Solar Setup", label: "Solar Panel Setup", price: 2500, icon: "☀️" },
];

const SERVICE_PRICE_MAP: Record<string, number> = {
  "AC Setup": 1200,
  "Water Motor": 499,
  "Fan Repair": 299,
  "Solar Setup": 2500,
};

interface SuccessState {
  bookingId: bigint;
  serviceName: string;
  price: number;
  customerName: string;
}

export function BookingPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "fetching" | "locked" | "error"
  >("idle");
  const [success, setSuccess] = useState<SuccessState | null>(null);

  const createBooking = useCreateBooking();

  const selectedService = SERVICES.find((s) => s.value === service);

  function fetchLocation() {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setLocationStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        setCoordinates(coords);
        setLocationStatus("locked");
        toast.success("Location captured successfully!");
      },
      () => {
        setLocationStatus("error");
        toast.error("Please enable GPS / Location access and try again.");
      },
      { timeout: 10000 },
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!service) {
      toast.error("Please select a service.");
      return;
    }
    if (!coordinates) {
      toast.error("Please capture your location before booking.");
      return;
    }

    const price = SERVICE_PRICE_MAP[service] ?? 0;

    try {
      const bookingId = await createBooking.mutateAsync({
        customerName: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        serviceName: service,
        price: BigInt(price),
        gpsCoordinates: coordinates,
      });

      setSuccess({
        bookingId,
        serviceName: service,
        price,
        customerName: name.trim(),
      });

      // Redirect to UPI payment
      const upiUrl = `upi://pay?pa=7275509792@upi&pn=ElectricCare&am=${price}&cu=INR`;
      window.location.href = upiUrl;
    } catch {
      toast.error("Booking failed. Please try again.");
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-background flex items-center justify-center px-4 py-12"
        data-ocid="booking.success_state"
      >
        <div className="w-full max-w-md">
          <div className="bg-card border-2 border-success/30 rounded-2xl shadow-card p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto w-20 h-20 rounded-full bg-success/10 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground text-sm">
                Your electrician is on the way.
              </p>
            </div>

            <div className="bg-muted rounded-xl p-4 space-y-3 text-left">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Booking ID
                </span>
                <span className="font-display font-bold text-secondary">
                  #{success.bookingId.toString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Customer</span>
                <span className="font-semibold text-foreground">
                  {success.customerName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Service</span>
                <span className="font-semibold text-foreground">
                  {success.serviceName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount</span>
                <Badge className="bg-primary text-primary-foreground font-display font-bold text-base px-3">
                  ₹{success.price.toLocaleString("en-IN")}
                </Badge>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Redirecting you to UPI payment… If not redirected,{" "}
              <a
                href={`upi://pay?pa=7275509792@upi&pn=ElectricCare&am=${success.price}&cu=INR`}
                className="text-secondary underline font-semibold"
              >
                click here to pay
              </a>
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSuccess(null);
                setName("");
                setEmail("");
                setPhone("");
                setService("");
                setCoordinates("");
                setLocationStatus("idle");
              }}
            >
              Book Another Service
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary border-b-4 border-secondary relative overflow-hidden">
        <div className="electric-stripe absolute inset-0 opacity-60" />
        <div className="relative px-4 py-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-1"
          >
            <div className="flex items-center gap-1">
              <Home className="w-7 h-7 text-secondary" strokeWidth={2.5} />
              <Zap className="w-6 h-6 text-secondary fill-secondary" />
            </div>
            <h1 className="font-display text-3xl font-black tracking-tight text-secondary">
              ELECTRIC CARE
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-0.5"
          >
            <p className="text-secondary/80 font-body text-xs font-semibold tracking-widest uppercase">
              Professional Electrician Services
            </p>
            <p className="text-secondary/70 font-body text-xs">
              Founder A/C: <span className="font-bold">7275509792</span>
            </p>
          </motion.div>
        </div>
      </header>

      {/* Service Tags */}
      <div className="px-4 py-4 flex gap-2 overflow-x-auto no-scrollbar">
        {SERVICES.map((s, i) => (
          <motion.button
            key={s.value}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setService(s.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-semibold font-body transition-all cursor-pointer ${
              service === s.value
                ? "bg-secondary border-secondary text-secondary-foreground"
                : "bg-card border-border text-muted-foreground hover:border-secondary/50"
            }`}
          >
            <span>{s.icon}</span>
            {s.label}
            {service === s.value && (
              <Badge className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0">
                ₹{s.price}
              </Badge>
            )}
          </motion.button>
        ))}
      </div>

      {/* Main Form */}
      <main className="px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-card rounded-2xl shadow-card border-2 border-border overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-secondary px-6 py-4 flex items-center gap-3">
            <ClipboardCheck className="w-5 h-5 text-secondary-foreground/80" />
            <h2 className="font-display text-lg font-bold text-secondary-foreground">
              Service Booking Form
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label
                htmlFor="custName"
                className="font-semibold text-foreground text-sm flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-secondary" />
                Customer Name
              </Label>
              <Input
                id="custName"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-input focus:border-secondary h-11 font-body"
                data-ocid="booking.name.input"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="custEmail"
                className="font-semibold text-foreground text-sm flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-secondary" />
                Email Address
              </Label>
              <Input
                id="custEmail"
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-input focus:border-secondary h-11 font-body"
                data-ocid="booking.email.input"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label
                htmlFor="custPhone"
                className="font-semibold text-foreground text-sm flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-secondary" />
                Phone Number
              </Label>
              <Input
                id="custPhone"
                type="tel"
                placeholder="10 digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={15}
                className="border-2 border-input focus:border-secondary h-11 font-body"
                data-ocid="booking.phone.input"
              />
            </div>

            {/* Service Select */}
            <div className="space-y-1.5">
              <Label
                htmlFor="serviceSelect"
                className="font-semibold text-foreground text-sm flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5 text-secondary" />
                Select Service
              </Label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger
                  id="serviceSelect"
                  className="border-2 border-input h-11 font-body"
                  data-ocid="booking.service.select"
                >
                  <SelectValue placeholder="Choose a service..." />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                        <span className="ml-auto text-secondary font-bold">
                          ₹{s.price.toLocaleString("en-IN")}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price badge */}
              <AnimatePresence>
                {selectedService && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 bg-accent rounded-lg px-3 py-2">
                      <span className="text-lg">{selectedService.icon}</span>
                      <span className="text-sm font-semibold text-foreground">
                        {selectedService.label}
                      </span>
                      <Badge className="ml-auto bg-secondary text-secondary-foreground font-display font-bold">
                        ₹{selectedService.price.toLocaleString("en-IN")}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* GPS Location */}
            <div className="space-y-2">
              <Label className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-secondary" />
                Home Location
              </Label>
              <Button
                type="button"
                onClick={fetchLocation}
                disabled={locationStatus === "fetching"}
                className="w-full h-11 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold font-body text-sm rounded-xl transition-all"
                data-ocid="booking.location.button"
              >
                {locationStatus === "fetching" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Getting Location…
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    {locationStatus === "locked"
                      ? "📍 Location Locked — Update"
                      : "📍 Click to Set House Location"}
                  </>
                )}
              </Button>

              <AnimatePresence>
                {locationStatus === "locked" && coordinates && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-lg px-3 py-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-success">
                        ✅ Location Locked!
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {coordinates}
                      </p>
                    </div>
                  </motion.div>
                )}
                {locationStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2"
                    data-ocid="booking.error_state"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                    <p className="text-xs text-destructive font-medium">
                      Location access denied. Please enable GPS and retry.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Error state for submission */}
            <AnimatePresence>
              {createBooking.isError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3"
                  data-ocid="booking.error_state"
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-destructive">
                      Booking Failed
                    </p>
                    <p className="text-xs text-destructive/80">
                      Please check your connection and try again.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <Button
              type="submit"
              disabled={createBooking.isPending}
              className="w-full h-13 bg-success hover:bg-success/90 text-success-foreground font-display font-bold text-base rounded-xl shadow-card transition-all hover:shadow-card-hover animate-pulse-yellow disabled:animate-none"
              data-ocid="booking.submit_button"
            >
              {createBooking.isPending ? (
                <span
                  className="flex items-center gap-2"
                  data-ocid="booking.loading_state"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Booking your service…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Confirm & Send Electrician
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: "⚡", label: "Fast Response" },
                { icon: "🛡️", label: "Insured Service" },
                { icon: "⭐", label: "5-Star Rated" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="text-center bg-muted rounded-xl py-2 px-1"
                >
                  <div className="text-lg">{item.icon}</div>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
