import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function ReferPage() {
  const [copied, setCopied] = useState(false);
  const [wallet, setWallet] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referredCount, setReferredCount] = useState(0);
  const referralCode = "ECARE550";

  useEffect(() => {
    setWallet(Number.parseFloat(localStorage.getItem("ecareWallet") || "0"));
    setReferralEarnings(
      Number.parseFloat(localStorage.getItem("ecareReferralEarnings") || "0"),
    );
    setReferredCount(
      Number.parseInt(localStorage.getItem("ecareReferredCount") || "0"),
    );
  }, []);

  function handleShare() {
    const newCount = referredCount + 1;
    const newEarnings = referralEarnings + 20;
    setReferredCount(newCount);
    setReferralEarnings(newEarnings);
    localStorage.setItem("ecareReferredCount", newCount.toString());
    localStorage.setItem("ecareReferralEarnings", newEarnings.toFixed(2));

    const msg = `*Electric Care App* 🏠⚡%0A%0AAb ghar baithe AC, Fridge aur Motor repair karwayein best rates par!%0A%0AMera referral code use karein: *${referralCode}*%0Aaur payein ₹20 ka turant cashback!%0A%0AApp: ${encodeURIComponent(window.location.href)}`;
    window.open(`https://wa.me/?text=${msg}`, "_blank");
    toast.success("Share kiya! ₹20 cashback credited 🎉");
  }

  function handleCopy() {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      toast.success("Code copy ho gaya! 📋");
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-app-bg">
      <header className="bg-electric-blue px-4 py-5 text-center border-b-4 border-electric-yellow">
        <h1 className="text-electric-yellow text-2xl font-black font-display">
          🎁 Refer &amp; Earn
        </h1>
        <p className="text-electric-yellow/70 text-xs font-body mt-0.5">
          Dost ko invite karein, ₹20 paayein
        </p>
      </header>

      <div className="px-3 pt-4 space-y-3 pb-8">
        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2"
        >
          <div className="bg-white border border-gray-100 rounded-2xl px-3 py-3 text-center shadow-sm">
            <p className="text-gray-400 text-[10px] font-body">Wallet</p>
            <p className="text-electric-green font-black text-lg font-display">
              ₹{wallet.toFixed(0)}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-3 py-3 text-center shadow-sm">
            <p className="text-gray-400 text-[10px] font-body">Referred</p>
            <p className="text-electric-blue font-black text-lg font-display">
              {referredCount}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl px-3 py-3 text-center shadow-sm">
            <p className="text-gray-400 text-[10px] font-body">Cashback</p>
            <p className="text-refer-red font-black text-lg font-display">
              ₹{referralEarnings.toFixed(0)}
            </p>
          </div>
        </motion.div>

        {/* Referral Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="refer-gradient rounded-3xl p-6 text-white text-center shadow-[0_10px_24px_rgba(108,92,231,0.35)]"
        >
          <h2 className="font-black text-xl font-display mb-1">
            🎁 Refer &amp; Earn ₹20
          </h2>
          <p className="text-white/85 text-xs font-body mb-5 leading-relaxed">
            Apne dost ko invite karein aur payein ₹20 cashback unke pehle order
            par!
          </p>

          <button
            type="button"
            data-ocid="refer.code.card"
            onClick={handleCopy}
            className="w-4/5 mx-auto block border-2 border-dashed border-white/70 rounded-2xl py-3 mb-5 cursor-pointer hover:bg-white/10 transition-colors"
          >
            <span className="text-2xl font-black font-display tracking-widest">
              {referralCode}
            </span>
            <p className="text-white/70 text-[10px] mt-0.5 font-body">
              {copied ? "✓ Copy ho gaya!" : "Tap karke copy karein"}
            </p>
          </button>

          <button
            type="button"
            data-ocid="refer.share_button"
            onClick={handleShare}
            className="bg-white text-purple-700 font-black text-sm px-6 py-3 rounded-full mx-auto flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow font-body"
          >
            <span>📲</span>
            <span>WhatsApp Par Share Karein</span>
          </button>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-electric-blue text-sm font-display mb-4">
            🚀 Kaise Kaam Karta Hai?
          </h3>
          <div className="space-y-3">
            {[
              {
                icon: "📲",
                step: "1",
                text: "Apna referral code dost ko share karein",
              },
              {
                icon: "🛠️",
                step: "2",
                text: "Dost apni pehli service book kare",
              },
              {
                icon: "💰",
                step: "3",
                text: "Aapko ₹20 wallet mein mil jayenge",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-electric-blue text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">{item.icon}</span>
                  <p className="text-gray-600 text-xs font-body">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="bg-electric-yellow/20 border border-electric-yellow rounded-2xl p-4 text-center">
          <p className="font-black text-electric-blue text-lg font-display">
            Earn ₹20 per referral!
          </p>
          <p className="text-xs text-gray-600 font-body mt-0.5">
            Koi limit nahi — jitna invite, utna earn
          </p>
        </div>

        <p className="text-center text-gray-300 text-[10px] pb-2">
          Contact:{" "}
          <a href="tel:7275509792" className="text-electric-blue font-semibold">
            7275509792
          </a>
        </p>
      </div>
    </div>
  );
}
