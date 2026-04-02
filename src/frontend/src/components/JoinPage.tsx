import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const BENEFITS = [
  { icon: "⏰", title: "Flexible Hours", desc: "Apne samay par kaam karein" },
  {
    icon: "💰",
    title: "Daily Earnings",
    desc: "Roz ₹500–₹2000 tak kama sakte hain",
  },
  { icon: "📚", title: "Free Training", desc: "Naye skills sikhne ka mauka" },
  { icon: "🛡️", title: "Job Security", desc: "Har mahine guaranteed kaam" },
  { icon: "📱", title: "App Support", desc: "Sab kuch app se manage karein" },
  {
    icon: "🏆",
    title: "Top Performer Bonus",
    desc: "Extra income top workers ko",
  },
];

function generateElectricianId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ELE${num}`;
}

export function JoinPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [city, setCity] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [electricianId, setElectricianId] = useState("");
  const [step, setStep] = useState<"form" | "payment">("form");

  function handleContinue() {
    if (!name.trim()) {
      toast.error("Poora naam darj karein");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Sahi phone number darj karein");
      return;
    }
    if (!aadhaar.trim() || aadhaar.replace(/\D/g, "").length < 12) {
      toast.error("12-digit Aadhaar number darj karein");
      return;
    }
    if (!pan.trim() || pan.length < 10) {
      toast.error("Valid PAN number darj karein (e.g. ABCDE1234F)");
      return;
    }
    if (!city.trim()) {
      toast.error("Apna sheher darj karein");
      return;
    }
    setStep("payment");
  }

  function handlePayAndRegister() {
    const id = generateElectricianId();
    setElectricianId(id);

    // Save to localStorage (simulating Firebase electricians/ path)
    const regs = JSON.parse(localStorage.getItem("ecareElectricians") || "[]");
    regs.push({
      id,
      name,
      phone,
      aadhaar,
      pan,
      city,
      hasVideo: !!videoFile,
      date: new Date().toLocaleDateString("en-IN"),
      fee: 499,
      status: "pending",
    });
    localStorage.setItem("ecareElectricians", JSON.stringify(regs));

    setSubmitted(true);
    toast.success("Registration submitted! ✅");

    // Trigger UPI payment (simulates Razorpay checkout.open)
    setTimeout(() => {
      window.location.href =
        "upi://pay?pa=7275509792@upi&pn=ElectricCareJoin&am=499&cu=INR&tn=ElectricianRegistrationFee";
    }, 600);
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[480px] mx-auto min-h-screen bg-app-bg flex items-center justify-center px-4"
        data-ocid="join.success_state"
      >
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center w-full space-y-4">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto text-4xl">
            ✅
          </div>
          <h2 className="font-display text-xl font-black text-electric-blue">
            Registration Submitted!
          </h2>
          <p className="text-electric-green font-bold text-sm font-body">
            हमारी टीम 24 घंटे में संपर्क करेगी
          </p>

          <div className="bg-electric-blue/5 rounded-2xl p-4 text-left space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 font-body">
                Electrician ID
              </span>
              <span className="font-black text-electric-blue text-sm font-display">
                {electricianId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-body">Name</span>
              <span className="text-xs font-bold font-body">{name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-body">Phone</span>
              <span className="text-xs font-bold font-body">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-body">City</span>
              <span className="text-xs font-bold font-body">{city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500 font-body">
                Registration Fee
              </span>
              <span className="text-xs font-bold text-electric-green font-body">
                ₹499 ✅
              </span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <p className="text-xs text-yellow-800 font-bold">
              💳 ₹499 UPI payment ke liye redirect ho raha hai…
            </p>
            <p className="text-xs text-yellow-600 mt-0.5">
              UPI ID: 7275509792@upi
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-3">
            <p className="text-xs text-blue-700 font-bold">
              📱 Dashboard Access
            </p>
            <p className="text-[11px] text-blue-600 mt-0.5">
              Electrician tab mein apna ID <strong>{electricianId}</strong> use
              karein
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitted(false);
              setStep("form");
              setName("");
              setPhone("");
              setAadhaar("");
              setPan("");
              setCity("");
              setVideoFile(null);
            }}
            className="text-electric-blue text-xs font-body underline"
          >
            Wapas jaayein
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto bg-app-bg min-h-screen">
      <header className="bg-electric-blue px-4 py-5 text-center border-b-4 border-electric-yellow">
        <h1 className="text-electric-yellow text-2xl font-black font-display">
          👷 Electrician Bano
        </h1>
        <p className="text-electric-yellow/70 text-xs font-body mt-0.5">
          Electric Care team mein join karein
        </p>
      </header>

      <div className="px-3 pt-4 space-y-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-electric-blue to-blue-700 rounded-3xl p-6 text-white text-center shadow-lg"
        >
          <div className="text-5xl mb-3">⚡</div>
          <h2 className="font-black text-xl font-display mb-2">
            Electric Care mein Join Karein
          </h2>
          <p className="text-white/80 text-xs font-body leading-relaxed mb-4">
            Aaj hi electrician ke roop mein register karein aur ghar baithe
            earning shuru karein!
          </p>
          <div className="bg-white/15 rounded-2xl px-4 py-3 inline-block">
            <p className="text-white/70 text-xs font-body">
              One-time Registration Fee
            </p>
            <p className="font-black text-3xl font-display text-electric-yellow">
              ₹499
            </p>
            <p className="text-white/60 text-[10px] font-body">
              Age 18+ • Sirf ek baar • KYC Required
            </p>
          </div>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-1">
          <div
            className={`flex-1 h-1.5 rounded-full transition-colors ${step === "form" || step === "payment" ? "bg-electric-blue" : "bg-gray-200"}`}
          />
          <div
            className={`flex-1 h-1.5 rounded-full transition-colors ${step === "payment" ? "bg-electric-green" : "bg-gray-200"}`}
          />
          <span className="text-[10px] text-gray-400 font-body ml-1">
            {step === "form" ? "Step 1/2" : "Step 2/2"}
          </span>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-electric-blue px-5 py-3">
                <h3 className="text-electric-yellow font-black font-display text-sm">
                  📝 KYC Registration Form
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {/* Name */}
                <div>
                  <label
                    htmlFor="join-name"
                    className="text-xs font-bold text-gray-600 font-body block mb-1"
                  >
                    👤 Poora Naam *
                  </label>
                  <input
                    id="join-name"
                    type="text"
                    placeholder="Full name darj karein"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-ocid="join.name.input"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="join-phone"
                    className="text-xs font-bold text-gray-600 font-body block mb-1"
                  >
                    📱 Phone Number *
                  </label>
                  <input
                    id="join-phone"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={15}
                    data-ocid="join.phone.input"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors"
                  />
                </div>

                {/* Aadhaar */}
                <div>
                  <label
                    htmlFor="join-aadhaar"
                    className="text-xs font-bold text-gray-600 font-body block mb-1"
                  >
                    🪪 Aadhaar Number *{" "}
                    <span className="text-gray-400 font-normal">
                      (12 digits)
                    </span>
                  </label>
                  <input
                    id="join-aadhaar"
                    type="text"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaar}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 12);
                      const formatted = raw
                        .replace(/(\d{4})(?=\d)/g, "$1 ")
                        .trim();
                      setAadhaar(raw);
                      e.target.value = formatted;
                    }}
                    maxLength={14}
                    data-ocid="join.aadhaar.input"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors tracking-widest"
                  />
                </div>

                {/* PAN */}
                <div>
                  <label
                    htmlFor="join-pan"
                    className="text-xs font-bold text-gray-600 font-body block mb-1"
                  >
                    🏦 PAN Card Number *{" "}
                    <span className="text-gray-400 font-normal">
                      (e.g. ABCDE1234F)
                    </span>
                  </label>
                  <input
                    id="join-pan"
                    type="text"
                    placeholder="ABCDE1234F"
                    value={pan}
                    onChange={(e) =>
                      setPan(e.target.value.toUpperCase().slice(0, 10))
                    }
                    maxLength={10}
                    data-ocid="join.pan.input"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors uppercase tracking-widest font-bold"
                  />
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="join-city"
                    className="text-xs font-bold text-gray-600 font-body block mb-1"
                  >
                    🏙️ Aapka Sheher *
                  </label>
                  <input
                    id="join-city"
                    type="text"
                    placeholder="City darj karein"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    data-ocid="join.city.input"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors"
                  />
                </div>

                {/* Video Upload */}
                <div>
                  <label
                    htmlFor="join-video"
                    className="text-xs font-bold text-gray-600 font-body block mb-1"
                  >
                    🎥 Introduction Video{" "}
                    <span className="text-gray-400 font-normal">
                      (optional, max 30 sec)
                    </span>
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-electric-blue transition-colors relative">
                    <input
                      id="join-video"
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setVideoFile(f);
                        if (f) toast.success(`Video selected: ${f.name}`);
                      }}
                      data-ocid="join.video.input"
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    {videoFile ? (
                      <div className="space-y-1">
                        <span className="text-2xl block">✅</span>
                        <p className="text-xs font-bold text-electric-green font-body">
                          {videoFile.name}
                        </p>
                        <p className="text-[10px] text-gray-400 font-body">
                          ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-2xl block">📹</span>
                        <p className="text-xs text-gray-400 font-body">
                          Video upload karein ya tap karein
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                  <p className="text-[10px] text-yellow-700 font-body">
                    ⚠️ <strong>Age 18+</strong> required. Sari details sahi
                    bharein. Agle step mein ₹499 payment karein.
                  </p>
                </div>

                <button
                  type="button"
                  data-ocid="join.continue.button"
                  onClick={handleContinue}
                  className="w-full bg-electric-blue text-white font-black text-base py-4 rounded-full shadow-[0_4px_16px_rgba(0,74,173,0.35)] hover:brightness-110 active:scale-[0.98] transition-all font-body"
                >
                  NEXT → Payment Step
                </button>
              </div>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="bg-electric-green px-5 py-3">
                <h3 className="text-white font-black font-display text-sm">
                  💳 Registration Fee Payment
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-gray-600 font-body">
                    Registration Summary
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 font-body">
                      Name
                    </span>
                    <span className="text-xs font-bold font-body">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 font-body">
                      Phone
                    </span>
                    <span className="text-xs font-bold font-body">{phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 font-body">
                      Aadhaar
                    </span>
                    <span className="text-xs font-bold font-body">
                      XXXX XXXX {aadhaar.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 font-body">PAN</span>
                    <span className="text-xs font-bold font-body">{pan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 font-body">
                      City
                    </span>
                    <span className="text-xs font-bold font-body">{city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-500 font-body">
                      Video
                    </span>
                    <span className="text-xs font-bold font-body">
                      {videoFile ? "✅ Uploaded" : "—"}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="text-sm font-bold text-gray-700 font-body">
                      Registration Fee
                    </span>
                    <span className="text-lg font-black text-electric-blue font-display">
                      ₹499
                    </span>
                  </div>
                </div>

                {/* Razorpay-style payment options */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-600 font-body">
                    Payment Method
                  </p>
                  <div className="border-2 border-electric-blue rounded-xl p-3 bg-blue-50 flex items-center gap-3">
                    <div className="w-8 h-8 bg-electric-blue rounded-lg flex items-center justify-center text-white text-xs font-black">
                      UPI
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800 font-body">
                        UPI Payment
                      </p>
                      <p className="text-[10px] text-gray-500 font-body">
                        7275509792@upi
                      </p>
                    </div>
                    <span className="text-electric-green text-sm">✓</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {["PhonePe", "GPay", "Paytm", "BHIM"].map((app) => (
                      <div
                        key={app}
                        className="border border-gray-200 rounded-lg p-2 text-center"
                      >
                        <p className="text-[10px] text-gray-500 font-body">
                          {app}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  data-ocid="join.pay.button"
                  onClick={handlePayAndRegister}
                  className="w-full bg-electric-green text-white font-black text-base py-4 rounded-full shadow-[0_4px_16px_rgba(40,167,69,0.35)] hover:brightness-110 active:scale-[0.98] transition-all font-body"
                >
                  ⚡ PAY ₹499 & REGISTER
                </button>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full text-gray-400 text-xs font-body py-2"
                >
                  ← Wapas jaayein
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-electric-blue font-display text-sm mb-4">
            🌟 Benefits &amp; Fayde
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.14 + i * 0.05 }}
                className="bg-gray-50 rounded-xl p-3 border border-gray-100"
              >
                <span className="text-xl block mb-1">{b.icon}</span>
                <p className="font-bold text-gray-800 text-xs font-body">
                  {b.title}
                </p>
                <p className="text-gray-500 text-[10px] font-body mt-0.5 leading-tight">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 font-body mb-1">
            Koi sawaal? Hamse baat karein
          </p>
          <a
            href="tel:7275509792"
            className="font-black text-electric-blue text-lg font-display block"
          >
            📞 7275509792
          </a>
          <p className="text-[10px] text-gray-400 font-body mt-0.5">
            Admin / Founder
          </p>
        </div>
      </div>
    </div>
  );
}
