import { useCreateBooking } from "@/hooks/useQueries";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Job } from "./ElectricianDashboard";

const SERVICES = [
  { id: 1, icon: "☀️", name: "Solar Panel Setup", price: 2500 },
  { id: 2, icon: "🔋", name: "Inverter Battery Setup", price: 1200 },
  { id: 3, icon: "❄️", name: "AC Setup", price: 1200 },
  { id: 4, icon: "⚡", name: "Emergency Service", price: 999 },
  { id: 5, icon: "📺", name: "LCD Setup", price: 899 },
  { id: 6, icon: "📺", name: "LCD Repair", price: 899 },
  { id: 7, icon: "❄️", name: "AC Repair", price: 799 },
  { id: 8, icon: "🔊", name: "Sound System", price: 799 },
  { id: 9, icon: "🧺", name: "Washing Machine", price: 699 },
  { id: 10, icon: "🧊", name: "Fridge Repair", price: 699 },
  { id: 11, icon: "💧", name: "Water Cooler", price: 699 },
  { id: 12, icon: "🔥", name: "Geyser Repair", price: 499 },
  { id: 13, icon: "🌬️", name: "Air Cooler", price: 499 },
  { id: 14, icon: "⚙️", name: "Water Motor Setup", price: 499 },
  { id: 15, icon: "⚙️", name: "Water Motor Repair", price: 399 },
  { id: 16, icon: "🧹", name: "Vacuum Cleaner", price: 399 },
  { id: 17, icon: "🍳", name: "Gas Stove", price: 399 },
  { id: 18, icon: "🍞", name: "Oven Repair", price: 399 },
  { id: 19, icon: "🔌", name: "MCB Repair", price: 399 },
  { id: 20, icon: "🌀", name: "Fan Repair", price: 299 },
  { id: 21, icon: "🔘", name: "Switch Board", price: 299 },
  { id: 22, icon: "🔥", name: "Heater", price: 299 },
  { id: 23, icon: "🥤", name: "Mixer", price: 299 },
  { id: 24, icon: "📶", name: "WiFi Setup", price: 299 },
  { id: 25, icon: "💧", name: "Purifier Repair", price: 299 },
  { id: 26, icon: "🔋", name: "Inverter Repair", price: 299 },
];

const ELECTRICIAN_IDS = ["ELE001", "ELE002", "ELE003"];

function assignJob(
  customerName: string,
  phone: string,
  address: string,
  serviceName: string,
  price: number,
  electricianId: string,
) {
  const existing: Job[] = JSON.parse(localStorage.getItem("ecareJobs") || "[]");

  const now = new Date();
  const expiry = new Date(now);
  expiry.setDate(expiry.getDate() + 3);

  const job: Job = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    electricianId,
    customerName,
    phone,
    address,
    service: serviceName,
    price,
    status: "new",
    warranty: "3 Days",
    expiryDate: expiry.toLocaleDateString("en-IN"),
    createdAt: now.toLocaleDateString("en-IN"),
  };

  existing.push(job);
  localStorage.setItem("ecareJobs", JSON.stringify(existing));
  return job;
}

export function HomePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [assignTo, setAssignTo] = useState("ELE001");
  const [confirmed, setConfirmed] = useState(false);
  const [orderId] = useState(() =>
    Math.floor(100000 + Math.random() * 900000).toString(),
  );
  const createBooking = useCreateBooking();
  const currentYear = new Date().getFullYear();

  const selectedService = SERVICES.find((s) => s.id === selectedId);

  async function handleBook() {
    if (!selectedService) {
      toast.error("Pehle koi service chunein!");
      return;
    }
    if (!name.trim()) {
      toast.error("Apna naam darj karein");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Sahi phone number darj karein");
      return;
    }
    if (!address.trim()) {
      toast.error("Address darj karein");
      return;
    }

    try {
      await createBooking.mutateAsync({
        customerName: name.trim(),
        email: "",
        phone: phone.trim(),
        serviceName: selectedService.name,
        price: BigInt(selectedService.price),
        gpsCoordinates: address.trim(),
      });

      // Assign job to electrician (Firebase simulation via localStorage)
      assignJob(
        name.trim(),
        phone.trim(),
        address.trim(),
        selectedService.name,
        selectedService.price,
        assignTo,
      );

      // Update admin earnings in localStorage
      const adminExisting = Number.parseFloat(
        localStorage.getItem("ecareAdminEarnings") || "0",
      );
      const adminShare = selectedService.price * 0.25;
      localStorage.setItem(
        "ecareAdminEarnings",
        (adminExisting + adminShare).toFixed(2),
      );

      // Save transaction history
      const txns = JSON.parse(localStorage.getItem("ecareTxns") || "[]");
      txns.unshift({
        id: orderId,
        service: selectedService.name,
        price: selectedService.price,
        date: new Date().toLocaleDateString("en-IN"),
        earn: selectedService.price * 0.75,
      });
      localStorage.setItem("ecareTxns", JSON.stringify(txns.slice(0, 10)));

      setConfirmed(true);
      toast.success("Booking confirmed! ✅");
      setTimeout(() => {
        window.location.href = `upi://pay?pa=7275509792@upi&pn=ElectricCare&am=${selectedService.price}&cu=INR`;
      }, 800);
    } catch {
      toast.error("Booking failed. Dobara try karein.");
    }
  }

  if (confirmed && selectedService) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[480px] mx-auto min-h-screen bg-app-bg flex items-center justify-center px-4"
        data-ocid="booking.success_state"
      >
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center w-full space-y-5">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto text-4xl">
            ✅
          </div>
          <div>
            <h2 className="font-display text-2xl font-black text-electric-blue">
              Booking Confirmed!
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Aapka electrician aa raha hai
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order ID</span>
              <span className="font-bold text-gray-800">#{orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Service</span>
              <span className="font-bold text-gray-800">
                {selectedService.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-black text-electric-blue text-base">
                ₹{selectedService.price.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Customer</span>
              <span className="font-bold text-gray-800">{name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Assigned To</span>
              <span className="font-bold text-electric-blue">{assignTo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Warranty</span>
              <span className="font-bold text-electric-green">
                3 Days Warranty ✅
              </span>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-800 font-bold">
              💳 UPI Payment ke liye redirect ho raha hai…
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              UPI ID: <span className="font-black">7275509792@upi</span>
            </p>
          </div>
          <button
            type="button"
            data-ocid="booking.new_button"
            onClick={() => {
              setConfirmed(false);
              setSelectedId(null);
              setName("");
              setPhone("");
              setAddress("");
            }}
            className="w-full bg-electric-blue text-white font-black py-4 rounded-full font-body text-sm hover:brightness-110 transition-all"
          >
            Naya Booking Karein
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto bg-app-bg min-h-screen">
      <div className="bg-electric-yellow text-electric-blue text-center text-xs font-bold py-2 px-3 tracking-wide">
        ELECTRICIAN REGISTRATION OPEN: JOIN AT ₹499 (AGE 18+)
      </div>

      <header className="bg-electric-blue px-4 py-5 text-center border-b-4 border-electric-yellow">
        <span className="text-electric-yellow text-3xl font-black font-display tracking-tight">
          ⚡ ELECTRIC CARE
        </span>
        <p className="text-electric-yellow/80 text-xs font-semibold tracking-widest uppercase font-body mt-1">
          Ghar Baithe Service Paayein
        </p>
      </header>

      <div className="bg-white mx-3 mt-4 rounded-2xl p-4 text-center shadow-sm border border-gray-100">
        <p className="font-black text-xs text-gray-700 mb-2">
          🔒 SECURE PAYMENTS ACCEPTED
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          {["UPI", "RuPay", "VISA", "Mastercard", "Net Banking", "COD"].map(
            (m) => (
              <span
                key={m}
                className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded"
              >
                {m}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="px-3 pt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-electric-blue text-sm font-display">
            🔧 Service Chunein ({SERVICES.length} Services)
          </p>
          <span className="text-[10px] bg-electric-green/10 text-electric-green font-bold px-2 py-0.5 rounded-full border border-electric-green/20">
            🛡️ 3 Days Warranty
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SERVICES.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              data-ocid={`service.item.${i + 1}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedId(selectedId === s.id ? null : s.id)}
              className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${
                selectedId === s.id
                  ? "bg-electric-blue border-electric-blue text-white shadow-md"
                  : "bg-white border-gray-100 text-gray-700 hover:border-electric-blue/30 shadow-sm"
              }`}
            >
              {selectedId === s.id && (
                <span className="absolute top-1.5 right-1.5 text-[10px] bg-electric-yellow text-electric-blue font-black px-1 rounded">
                  ✓
                </span>
              )}
              <span className="text-2xl mb-1">{s.icon}</span>
              <span className="text-[10px] font-bold font-body leading-tight">
                {s.name}
              </span>
              <span
                className={`text-xs font-black mt-0.5 ${
                  selectedId === s.id
                    ? "text-electric-yellow"
                    : "text-electric-blue"
                }`}
              >
                ₹{s.price.toLocaleString("en-IN")}
              </span>
              <span
                className={`text-[9px] mt-0.5 font-semibold ${
                  selectedId === s.id ? "text-white/70" : "text-electric-green"
                }`}
              >
                3D Warranty
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-3 pb-6">
        <AnimatePresence>
          {selectedService && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-electric-yellow/10 border-2 border-electric-yellow rounded-2xl p-3 mb-3 flex items-center justify-between"
            >
              <span className="text-sm font-semibold text-electric-blue font-body">
                {selectedService.icon} {selectedService.name}
              </span>
              <div className="text-right">
                <span className="font-black text-electric-blue text-base block">
                  ₹{selectedService.price.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-electric-green font-bold">
                  3 Days Warranty
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-electric-blue px-5 py-3">
            <h2 className="text-electric-yellow font-black font-display text-base">
              📋 Booking Details
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label
                htmlFor="book-name"
                className="text-xs font-bold text-gray-600 font-body block mb-1"
              >
                👤 Aapka Naam *
              </label>
              <input
                id="book-name"
                type="text"
                placeholder="Full name darj karein"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-ocid="booking.name.input"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="book-phone"
                className="text-xs font-bold text-gray-600 font-body block mb-1"
              >
                📱 Phone Number *
              </label>
              <input
                id="book-phone"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={15}
                data-ocid="booking.phone.input"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="book-address"
                className="text-xs font-bold text-gray-600 font-body block mb-1"
              >
                📍 Ghar ka Address *
              </label>
              <textarea
                id="book-address"
                placeholder="Street, Area, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                data-ocid="booking.address.textarea"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Electrician Assignment */}
            <div>
              <label
                htmlFor="assign-to"
                className="text-xs font-bold text-gray-600 font-body block mb-1"
              >
                ⚡ Electrician Assign Karein
              </label>
              <select
                id="assign-to"
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                data-ocid="booking.electrician.select"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors bg-white"
              >
                {ELECTRICIAN_IDS.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              data-ocid="booking.submit_button"
              onClick={handleBook}
              disabled={createBooking.isPending}
              className="w-full bg-electric-green text-white font-black text-base py-4 rounded-full shadow-[0_4px_16px_rgba(40,167,69,0.35)] hover:brightness-105 active:scale-[0.98] transition-all font-body disabled:opacity-70"
            >
              {createBooking.isPending
                ? "Booking ho raha hai…"
                : "✅ BOOK & PAY NOW"}
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 bg-green-50 rounded-xl py-2.5 px-4 border border-green-100">
          <span className="text-base">🛡️</span>
          <p className="text-xs text-electric-green font-bold font-body">
            3 Days Warranty on ALL Services
          </p>
        </div>

        <div className="text-center text-gray-300 text-[10px] mt-4 pb-2">
          © {currentYear}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
