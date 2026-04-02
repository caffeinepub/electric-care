import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  service: string;
  price: number;
  date: string;
  earn: number;
}

export function WalletPage() {
  const [wallet, setWallet] = useState(0);
  const [adminEarnings, setAdminEarnings] = useState(0);
  const [ratings, setRatings] = useState<number[]>([]);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setWallet(Number.parseFloat(localStorage.getItem("ecareWallet") || "0"));
    setAdminEarnings(
      Number.parseFloat(localStorage.getItem("ecareAdminEarnings") || "0"),
    );
    const stored = localStorage.getItem("ecareRatings");
    if (stored) setRatings(JSON.parse(stored));
    const txns = localStorage.getItem("ecareTxns");
    if (txns) setTransactions(JSON.parse(txns));
  }, []);

  function handleWithdraw() {
    if (wallet < 200) {
      toast.error("Minimum withdrawal ₹200 hai. Balance kam hai!");
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      const newWallet = wallet - 200;
      setWallet(newWallet);
      localStorage.setItem("ecareWallet", newWallet.toFixed(2));

      // Add withdrawal transaction
      const txns = JSON.parse(localStorage.getItem("ecareTxns") || "[]");
      txns.unshift({
        id: Math.floor(100000 + Math.random() * 900000).toString(),
        service: "Withdrawal",
        price: -200,
        date: new Date().toLocaleDateString("en-IN"),
        earn: -200,
      });
      localStorage.setItem("ecareTxns", JSON.stringify(txns.slice(0, 10)));
      setTransactions(txns.slice(0, 5));

      setWithdrawing(false);
      toast.success("₹200 withdraw ho gaya! 🎉");
    }, 1500);
  }

  function handleRating() {
    if (!selectedRating) {
      toast.error("Pehle star rating chunein");
      return;
    }
    const updated = [...ratings, selectedRating];
    setRatings(updated);
    localStorage.setItem("ecareRatings", JSON.stringify(updated));
    setRatingSubmitted(true);
    toast.success("Rating submit ho gayi! Shukriya 🙏");
  }

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : "0.0";

  const displayTxns = transactions.slice(0, 5);

  return (
    <div className="max-w-[480px] mx-auto bg-app-bg min-h-screen">
      <header className="bg-electric-blue px-4 py-5 text-center border-b-4 border-electric-yellow">
        <h1 className="text-electric-yellow text-2xl font-black font-display">
          💰 Wallet
        </h1>
        <p className="text-electric-yellow/70 text-xs font-body mt-0.5">
          Aapki earnings &amp; withdrawals
        </p>
      </header>

      <div className="px-3 pt-4 space-y-3 pb-8">
        {/* Main wallet card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-electric-blue to-blue-700 rounded-3xl p-6 text-white shadow-lg"
        >
          <p className="text-white/70 text-xs font-body uppercase tracking-widest mb-1">
            Electrician Wallet Balance
          </p>
          <p className="font-black text-4xl font-display tracking-tight">
            ₹{wallet.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <span className="text-xs font-semibold text-white/80 font-body">
              💡 75% aapka • 25% Admin
            </span>
          </div>
        </motion.div>

        {/* Split info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-body">Your Share</p>
            <p className="text-2xl font-black text-electric-blue font-display">
              75%
            </p>
            <p className="text-xs text-gray-400 font-body mt-0.5">
              ₹{wallet.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-body">Admin Share</p>
            <p className="text-2xl font-black text-refer-red font-display">
              25%
            </p>
            <p className="text-xs text-gray-400 font-body mt-0.5">
              ₹{adminEarnings.toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Withdraw Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          data-ocid="wallet.withdraw.card"
        >
          <h3 className="font-bold text-gray-800 font-display text-sm mb-1">
            💸 Paisa Nikaalein
          </h3>
          <p className="text-xs text-gray-400 font-body mb-4">
            Minimum withdrawal: ₹200
          </p>
          <button
            type="button"
            data-ocid="wallet.withdraw.button"
            onClick={handleWithdraw}
            disabled={withdrawing}
            className="w-full bg-electric-green text-white font-black py-4 rounded-full font-body text-sm shadow-[0_4px_16px_rgba(40,167,69,0.3)] hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {withdrawing ? "Processing…" : "WITHDRAW ₹200"}
          </button>
          {wallet < 200 && (
            <p className="text-[11px] text-refer-red text-center mt-2 font-body">
              ₹{(200 - wallet).toFixed(2)} aur chahiye withdraw ke liye
            </p>
          )}
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          data-ocid="wallet.transactions.card"
        >
          <h3 className="font-bold text-gray-800 font-display text-sm mb-3">
            📋 Transaction History
          </h3>
          {displayTxns.length === 0 ? (
            <div
              className="text-center py-6"
              data-ocid="wallet.transactions.empty_state"
            >
              <span className="text-3xl block mb-2">🧾</span>
              <p className="text-gray-400 text-xs font-body">
                Abhi koi transaction nahi hai
              </p>
              <p className="text-gray-300 text-[10px] font-body mt-1">
                Koi service book karein!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {displayTxns.map((txn, i) => (
                <div
                  key={txn.id}
                  data-ocid={`wallet.transactions.item.${i + 1}`}
                  className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 font-body truncate">
                      {txn.service === "Withdrawal" ? "💸" : "✅"} {txn.service}
                    </p>
                    <p className="text-[10px] text-gray-400 font-body">
                      {txn.date} • #{txn.id}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p
                      className={`text-sm font-black font-display ${
                        txn.earn < 0 ? "text-refer-red" : "text-electric-green"
                      }`}
                    >
                      {txn.earn < 0 ? "-" : "+"}₹{Math.abs(txn.earn).toFixed(0)}
                    </p>
                    {txn.price > 0 && (
                      <p className="text-[10px] text-gray-400 font-body">
                        75% of ₹{txn.price}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Rating Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          data-ocid="wallet.rating.card"
        >
          <h3 className="font-bold text-gray-800 font-display text-sm mb-1">
            ⭐ Service Rate Karein
          </h3>
          <p className="text-xs text-gray-400 font-body mb-1">
            Avg Rating:{" "}
            <span className="font-black text-electric-blue">{avgRating}</span>
            {ratings.length > 0 && ` (${ratings.length} ratings)`}
          </p>

          <AnimatePresence mode="wait">
            {!ratingSubmitted ? (
              <motion.div
                key="rating-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-1 justify-center my-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      data-ocid={`wallet.rating.star.${star}`}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      onClick={() => setSelectedRating(star)}
                      className="text-4xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    >
                      <span
                        className={
                          (hoveredStar || selectedRating) >= star
                            ? ""
                            : "grayscale opacity-40"
                        }
                      >
                        ⭐
                      </span>
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <p className="text-center text-xs text-gray-500 font-body mb-3">
                    {
                      ["Bad", "Fair", "Good", "Great", "Excellent!"][
                        selectedRating - 1
                      ]
                    }
                  </p>
                )}
                <button
                  type="button"
                  data-ocid="wallet.rating.submit_button"
                  onClick={handleRating}
                  className="w-full bg-electric-blue text-white font-black py-3 rounded-full font-body text-sm hover:brightness-110 transition-all"
                >
                  Rating Submit Karein
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="rating-done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
                data-ocid="wallet.rating.success_state"
              >
                <span className="text-4xl">🙏</span>
                <p className="font-bold text-electric-green text-sm mt-2 font-body">
                  Shukriya! Rating mil gayi.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-gray-300 text-[10px] pb-2">
          Help:{" "}
          <a href="tel:7275509792" className="text-electric-blue font-semibold">
            7275509792
          </a>
        </p>
      </div>
    </div>
  );
}
