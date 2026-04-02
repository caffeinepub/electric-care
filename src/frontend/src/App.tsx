import { ElectricianDashboard } from "@/components/ElectricianDashboard";
import { HomePage } from "@/components/HomePage";
import { JoinPage } from "@/components/JoinPage";
import { ReferPage } from "@/components/ReferPage";
import { WalletPage } from "@/components/WalletPage";
import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";

type Tab = "home" | "dashboard" | "wallet" | "refer" | "join";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "dashboard", icon: "⚡", label: "Dashboard" },
  { id: "wallet", icon: "💰", label: "Wallet" },
  { id: "refer", icon: "🎁", label: "Refer" },
  { id: "join", icon: "👷", label: "Join Us" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");

  return (
    <div className="min-h-screen flex flex-col bg-app-bg">
      <div className="flex-1 pb-20">
        {activeTab === "home" && <HomePage />}
        {activeTab === "dashboard" && <ElectricianDashboard />}
        {activeTab === "wallet" && <WalletPage />}
        {activeTab === "refer" && <ReferPage />}
        {activeTab === "join" && <JoinPage />}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="max-w-[480px] mx-auto flex">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`nav.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all font-body text-[10px] font-semibold relative ${
                activeTab === tab.id ? "text-electric-blue" : "text-gray-400"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-electric-blue rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>

      <Toaster position="top-center" richColors />
    </div>
  );
}
