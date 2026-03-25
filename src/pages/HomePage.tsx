import { motion } from "framer-motion";
import {
  Eye, EyeOff, Send, Smartphone, Zap, Wifi,
  CreditCard, ChevronRight, Bell, Lock,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useCurrentUser } from "@/context/SessionContext";
import { useRecentTransactions } from "@/hooks/useRecentTransactions";
import { useUnreadCount } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

const quickActions = [
  { icon: Send, label: "Transfer", route: "/wallet" },
  { icon: Smartphone, label: "Top Up", route: null },
  { icon: Zap, label: "Pay Bills", route: "/wallet" },
  { icon: Wifi, label: "Internet", route: null },
];

// Map transaction type to display config
const TX_CONFIG: Record<string, { label: string; icon: any; positive: boolean }> = {
  TOPUP:        { label: "Top Up",       icon: CreditCard, positive: true },
  LOCK:         { label: "Committed",    icon: Lock,       positive: false },
  UNLOCK:       { label: "Released",     icon: Lock,       positive: true },
  PAYMENT:      { label: "Payment",      icon: Send,       positive: false },
  CONTRIBUTION: { label: "Contribution", icon: Zap,        positive: false },
  REWARD:       { label: "Reward",       icon: Smartphone, positive: true },
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const HomePage = () => {
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: transactions = [], isLoading: txLoading } = useRecentTransactions();
  const unreadCount = useUnreadCount();

  const initials = (user?.name ?? user?.username ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const balance = user?.wallet ? Number(user.wallet.balance) : 0;
  const locked = user?.wallet ? Number(user.wallet.lockedBalance) : 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm">{getGreeting()},</p>
            <h1 className="text-primary-foreground text-xl font-bold">
              {user?.name ?? user?.username ?? "—"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button
              onClick={() => navigate("/notifications")}
              className="relative w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center"
            >
              <Bell className="w-5 h-5 text-primary-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </span>
              )}
            </button>

            {/* Avatar */}
            <button onClick={() => navigate("/profile")}>
              <Avatar className="w-10 h-10 border-2 border-primary-foreground/20">
                <AvatarImage src={user?.avatarUrl ?? ""} />
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
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
              {showBalance
                ? <Eye className="w-4 h-4 text-primary-foreground/60" />
                : <EyeOff className="w-4 h-4 text-primary-foreground/60" />
              }
            </button>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-primary-foreground text-3xl font-bold">
              {showBalance
                ? balance.toLocaleString("en-US", { minimumFractionDigits: 2 })
                : "••••••"}
            </span>
            <span className="text-primary-foreground/60 text-sm">
              {user?.wallet?.currency ?? "TJS"}
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-primary-foreground/50 text-xs">
              {user?.phone ?? user?.email ?? ""}
            </span>
            {locked > 0 && (
              <span className="text-primary-foreground/50 text-xs flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {locked.toLocaleString()} TJS committed
              </span>
            )}
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
                onClick={() => action.route && navigate(action.route)}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <action.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {action.label}
                </span>
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
            <span className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider">
              New Feature
            </span>
            <h3 className="text-primary-foreground font-bold text-lg mt-1">
              Save Together!
            </h3>
            <p className="text-primary-foreground/70 text-sm mt-1">
              Create group goals and split bills with friends
            </p>
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
          <button
            onClick={() => navigate("/transactions")}
            className="text-primary text-sm font-medium flex items-center gap-1"
          >
            See All <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {txLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-secondary animate-pulse" />
            ))
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx, i) => {
              const config = TX_CONFIG[tx.type] ?? {
                label: tx.type,
                icon: CreditCard,
                positive: false,
              };
              const Icon = config.icon;

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 bg-card rounded-xl p-3 shadow-card"
                >
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-medium">
                      {tx.description ?? config.label}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(tx.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color: config.positive
                        ? "hsl(142 76% 36%)"
                        : "hsl(var(--foreground))",
                    }}
                  >
                    {config.positive ? "+" : "-"}
                    {tx.amount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    TJS
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomePage;