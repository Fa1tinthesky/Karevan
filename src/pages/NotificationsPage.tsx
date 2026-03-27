import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bell, Check, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useNotifications,
  useMarkAllRead,
  useAcceptInvite,
  useDeclineInvite,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

const NOTIFICATION_ICONS: Record<string, string> = {
  NEW_INVITE: "👋",
  SOMEONE_COMMITTED: "✅",
  SOMEONE_PAID: "💸",
  YOU_ARE_LAST: "👀",
  DEADLINE_APPROACHING: "⏰",
  NO_ACTIVITY_REMINDER: "💤",
  GROUP_COMPLETE: "🎉",
  GROUP_FAILED: "❌",
  GOAL_CONTRIBUTION_DUE: "🎯",
  GOAL_MILESTONE: "🏆",
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markAllRead } = useMarkAllRead();
  const { mutate: acceptInvite } = useAcceptInvite();
  const { mutate: declineInvite } = useDeclineInvite();

  // Track which specific notification is loading and its action
  const [loadingId, setLoadingId] = useState<string | null>(null);
  // Track acted-on notifications to hide buttons immediately
  const [actedOn, setActedOn] = useState<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleAccept = (notificationId: string, groupId: string) => {
    setLoadingId(notificationId);
    acceptInvite(
      { groupId, notificationId },
      {
        onSuccess: () => {
          setActedOn((prev) => new Set(prev).add(notificationId));
          setLoadingId(null);
        },
        onError: () => setLoadingId(null),
      },
    );
  };

  const handleDecline = (notificationId: string, groupId: string) => {
    setLoadingId(notificationId);
    declineInvite(
      { groupId, notificationId },
      {
        onSuccess: () => {
          setActedOn((prev) => new Set(prev).add(notificationId));
          setLoadingId(null);
        },
        onError: () => setLoadingId(null),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <button
            sx={{cursor: "pointer"}}
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <h1 className="text-primary-foreground text-lg font-bold">
            Notifications
          </h1>
          {unreadCount > 0 ? (
            <button
              onClick={() => markAllRead()}
              className="text-primary-foreground/70 text-xs font-medium"
            >
              Mark all read
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-secondary animate-pulse"
            />
          ))
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Bell className="w-12 h-12 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              No notifications yet
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, i) => {
              const isInvite = n.type === "NEW_INVITE";
              const icon = NOTIFICATION_ICONS[n.type] ?? "🔔";
              const isThisLoading = loadingId === n.id;
              const hasActed = actedOn.has(n.id);

              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-card rounded-2xl p-4 shadow-card"
                  style={{
                    borderLeft:
                      !n.read && !hasActed
                        ? "3px solid hsl(var(--primary))"
                        : "3px solid transparent",
                  }}
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                      {icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-foreground text-sm font-semibold">
                          {n.title}
                        </p>
                        <span className="text-muted-foreground text-xs flex-shrink-0">
                          {formatDistanceToNow(new Date(n.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {n.body}
                      </p>

                      {n.group && (
                        <p className="text-primary text-xs mt-1 font-medium">
                          {n.group.type === "BILL" ? "🧾" : "🎯"}{" "}
                          {n.group.title}
                        </p>
                      )}

                      {/* Invite buttons — hide after acted on */}
                      {isInvite && n.groupId && !hasActed && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleAccept(n.id, n.groupId!)}
                            disabled={isThisLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 transition-opacity"
                          >
                            {isThisLoading ? (
                              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Accept
                          </button>
                          <button
                            onClick={() => handleDecline(n.id, n.groupId!)}
                            disabled={isThisLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary text-muted-foreground text-xs font-semibold disabled:opacity-50 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                            Decline
                          </button>
                        </div>
                      )}

                      {/* Show acted state */}
                      {isInvite && hasActed && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Response sent ✓
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
