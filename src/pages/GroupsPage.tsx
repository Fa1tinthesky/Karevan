import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Target, ChevronRight, Receipt, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { CreateGroupSheet } from "@/components/CreateGroupSheet";
import { useGroups } from "@/hooks/useGroups";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUnreadCount } from "@/hooks/useNotifications";

const categoryIcon: Record<string, string> = {
  RENT: "🏠",
  ELECTRICITY: "⚡",
  WATER: "💧",
  INTERNET: "📡",
  TRIP: "✈️",
  GIFT: "🎁",
  OTHER: "🧾",
};

const GroupsPage = () => {
  const navigate = useNavigate();
  const { data: groups = [], isLoading } = useGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"BILL" | "GOAL">("BILL");
  const unreadCount = useUnreadCount();

  const filtered = groups.filter((g) => g.type === activeTab);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-primary-foreground text-xl font-bold">Groups</h1>
          <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowCreate(true)}
                className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
              >
                <Plus className="w-5 h-5 text-primary-foreground" />
              </motion.button>

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
            </div>
        </div>
        <p className="text-primary-foreground/60 text-sm">
          {groups.length} active group{groups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-5">
        <div className="flex gap-2 bg-secondary rounded-xl p-1">
          {(["BILL", "GOAL"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background:
                  activeTab === t ? "hsl(var(--card))" : "transparent",
                color:
                  activeTab === t
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))",
                boxShadow:
                  activeTab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {t === "BILL" ? "🧾 Bills" : "🎯 Goals"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-5 mt-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-secondary animate-pulse"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            {activeTab === "BILL" ? (
              <Receipt className="w-10 h-10 text-muted-foreground/40" />
            ) : (
              <Target className="w-10 h-10 text-muted-foreground/40" />
            )}
            <p className="text-muted-foreground text-sm text-center">
              No {activeTab === "BILL" ? "bills" : "goals"} yet.
              <br />
              Tap + to create one.
            </p>
          </div>
        ) : (
          filtered.map((group, i) => {
            const progress =
              group.targetAmount > 0
                ? (group.currentAmount / group.targetAmount) * 100
                : 0;
            const visibleMembers = group.members.slice(0, 3);
            const extraCount = group.members.length - 3;

            return (
              <motion.button
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/group/${group.id}`)}
                className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {group.type === "BILL"
                    ? (categoryIcon[group.category ?? "OTHER"] ?? "🧾")
                    : "🎯"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground text-sm font-semibold truncate">
                      {group.title}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                      style={{
                        background:
                          group.status === "COMPLETED"
                            ? "hsl(var(--primary) / 0.15)"
                            : group.status === "FAILED"
                              ? "hsl(var(--destructive) / 0.15)"
                              : "hsl(var(--secondary))",
                        color:
                          group.status === "COMPLETED"
                            ? "hsl(var(--primary))"
                            : group.status === "FAILED"
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--muted-foreground))",
                      }}
                    >
                      {group.status.toLowerCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex -space-x-1.5">
                      {visibleMembers.map((m) => {
                        const initials = (m.user.name ?? m.user.username)
                          .slice(0, 2)
                          .toUpperCase();
                        return (
                          <Avatar
                            key={m.id}
                            className="w-5 h-5 border-2 border-card"
                          >
                            <AvatarImage src={m.user.avatarUrl ?? ""} />
                            <AvatarFallback className="text-[8px] bg-primary/20 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {extraCount > 0 && (
                        <div className="w-5 h-5 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                          <span className="text-[8px] font-bold text-muted-foreground">
                            +{extraCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs ml-1">
                      {group.members.length} members
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {group.currentAmount.toLocaleString()} TJS
                      </span>
                      <span className="text-foreground font-medium">
                        {group.targetAmount.toLocaleString()} TJS
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        className="h-full gradient-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            );
          })
        )}
      </div>

      <CreateGroupSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <BottomNav />
    </div>
  );
};

export default GroupsPage;
