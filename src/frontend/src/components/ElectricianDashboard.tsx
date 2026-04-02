import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export interface Job {
  id: string;
  electricianId: string;
  customerName: string;
  phone: string;
  address: string;
  service: string;
  price: number;
  status: "new" | "accepted" | "completed";
  warranty: string;
  expiryDate: string;
  createdAt: string;
}

const ELECTRICIAN_IDS = ["ELE001", "ELE002", "ELE003"];

function getJobs(): Job[] {
  try {
    return JSON.parse(localStorage.getItem("ecareJobs") || "[]");
  } catch {
    return [];
  }
}

function saveJobs(jobs: Job[]) {
  localStorage.setItem("ecareJobs", JSON.stringify(jobs));
}

function getWallet(eId: string): number {
  return Number.parseFloat(localStorage.getItem(`ecareWallet_${eId}`) || "0");
}

function setWallet(eId: string, val: number) {
  localStorage.setItem(`ecareWallet_${eId}`, val.toFixed(2));
}

const STATUS_LABELS: Record<Job["status"], string> = {
  new: "नया",
  accepted: "स्वीकृत",
  completed: "पूर्ण",
};

const STATUS_COLORS: Record<Job["status"], string> = {
  new: "bg-electric-yellow text-electric-blue",
  accepted: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-electric-green",
};

export function ElectricianDashboard() {
  const [electricianId, setElectricianId] = useState("");
  const [enteredId, setEnteredId] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [wallet, setWalletState] = useState(0);
  const [withdrawing, setWithdrawing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll jobs from localStorage every 3s when electrician is logged in
  useEffect(() => {
    if (!electricianId) {
      setJobs([]);
      return;
    }

    function refreshJobs() {
      const all = getJobs();
      const mine = all.filter((j) => j.electricianId === electricianId);
      setJobs((prev) => {
        // Detect new jobs for toast notification
        if (prev.length > 0 && mine.length > prev.length) {
          const prevIds = new Set(prev.map((j) => j.id));
          const newOnes = mine.filter((j) => !prevIds.has(j.id));
          if (newOnes.length > 0) {
            toast.success(`🔔 Naya kaam mila! ${newOnes[0].service}`);
          }
        }
        return mine;
      });
      setWalletState(getWallet(electricianId));
    }

    refreshJobs();
    pollingRef.current = setInterval(refreshJobs, 3000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [electricianId]);

  function handleLogin() {
    const id = enteredId.trim().toUpperCase();
    if (!id) {
      toast.error("Electrician ID darj karein");
      return;
    }
    setElectricianId(id);
    toast.success(`Logged in as ${id}`);
  }

  function handleAccept(jobId: string) {
    const all = getJobs();
    const updated = all.map((j) =>
      j.id === jobId && j.status === "new"
        ? { ...j, status: "accepted" as const }
        : j,
    );
    saveJobs(updated);
    setJobs(updated.filter((j) => j.electricianId === electricianId));
    toast.success("Kaam sweekar kar liya! ✅");
  }

  function handleComplete(jobId: string, price: number) {
    const all = getJobs();
    const updated = all.map((j) =>
      j.id === jobId && j.status === "accepted"
        ? { ...j, status: "completed" as const }
        : j,
    );
    saveJobs(updated);

    // Update wallet: 75% of price
    const earn = price * 0.75;
    const current = getWallet(electricianId);
    const newBal = current + earn;
    setWallet(electricianId, newBal);
    setWalletState(newBal);

    setJobs(updated.filter((j) => j.electricianId === electricianId));
    toast.success(`Kaam pura! ₹${earn.toFixed(0)} wallet mein credit hua 💰`);
  }

  function handleWithdraw() {
    if (wallet < 200) {
      toast.error("Minimum ₹200 chahiye withdraw ke liye");
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      const newBal = wallet - 200;
      setWallet(electricianId, newBal);
      setWalletState(newBal);
      setWithdrawing(false);
      toast.success("₹200 withdraw ho gaya! 🎉");
    }, 1500);
  }

  const newCount = jobs.filter((j) => j.status === "new").length;
  const acceptedCount = jobs.filter((j) => j.status === "accepted").length;
  const completedCount = jobs.filter((j) => j.status === "completed").length;

  // ── Login Screen ──────────────────────────────────────────────────────────
  if (!electricianId) {
    return (
      <div className="max-w-[480px] mx-auto bg-app-bg min-h-screen">
        <header className="bg-electric-blue px-4 py-5 text-center border-b-4 border-electric-yellow">
          <h1 className="text-electric-yellow text-2xl font-black font-display">
            ⚡ Electrician Dashboard
          </h1>
          <p className="text-electric-yellow/70 text-xs font-body mt-0.5">
            Real-time job updates • Live wallet
          </p>
        </header>

        <div className="px-4 pt-10 pb-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-5"
          >
            <div className="text-center">
              <span className="text-5xl block mb-3">👷</span>
              <h2 className="font-black text-electric-blue text-lg font-display">
                Apna ID Enter Karein
              </h2>
              <p className="text-gray-400 text-xs font-body mt-1">
                Jobs dekhne ke liye login karein
              </p>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="ele-id"
                className="text-xs font-bold text-gray-600 font-body block"
              >
                Electrician ID
              </label>
              <input
                id="ele-id"
                type="text"
                placeholder="e.g. ELE001"
                value={enteredId}
                onChange={(e) => setEnteredId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                data-ocid="dashboard.id.input"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-body focus:border-electric-blue focus:outline-none transition-colors uppercase tracking-widest text-center font-bold"
              />
            </div>

            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-body text-center mb-2">
                Demo IDs:
              </p>
              <div className="flex gap-2 justify-center">
                {ELECTRICIAN_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setEnteredId(id)}
                    className="px-3 py-1.5 bg-electric-blue/10 text-electric-blue text-xs font-bold rounded-lg font-body hover:bg-electric-blue/20 transition-colors"
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              data-ocid="dashboard.login.button"
              onClick={handleLogin}
              className="w-full bg-electric-blue text-white font-black py-4 rounded-full font-body text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(0,74,173,0.35)]"
            >
              ⚡ Dashboard Kholo
            </button>
          </motion.div>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🔔", label: "Live Updates", sub: "Har 3 sec" },
              { icon: "💰", label: "75% Share", sub: "Aapka hissa" },
              { icon: "🛡️", label: "3 Day", sub: "Warranty" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm"
              >
                <span className="text-2xl block mb-1">{item.icon}</span>
                <p className="font-bold text-gray-800 text-[11px] font-body">
                  {item.label}
                </p>
                <p className="text-gray-400 text-[10px] font-body">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard ────────────────────────────────────────────────────────
  return (
    <div className="max-w-[480px] mx-auto bg-app-bg min-h-screen">
      <header className="bg-electric-blue px-4 py-4 border-b-4 border-electric-yellow">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-electric-yellow text-lg font-black font-display">
              ⚡ My Dashboard
            </h1>
            <p className="text-electric-yellow/70 text-[10px] font-body">
              ID: <span className="font-bold">{electricianId}</span> •{" "}
              <span className="animate-pulse">🟢 Live</span>
            </p>
          </div>
          <button
            type="button"
            data-ocid="dashboard.logout.button"
            onClick={() => setElectricianId("")}
            className="text-electric-yellow/80 text-xs font-body underline"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="px-3 pt-3 pb-8 space-y-3">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "नये", count: newCount, color: "text-electric-yellow" },
            { label: "स्वीकृत", count: acceptedCount, color: "text-blue-600" },
            {
              label: "पूर्ण",
              count: completedCount,
              color: "text-electric-green",
            },
            { label: "कुल", count: jobs.length, color: "text-electric-blue" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-2.5 text-center border border-gray-100 shadow-sm"
            >
              <p className={`font-black text-xl font-display ${s.color}`}>
                {s.count}
              </p>
              <p className="text-gray-400 text-[10px] font-body">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-electric-blue to-blue-700 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg"
          data-ocid="dashboard.wallet.card"
        >
          <div>
            <p className="text-white/70 text-[10px] font-body uppercase tracking-wider">
              Wallet Balance
            </p>
            <p className="font-black text-3xl font-display">
              ₹{wallet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-white/60 text-[10px] font-body mt-0.5">
              75% aapka hissa
            </p>
          </div>
          <button
            type="button"
            data-ocid="dashboard.withdraw.button"
            onClick={handleWithdraw}
            disabled={withdrawing || wallet < 200}
            className="bg-electric-yellow text-electric-blue font-black text-xs px-4 py-2.5 rounded-full font-body hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {withdrawing ? "…" : "WITHDRAW ₹200"}
          </button>
        </motion.div>

        {/* Jobs Section */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-electric-blue text-sm font-display">
            🔧 Mera Kaam ({jobs.length})
          </h2>
          <span className="text-[10px] text-gray-400 font-body animate-pulse">
            🔄 Har 3 sec refresh
          </span>
        </div>

        <AnimatePresence>
          {jobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm"
              data-ocid="dashboard.jobs.empty_state"
            >
              <span className="text-5xl block mb-3">📭</span>
              <p className="font-bold text-gray-500 text-sm font-body">
                Abhi koi kaam nahi
              </p>
              <p className="text-gray-400 text-xs font-body mt-1">
                Naya booking aane par yahan dikhega
              </p>
              <p className="text-[10px] text-electric-blue font-body mt-3 animate-pulse">
                🔔 Live update chal raha hai…
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  data-ocid={`dashboard.jobs.item.${i + 1}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Job Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🔧</span>
                      <div>
                        <p className="font-bold text-gray-800 text-sm font-body">
                          {job.service}
                        </p>
                        <p className="text-[10px] text-gray-400 font-body">
                          #{job.id.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`text-xs font-bold px-2.5 py-0.5 ${STATUS_COLORS[job.status]} border-0`}
                    >
                      {STATUS_LABELS[job.status]}
                    </Badge>
                  </div>

                  {/* Job Details */}
                  <div className="px-4 py-3 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-xs mt-0.5">👤</span>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gray-700 font-body">
                          {job.customerName}
                        </p>
                        <p className="text-[10px] text-gray-400 font-body">
                          📱 {job.phone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-xs mt-0.5">📍</span>
                      <p className="text-xs text-gray-600 font-body leading-tight">
                        {job.address}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-electric-blue font-display">
                          ₹{job.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-electric-green font-bold">
                          🛡️ {job.warranty}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-body">
                        Expiry: {job.expiryDate}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {job.status !== "completed" && (
                    <div className="px-4 pb-3 flex gap-2">
                      {job.status === "new" && (
                        <button
                          type="button"
                          data-ocid={`dashboard.jobs.accept.${i + 1}`}
                          onClick={() => handleAccept(job.id)}
                          className="flex-1 bg-electric-blue text-white font-black text-xs py-2.5 rounded-xl font-body hover:brightness-110 transition-all"
                        >
                          ✅ Sweekar Karein
                        </button>
                      )}
                      {job.status === "accepted" && (
                        <button
                          type="button"
                          data-ocid={`dashboard.jobs.complete.${i + 1}`}
                          onClick={() => handleComplete(job.id, job.price)}
                          className="flex-1 bg-electric-green text-white font-black text-xs py-2.5 rounded-xl font-body hover:brightness-110 transition-all"
                        >
                          🎉 Kaam Pura — ₹{(job.price * 0.75).toFixed(0)} Earn
                        </button>
                      )}
                    </div>
                  )}

                  {job.status === "completed" && (
                    <div className="px-4 pb-3">
                      <div className="bg-green-50 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs font-bold text-electric-green font-body">
                          ✅ Kaam Pura — ₹{(job.price * 0.75).toFixed(0)}{" "}
                          credited
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center pt-2">
          <a
            href="tel:7275509792"
            className="text-xs text-electric-blue font-bold font-body"
          >
            📞 Help: 7275509792
          </a>
        </div>
      </div>
    </div>
  );
}
