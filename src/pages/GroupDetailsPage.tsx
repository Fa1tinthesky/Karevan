import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  Wallet,
  Calendar,
  Target,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGroup } from "@/hooks/useGroup";
import {
  useCommitToGroup,
  useContributeToGoal,
  useCancelGroup,
} from "@/hooks/useGroupActions";
import { useCurrentUser } from "@/context/SessionContext";
import { formatDistanceToNow, format } from "date-fns";
import ChatEmbedded from "@/components/ChatEmbedded";
// import GroupChat from "@/components/GroupChat";

// ── Status helpers ─────────────────────────────────────────────
const MEMBER_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: string;
    icon: any;
  }
> = {
  INVITED: { label: "Invited", color: "text-yellow-500", icon: Clock },
  COMMITTED: { label: "Committed", color: "text-blue-500", icon: Lock },
  PAID: { label: "Paid", color: "text-green-500", icon: CheckCircle2 },
  DECLINED: { label: "Declined", color: "text-red-400", icon: XCircle },
};

const GROUP_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
  }
> = {
  ACTIVE: { label: "Active", bg: "bg-primary/15", text: "text-primary" },
  COMPLETED: {
    label: "Complete",
    bg: "bg-green-500/15",
    text: "text-green-500",
  },
  FAILED: { label: "Failed", bg: "bg-red-400/15", text: "text-red-400" },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-muted",
    text: "text-muted-foreground",
  },
};

// ── Contribute modal ───────────────────────────────────────────
const ContributeModal = ({
  open,
  onClose,
  onConfirm,
  isPending,
  suggestedAmount,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  isPending: boolean;
  suggestedAmount: number;
}) => {
  const [amount, setAmount] = useState(String(suggestedAmount));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6"
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
            <h3 className="text-foreground font-bold text-lg mb-4">
              Contribute to Goal
            </h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Amount (TJS)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-lg font-bold outline-none border border-border focus:border-primary transition-colors"
              />
            </div>
            <button
              onClick={() => onConfirm(Number(amount))}
              disabled={isPending || !amount || Number(amount) <= 0}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold disabled:opacity-50 flex items-center justify-center"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                `Contribute ${Number(amount).toLocaleString()} TJS`
              )}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Main page ──────────────────────────────────────────────────
const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: group, isLoading, error } = useGroup(id!);
  const { mutate: commitToGroup, isPending: isCommitting } = useCommitToGroup(
    id!,
  );
  const { mutate: contributeToGoal, isPending: isContributing } =
    useContributeToGoal(id!);
  const { mutate: cancelGroup, isPending: isCancelling } = useCancelGroup(id!);

  const [showContribute, setShowContribute] = useState(false);
  const [showMembers, setShowMembers] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-10 h-10 text-muted-foreground" />
        <p className="text-muted-foreground">Group not found</p>
        <button onClick={() => navigate(-1)} className="text-primary text-sm">
          Go back
        </button>
      </div>
    );
  }

  const currentMember = group.members.find((m) => m.userId === user?.id);
  const isAdmin = currentMember?.isAdmin ?? false;
  const isBill = group.type === "BILL";
  const isActive = group.status === "ACTIVE";
  const progress =
    group.targetAmount > 0
      ? Math.min((group.currentAmount / group.targetAmount) * 100, 100)
      : 0;

  const statusConfig = GROUP_STATUS_CONFIG[group.status] ?? GROUP_STATUS_CONFIG.ACTIVE;

  // What action button to show for current user
  const showCommitButton =
    isBill && isActive && currentMember?.status === "INVITED";

  const showContributeButton =
    !isBill && isActive && currentMember && currentMember.status !== "DECLINED";

  const categoryIcon: Record<string, string> = {
    RENT: "🏠",
    ELECTRICITY: "⚡",
    WATER: "💧",
    INTERNET: "📡",
    TRIP: "✈️",
    GIFT: "🎁",
    OTHER: "🧾",
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusConfig!.bg} ${statusConfig!.text}`}
          >
            {statusConfig!.label}
          </span>
          {isAdmin && isActive && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-primary-foreground/60 text-xs"
            >
              Cancel
            </button>
          )}
          {!isAdmin && <div className="w-9" />}
        </div>

        {/* Title and icon */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center text-3xl">
            {isBill ? (categoryIcon[group.category ?? "OTHER"] ?? "🧾") : "🎯"}
          </div>
          <div>
            <h1 className="text-primary-foreground text-xl font-bold">
              {group.title}
            </h1>
            {group.description && (
              <p className="text-primary-foreground/60 text-sm mt-0.5">
                {group.description}
              </p>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-primary-foreground/10 rounded-2xl p-4 border border-primary-foreground/10">
          <div className="flex justify-between items-end mb-3">
            <div>
              <p className="text-primary-foreground/60 text-xs mb-1">
                {isBill ? "Committed" : "Saved"}
              </p>
              <p className="text-primary-foreground text-2xl font-bold">
                {group.currentAmount.toLocaleString()} TJS
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-foreground/60 text-xs mb-1">Target</p>
              <p className="text-primary-foreground font-semibold">
                {group.targetAmount.toLocaleString()} TJS
              </p>
            </div>
          </div>
          <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-primary-foreground rounded-full"
            />
          </div>
          <p className="text-primary-foreground/50 text-xs mt-2 text-right">
            {progress.toFixed(0)}% complete
          </p>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {/* Meta info */}
        <div className="flex gap-3">
          {group.deadline && (
            <div className="flex-1 bg-card rounded-xl p-3 flex items-center gap-2 shadow-card">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="text-xs font-semibold text-foreground">
                  {format(new Date(group.deadline), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          )}
          {group.frequency && (
            <div className="flex-1 bg-card rounded-xl p-3 flex items-center gap-2 shadow-card">
              <Target className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Frequency</p>
                <p className="text-xs font-semibold text-foreground capitalize">
                  {group.frequency.toLowerCase()}
                </p>
              </div>
            </div>
          )}
          <div className="flex-1 bg-card rounded-xl p-3 flex items-center gap-2 shadow-card">
            <Users className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Members</p>
              <p className="text-xs font-semibold text-foreground">
                {group.members.length} people
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        {showCommitButton && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => commitToGroup()}
              disabled={isCommitting}
              className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isCommitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Commit{" "}
                  {currentMember?.shareAmount
                    ? `${currentMember.shareAmount.toLocaleString()} TJS`
                    : "my share"}
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Your share will be soft-locked in your wallet
            </p>
          </motion.div>
        )}

        {showContributeButton && (
          <button
            onClick={() => setShowContribute(true)}
            className="w-full py-4 rounded-2xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Wallet className="w-4 h-4" />
            Contribute to Goal
          </button>
        )}

        {/* Members section */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full flex items-center justify-between p-4"
          >
            <p className="text-foreground font-semibold text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Members ({group.members.length})
            </p>
            {showMembers ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {showMembers && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border divide-y divide-border">
                  {group.members.map((member) => {
                    const statusConf = MEMBER_STATUS_CONFIG[member.status];
                    const StatusIcon = statusConf?.icon ?? Clock;
                    const initials = (member.user.name ?? member.user.username)
                      .slice(0, 2)
                      .toUpperCase();
                    const isMe = member.userId === user?.id;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <Avatar className="w-9 h-9">
                          <AvatarImage src={member.user.avatarUrl ?? ""} />
                          <AvatarFallback className="text-xs bg-primary/20 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground flex items-center gap-1">
                            {member.user.name ?? member.user.username}
                            {isMe && (
                              <span className="text-[10px] text-muted-foreground">
                                (you)
                              </span>
                            )}
                            {member.isAdmin && (
                              <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                admin
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isBill
                              ? member.shareAmount
                                ? `${member.shareAmount.toLocaleString()} TJS`
                                : "Share not set"
                              : `Contributed: ${member.totalContributed.toLocaleString()} TJS`}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${statusConf?.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">
                            {statusConf?.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contribution history */}
        {group.contributions.length > 0 && (
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-4"
            >
              <p className="text-foreground font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Activity ({group.contributions.length})
              </p>
              {showHistory ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border divide-y divide-border">
                    {group.contributions.map((c) => {
                      const initials = (c.user.name ?? c.user.username)
                        .slice(0, 2)
                        .toUpperCase();
                      return (
                        <div
                          key={c.id}
                          className="flex items-center gap-3 px-4 py-3"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={c.user.avatarUrl ?? ""} />
                            <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {c.user.name ?? c.user.username}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(c.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-green-500">
                            +{c.amount.toLocaleString()} TJS
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Chat toggle */}
        <button
          onClick={() => setShowChat(!showChat)}
          className="w-full py-3.5 rounded-2xl border border-border bg-card text-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-card"
        >
          💬 {showChat ? "Hide Chat" : "Open Group Chat"}
        </button>
        { showChat ? < ChatEmbedded/ > : <div></div>}

        {/* {showChat && <GroupChat groupId={id!} />} */}
      </div>

      {/* Contribute modal */}
      <ContributeModal
        open={showContribute}
        onClose={() => setShowContribute(false)}
        onConfirm={(amount) => {
          contributeToGoal(amount, {
            onSuccess: () => setShowContribute(false),
          });
        }}
        isPending={isContributing}
        suggestedAmount={group.contributionAmount ?? 0}
      />

      {/* Cancel confirm */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCancelConfirm(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6"
            >
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
              <h3 className="text-foreground font-bold text-lg mb-2">
                Cancel Group?
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                All committed funds will be returned to members. This cannot be
                undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-border text-foreground font-semibold text-sm"
                >
                  Keep Group
                </button>
                <button
                  onClick={() =>
                    cancelGroup(undefined, {
                      onSuccess: () => {
                        setShowCancelConfirm(false);
                        navigate(-1);
                      },
                    })
                  }
                  disabled={isCancelling}
                  className="flex-1 py-3.5 rounded-2xl bg-destructive text-white font-semibold text-sm flex items-center justify-center disabled:opacity-50"
                >
                  {isCancelling ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Cancel Group"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDetailPage;
