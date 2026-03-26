import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Send,
  Smartphone,
  Zap,
  Wifi,
  CreditCard,
  Lock,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useCurrentUser } from "@/context/SessionContext";
import { useRecentTransactions } from "@/hooks/useRecentTransactions";
import { formatDistanceToNow } from "date-fns";

const TX_CONFIG: Record<
  string,
  { label: string; icon: any; positive: boolean }
> = {
  TOPUP: { label: "Top Up", icon: CreditCard, positive: true },
  LOCK: { label: "Committed", icon: Lock, positive: false },
  UNLOCK: { label: "Released", icon: Lock, positive: true },
  PAYMENT: { label: "Payment", icon: Send, positive: false },
  CONTRIBUTION: { label: "Contribution", icon: Zap, positive: false },
  REWARD: { label: "Reward", icon: Smartphone, positive: true },
};

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: transactions = [], isLoading } = useRecentTransactions();
  const [showBalance, setShowBalance] = useState(true);

  const balance = user?.wallet ? Number(user.wallet.balance) : 0;
  const locked = user?.wallet ? Number(user.wallet.lockedBalance) : 0;
  const total = balance + locked;

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-[2rem]">
        <h1 className="text-primary-foreground text-xl font-bold mb-5">
          Wallet
        </h1>

        {/* Main balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-foreground/10 rounded-2xl p-5 border border-primary-foreground/10"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-primary-foreground/60 text-sm">
              Available Balance
            </span>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? (
                <Eye className="w-4 h-4 text-primary-foreground/60" />
              ) : (
                <EyeOff className="w-4 h-4 text-primary-foreground/60" />
              )}
            </button>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-primary-foreground text-3xl font-bold">
              {showBalance
                ? balance.toLocaleString("en-US", { minimumFractionDigits: 2 })
                : "••••••"}
            </span>
            <span className="text-primary-foreground/60 text-sm">
              {user?.wallet?.currency ?? "TJS"}
            </span>
          </div>

          {/* Balance breakdown */}
          <div className="flex gap-3 pt-3 border-t border-primary-foreground/10">
            <div className="flex-1">
              <p className="text-primary-foreground/50 text-xs mb-0.5">Total</p>
              <p className="text-primary-foreground/80 text-sm font-semibold">
                {showBalance
                  ? total.toLocaleString("en-US", { minimumFractionDigits: 2 })
                  : "••••"}{" "}
                TJS
              </p>
            </div>
            {locked > 0 && (
              <div className="flex-1">
                <p className="text-primary-foreground/50 text-xs mb-0.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Committed
                </p>
                <p className="text-primary-foreground/80 text-sm font-semibold">
                  {showBalance
                    ? locked.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })
                    : "••••"}{" "}
                  TJS
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick actions */}
      <div className="px-5 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: Send, label: "Transfer", route: "/groups" },
              { icon: Smartphone, label: "Top Up", route: null },
              { icon: Zap, label: "Pay Bills", route: null },
              { icon: Wifi, label: "Internet", route: null },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => a.route && navigate(a.route)}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Transaction history */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground font-semibold text-base">
            Transactions
          </h2>
          <span className="text-muted-foreground text-xs">
            Last {transactions.length}
          </span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-secondary animate-pulse"
              />
            ))
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">
                No transactions yet
              </p>
              <button
                onClick={() => navigate("/groups")}
                className="text-primary text-sm font-medium mt-2"
              >
                Create a group to get started →
              </button>
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
                  transition={{ delay: i * 0.04 }}
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

export default WalletPage;
