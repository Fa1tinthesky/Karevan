import { motion } from "framer-motion";
import { Eye, EyeOff, Send, Smartphone, Zap, Wifi, CreditCard, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/context/SessionContext";
import BottomNav from "@/components/BottomNav";
import ChatEmbedded  from "@/components/ChatEmbedded";

const quickActions = [
  { icon: Send, label: "Transfer", color: "bg-primary/10 text-primary" },
  { icon: Smartphone, label: "Top Up", color: "bg-accent/10 text-accent" },
  { icon: Zap, label: "Pay Bills", color: "bg-primary-light/10 text-primary-light" },
  { icon: Wifi, label: "Internet", color: "bg-primary-dark/10 text-primary-dark" },
];

const recentTransactions = [
  { name: "Tcell Top-Up", amount: "-50.00 TJS", date: "Today, 14:30", icon: Smartphone },
  { name: "Money Transfer", amount: "-120.00 TJS", date: "Today, 11:15", icon: Send },
  { name: "Salary", amount: "+3,500.00 TJS", date: "Yesterday", icon: CreditCard, positive: true },
  { name: "Internet Payment", amount: "-89.00 TJS", date: "Mar 17", icon: Wifi },
];

const HomePage = () => {
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  const { user, isLoading } = useCurrentUser();

  if (!user) { navigate("/auth/sign-in")}

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">Good afternoon,</p>
            <h1 className="text-primary-foreground text-xl font-bold">{user ? user.username : "Firdavs"}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-sm">F</span>
          </div>
        </div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5 border border-primary-foreground/10"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-primary-foreground/70 text-sm">Main Balance</span>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <Eye className="w-4 h-4 text-primary-foreground/60" />
              ) : (
                <EyeOff className="w-4 h-4 text-primary-foreground/60" />
              )}
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary-foreground text-3xl font-bold">
              {showBalance ? "4,285.50" : "••••••"}
            </span>
            <span className="text-primary-foreground/60 text-sm">TJS</span>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-primary-foreground/50 text-xs">+992 90 123 4567</span>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => action.label === "Transfer" && navigate("/wallet")}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-foreground">{action.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Promo Banner */}
      <div className="px-5 mt-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="gradient-card rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="relative z-10">
            <span className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">Special Offer</span>
            <h3 className="text-primary-foreground font-bold text-lg mt-1">Save Together!</h3>
            <p className="text-primary-foreground/70 text-sm mt-1">Create group goals and save with friends</p>
            <button
              onClick={() => navigate("/wallet")}
              className="mt-3 bg-primary-foreground/20 text-primary-foreground text-sm font-medium px-4 py-2 rounded-xl"
            >
              Get Started
            </button>
          </div>
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary-foreground/5 rounded-full -mr-10 -mt-10" />
          <div className="absolute right-4 bottom-0 w-20 h-20 bg-primary-foreground/5 rounded-full -mb-8" />
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground font-semibold text-base">Recent Activity</h2>
          <button className="text-primary text-sm font-medium flex items-center gap-1">
            See All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((tx, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <tx.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{tx.name}</p>
                <p className="text-muted-foreground text-xs">{tx.date}</p>
              </div>
              <span className={`text-sm font-semibold ${tx.positive ? "text-green-500" : "text-foreground"}`}>
                {tx.amount}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

     <ChatEmbedded />
      <BottomNav />
    </div>
  );
};

export default HomePage;
