import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  Send,
  Zap,
  Smartphone,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/context/SessionContext";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/supabase";
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
} from "date-fns";

// ── Types ──────────────────────────────────────────────────────
type Transaction = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
  groupId: string | null;
};

// ── Config ─────────────────────────────────────────────────────
const TX_CONFIG: Record<
  string,
  { label: string; icon: any; positive: boolean; color: string }
> = {
  TOPUP: {
    label: "Top Up",
    icon: CreditCard,
    positive: true,
    color: "text-emerald-500",
  },
  LOCK: {
    label: "Committed",
    icon: Lock,
    positive: false,
    color: "text-blue-500",
  },
  UNLOCK: {
    label: "Released",
    icon: Lock,
    positive: true,
    color: "text-emerald-500",
  },
  PAYMENT: {
    label: "Payment",
    icon: Send,
    positive: false,
    color: "text-foreground",
  },
  CONTRIBUTION: {
    label: "Contribution",
    icon: Zap,
    positive: false,
    color: "text-foreground",
  },
  REWARD: {
    label: "Reward",
    icon: Smartphone,
    positive: true,
    color: "text-emerald-500",
  },
};

const FILTERS = ["All", "In", "Out"] as const;
type Filter = (typeof FILTERS)[number];

// ── Fetch all transactions (no limit) ─────────────────────────
async function fetchAllTransactions(walletId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("WalletTransaction")
    .select("id, type, amount, description, createdAt, groupId")
    .eq("walletId", walletId)
    .order("createdAt", { ascending: false });

  if (error) throw error;
  return (data as any[]).map((t) => ({ ...t, amount: Number(t.amount) }));
}

// ── Group by date label ────────────────────────────────────────
function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d)) return format(d, "EEEE"); // Monday, Tuesday...
  if (isThisMonth(d)) return format(d, "MMMM d");
  return format(d, "MMMM d, yyyy");
}

function groupByDate(
  txs: Transaction[],
): { label: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const label = getDateLabel(tx.createdAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(tx);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

// ── Page ───────────────────────────────────────────────────────
const TransactionsPage = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const walletId = user?.wallet?.id ?? "";

  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", "all", walletId],
    queryFn: () => fetchAllTransactions(walletId),
    enabled: !!walletId,
    staleTime: 1000 * 60,
  });

  // ── Stats ──────────────────────────────────────────────────
  const totalIn = transactions
    .filter((t) => TX_CONFIG[t.type]?.positive)
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions
    .filter((t) => !TX_CONFIG[t.type]?.positive)
    .reduce((s, t) => s + t.amount, 0);

  // ── Filter + search ────────────────────────────────────────
  const filtered = transactions.filter((t) => {
    const config = TX_CONFIG[t.type];
    if (filter === "In" && !config?.positive) return false;
    if (filter === "Out" && config?.positive) return false;
    if (search) {
      const q = search.toLowerCase();
      const label = (config?.label ?? t.type).toLowerCase();
      const desc = (t.description ?? "").toLowerCase();
      if (!label.includes(q) && !desc.includes(q)) return false;
    }
    return true;
  });

  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </motion.button>
          <h1 className="text-primary-foreground text-lg font-bold">
            Transactions
          </h1>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowSearch((s) => !s)}
            className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
          >
            <Search className="w-4 h-4 text-primary-foreground" />
          </motion.button>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <input
                autoFocus
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm outline-none border border-primary-foreground/20 focus:border-primary-foreground/50 transition-colors"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div className="flex gap-3">
          <div className="flex-1 bg-primary-foreground/10 rounded-2xl p-3 border border-primary-foreground/10">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-primary-foreground/60 text-xs">
                Money In
              </span>
            </div>
            <p className="text-primary-foreground font-bold text-base">
              +{totalIn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-primary-foreground/50 text-[10px]">TJS</p>
          </div>
          <div className="flex-1 bg-primary-foreground/10 rounded-2xl p-3 border border-primary-foreground/10">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-400" />
              <span className="text-primary-foreground/60 text-xs">
                Money Out
              </span>
            </div>
            <p className="text-primary-foreground font-bold text-base">
              -{totalOut.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-primary-foreground/50 text-[10px]">TJS</p>
          </div>
          <div className="flex-1 bg-primary-foreground/10 rounded-2xl p-3 border border-primary-foreground/10">
            <div className="flex items-center gap-1.5 mb-1">
              <Filter className="w-3.5 h-3.5 text-primary-foreground/60" />
              <span className="text-primary-foreground/60 text-xs">Total</span>
            </div>
            <p className="text-primary-foreground font-bold text-base">
              {transactions.length}
            </p>
            <p className="text-primary-foreground/50 text-[10px]">entries</p>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background:
                  filter === f ? "hsl(var(--primary))" : "hsl(var(--card))",
                color:
                  filter === f
                    ? "hsl(var(--primary-foreground))"
                    : "hsl(var(--muted-foreground))",
                boxShadow:
                  filter === f
                    ? "0 2px 8px hsl(var(--primary) / 0.3)"
                    : undefined,
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-secondary animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm">
              No transactions found
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {grouped.map(({ label, items }) => (
              <div key={label}>
                {/* Date label */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  {label}
                </p>
                <div className="bg-card rounded-2xl shadow-card overflow-hidden divide-y divide-border">
                  {items.map((tx, i) => {
                    const config = TX_CONFIG[tx.type] ?? {
                      label: tx.type,
                      icon: CreditCard,
                      positive: false,
                      color: "text-foreground",
                    };
                    const Icon = config.icon;

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 px-4 py-3.5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-foreground text-sm font-medium">
                            {tx.description ?? config.label}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {format(new Date(tx.createdAt), "h:mm a")}
                          </p>
                        </div>
                        <span
                          className={`text-sm font-bold tabular-nums ${config.color}`}
                        >
                          {config.positive ? "+" : "−"}
                          {tx.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}{" "}
                          <span className="text-xs font-medium opacity-60">
                            TJS
                          </span>
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
