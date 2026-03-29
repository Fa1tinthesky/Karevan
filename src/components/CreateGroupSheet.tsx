import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import {
  useCreateGroup,
  type CreateGroupPayload,
} from "@/hooks/useCreateGroup";
import { UserSearchInput } from "@/components/UserSearchInput";
import { type SearchedUser } from "../hooks/useSearchUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/context/SessionContext";

type Props = {
  open: boolean;
  onClose: () => void;
};

const CATEGORIES = [
  { value: "RENT", label: "Rent", icon: "🏠" },
  { value: "ELECTRICITY", label: "Electricity", icon: "⚡" },
  { value: "WATER", label: "Water", icon: "💧" },
  { value: "INTERNET", label: "Internet", icon: "📡" },
  { value: "TRIP", label: "Trip", icon: "✈️" },
  { value: "GIFT", label: "Gift", icon: "🎁" },
  { value: "OTHER", label: "Other", icon: "📦" },
];

const FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
];

const VISIBILITIES = [
  { value: "PRIVATE", label: "Private", desc: "Only you contribute" },
  {
    value: "COLLABORATIVE",
    label: "Collaborative",
    desc: "Invited people contribute",
  },
  {
    value: "PUBLIC",
    label: "Public",
    desc: "Anyone can see, only you contribute",
  },
];

type FormState = {
  type: "BILL" | "GOAL";
  title: string;
  description: string;
  targetAmount: string;
  category: string;
  splitType: "EQUAL" | "CUSTOM";
  destination: string;
  deadline: string;
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  contributionAmount: string;
  visibility: "PRIVATE" | "COLLABORATIVE" | "PUBLIC";
  members: SearchedUser[];
  memberShares: Record<string, string>;
};

const initial: FormState = {
  type: "BILL",
  title: "",
  description: "",
  targetAmount: "",
  category: "OTHER",
  splitType: "EQUAL",
  destination: "",
  deadline: "",
  frequency: "MONTHLY",
  contributionAmount: "",
  visibility: "PRIVATE",
  members: [],
  memberShares: {},
};

export const CreateGroupSheet = ({ open, onClose }: Props) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const { mutate: createGroup, isPending } = useCreateGroup();
  const { user } = useCurrentUser();

  const set = (key: keyof FormState, value: any) =>
    setForm((p) => ({ ...p, [key]: value }));

  const totalSteps = 3;

  const canProceed = () => {
    if (step === 0) return form.type !== null;
    if (step === 1) {
      if (!form.title.trim()) return false;
      if (!form.targetAmount || isNaN(Number(form.targetAmount))) return false;
      return true;
    }
    if (step === 2 && form.type === "BILL" && form.splitType === "CUSTOM") {
      const target = Number(form.targetAmount);
      const adminShare = Number(form.memberShares["__admin__"] ?? 0);
      const membersTotal = form.members.reduce(
        (sum, m) => sum + Number(form.memberShares[m.id] ?? 0),
        0,
      );
      const total = adminShare + membersTotal;
      // must equal target exactly, and admin must have set their share
      if (Math.abs(total - target) > 0.01) return false;
      if (!adminShare || adminShare <= 0) return false;
    }
    return true;
  };

  const handleSubmit = () => {
    const remappedShares =
      form.splitType === "CUSTOM"
        ? Object.fromEntries(
            Object.entries(form.memberShares).map(([k, v]) => [
              k === "__admin__" ? user!.id : k,
              Number(v),
            ]),
          )
        : undefined;

    const payload: CreateGroupPayload = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      targetAmount: Number(form.targetAmount),
      memberIds: form.members.map((m) => m.id),
      ...(form.type === "BILL"
        ? {
            category: form.category,
            splitType: form.splitType,
            destination: form.destination || undefined,
            deadline: form.deadline || null,
            // pass memberShares for CUSTOM (includes admin share keyed by session userId)
            memberShares: remappedShares,
          }
        : {
            frequency: form.frequency,
            contributionAmount: Number(form.contributionAmount) || undefined,
            visibility: form.visibility,
          }),
    };

    createGroup(payload, {
      onSuccess: () => {
        setForm(initial);
        setStep(0);
        onClose();
      },
      onError: (err: any) => {
        // surface the error — add an error state to form or use a toast
        alert(err.message); // replace with your toast system
      },
    });
  };

  const handleClose = () => {
    setForm(initial);
    setStep(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl max-h-[92vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <button
                onClick={() =>
                  step > 0 ? setStep((s) => s - 1) : handleClose()
                }
                className="w-8 h-8 flex items-center justify-center"
              >
                {step > 0 ? (
                  <ChevronLeft className="w-5 h-5 text-foreground" />
                ) : (
                  <X className="w-5 h-5 text-foreground" />
                )}
              </button>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {step === 0 && "Choose Type"}
                  {step === 1 && "Group Details"}
                  {step === 2 && "Add Members"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Step {step + 1} of {totalSteps}
                </p>
              </div>
              <div className="w-8" />
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-border">
              <motion.div
                className="h-full bg-primary"
                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {/* STEP 0 — Type selection */}
              {step === 0 && (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    What are you creating?
                  </p>
                  {(["BILL", "GOAL"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => set("type", t)}
                      className="w-full p-4 rounded-2xl border-2 text-left transition-all"
                      style={{
                        borderColor:
                          form.type === t
                            ? "hsl(var(--primary))"
                            : "hsl(var(--border))",
                        background:
                          form.type === t
                            ? "hsl(var(--primary) / 0.08)"
                            : "hsl(var(--card))",
                      }}
                    >
                      <p className="font-semibold text-foreground text-base">
                        {t === "BILL" ? "🧾 Group Bill" : "🎯 Savings Goal"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t === "BILL"
                          ? "Split a shared expense — rent, utilities, a dinner. Everyone pays their share."
                          : "Save toward a target together — a trip, a gift, anything. Contribute on a schedule."}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* STEP 1 — Details */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Title *
                    </label>
                    <input
                      value={form.title}
                      onChange={(e) => set("title", e.target.value)}
                      placeholder={
                        form.type === "BILL"
                          ? "e.g. March Rent"
                          : "e.g. Trip to Istanbul"
                      }
                      className="w-full px-4 py-3 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      Description (optional)
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => set("description", e.target.value)}
                      placeholder="Add a note..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  {/* Target amount */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                      {form.type === "BILL"
                        ? "Total Bill Amount (TJS) *"
                        : "Savings Target (TJS) *"}
                    </label>
                    <input
                      type="number"
                      value={form.targetAmount}
                      onChange={(e) => set("targetAmount", e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
                    />
                  </div>

                  {/* BILL specific fields */}
                  {form.type === "BILL" && (
                    <>
                      {/* Category */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Category
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {CATEGORIES.map((c) => (
                            <button
                              key={c.value}
                              onClick={() => set("category", c.value)}
                              className="flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all"
                              style={{
                                borderColor:
                                  form.category === c.value
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--border))",
                                background:
                                  form.category === c.value
                                    ? "hsl(var(--primary) / 0.08)"
                                    : "transparent",
                              }}
                            >
                              <span className="text-lg">{c.icon}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {c.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Split type */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          How to split
                        </label>
                        <div className="flex gap-2">
                          {(["EQUAL", "CUSTOM"] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => set("splitType", s)}
                              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                              style={{
                                borderColor:
                                  form.splitType === s
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--border))",
                                color:
                                  form.splitType === s
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--muted-foreground))",
                                background:
                                  form.splitType === s
                                    ? "hsl(var(--primary) / 0.08)"
                                    : "transparent",
                              }}
                            >
                              {s === "EQUAL" ? "Equal split" : "Custom split"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Destination */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Pay to (optional)
                        </label>
                        <input
                          value={form.destination}
                          onChange={(e) => set("destination", e.target.value)}
                          placeholder="Landlord phone or bill reference"
                          className="w-full px-4 py-3 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
                        />
                      </div>

                      {/* Deadline */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Deadline (optional)
                        </label>
                        <input
                          type="date"
                          value={form.deadline}
                          onChange={(e) => set("deadline", e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-secondary text-sm text-foreground outline-none border border-border focus:border-primary transition-colors"
                        />
                      </div>
                    </>
                  )}

                  {/* GOAL specific fields */}
                  {form.type === "GOAL" && (
                    <>
                      {/* Contribution amount */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Contribution amount per cycle (TJS)
                        </label>
                        <input
                          type="number"
                          value={form.contributionAmount}
                          onChange={(e) =>
                            set("contributionAmount", e.target.value)
                          }
                          placeholder="e.g. 200"
                          className="w-full px-4 py-3 rounded-xl bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none border border-border focus:border-primary transition-colors"
                        />
                      </div>

                      {/* Frequency */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Contribution frequency
                        </label>
                        <div className="flex gap-2">
                          {FREQUENCIES.map((f) => (
                            <button
                              key={f.value}
                              onClick={() => set("frequency", f.value)}
                              className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all"
                              style={{
                                borderColor:
                                  form.frequency === f.value
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--border))",
                                color:
                                  form.frequency === f.value
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--muted-foreground))",
                                background:
                                  form.frequency === f.value
                                    ? "hsl(var(--primary) / 0.08)"
                                    : "transparent",
                              }}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Visibility */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Visibility
                        </label>
                        <div className="space-y-2">
                          {VISIBILITIES.map((v) => (
                            <button
                              key={v.value}
                              onClick={() => set("visibility", v.value)}
                              className="w-full p-3 rounded-xl border text-left transition-all"
                              style={{
                                borderColor:
                                  form.visibility === v.value
                                    ? "hsl(var(--primary))"
                                    : "hsl(var(--border))",
                                background:
                                  form.visibility === v.value
                                    ? "hsl(var(--primary) / 0.08)"
                                    : "transparent",
                              }}
                            >
                              <p className="text-sm font-medium text-foreground">
                                {v.label}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {v.desc}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {form.type === "BILL"
                      ? "Add people to split this bill with."
                      : form.visibility === "COLLABORATIVE"
                        ? "Add people to save with you."
                        : "This goal is private — no members needed."}
                  </p>

                  {(form.type === "BILL" ||
                    form.visibility === "COLLABORATIVE") && (
                    <>
                      <UserSearchInput
                        selectedUsers={form.members}
                        onAdd={(u) => {
                          set("members", [...form.members, u]);
                          // init their share as empty string
                          set("memberShares", {
                            ...form.memberShares,
                            [u.id]: "",
                          });
                        }}
                        onRemove={(id) => {
                          set(
                            "members",
                            form.members.filter((m) => m.id !== id),
                          );
                          const next = { ...form.memberShares };
                          delete next[id];
                          set("memberShares", next);
                        }}
                      />

                      {/* Custom split inputs — shown per-member when CUSTOM */}
                      {form.type === "BILL" &&
                        form.splitType === "CUSTOM" &&
                        form.members.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Set each person's share
                            </p>

                            {/* Admin's own share */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-primary">
                                  You
                                </span>
                              </div>
                              <p className="text-sm font-medium text-foreground flex-1">
                                You (admin)
                              </p>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={form.memberShares["__admin__"] ?? ""}
                                  onChange={(e) =>
                                    set("memberShares", {
                                      ...form.memberShares,
                                      ["__admin__"]: e.target.value,
                                    })
                                  }
                                  className="w-24 px-3 py-2 rounded-lg bg-card text-sm text-foreground outline-none border border-border focus:border-primary text-right"
                                />
                                <span className="text-xs text-muted-foreground">
                                  TJS
                                </span>
                              </div>
                            </div>

                            {/* Each invited member */}
                            {form.members.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-3 rounded-xl bg-secondary"
                              >
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarImage src={member.avatarUrl ?? ""} />
                                  <AvatarFallback className="text-xs bg-primary/20 text-primary">
                                    {(member.name ?? member.username)
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">
                                  {member.name ?? member.username}
                                </p>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={form.memberShares[member.id] ?? ""}
                                    onChange={(e) =>
                                      set("memberShares", {
                                        ...form.memberShares,
                                        [member.id]: e.target.value,
                                      })
                                    }
                                    className="w-24 px-3 py-2 rounded-lg bg-card text-sm text-foreground outline-none border border-border focus:border-primary text-right"
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    TJS
                                  </span>
                                </div>
                              </div>
                            ))}

                            {/* Running total vs target */}
                            {(() => {
                              const adminShare = Number(
                                form.memberShares["__admin__"] ?? 0,
                              );
                              const membersTotal = form.members.reduce(
                                (sum, m) =>
                                  sum + Number(form.memberShares[m.id] ?? 0),
                                0,
                              );
                              const total = adminShare + membersTotal;
                              const target = Number(form.targetAmount);
                              const diff = target - total;
                              const isOver = total > target;
                              const isExact = total === target;

                              return (
                                <div
                                  className="flex justify-between items-center p-3 rounded-xl border"
                                  style={{
                                    borderColor: isOver
                                      ? "hsl(var(--destructive))"
                                      : isExact
                                        ? "hsl(var(--primary))"
                                        : "hsl(var(--border))",
                                    background: isOver
                                      ? "hsl(var(--destructive) / 0.08)"
                                      : isExact
                                        ? "hsl(var(--primary) / 0.08)"
                                        : "transparent",
                                  }}
                                >
                                  <span className="text-xs text-muted-foreground">
                                    Total assigned
                                  </span>
                                  <span
                                    className="text-sm font-semibold"
                                    style={{
                                      color: isOver
                                        ? "hsl(var(--destructive))"
                                        : isExact
                                          ? "hsl(var(--primary))"
                                          : "hsl(var(--foreground))",
                                    }}
                                  >
                                    {total.toLocaleString()} /{" "}
                                    {target.toLocaleString()} TJS
                                    {isOver && " ⚠️ over"}
                                    {isExact && " ✓"}
                                    {!isOver &&
                                      !isExact &&
                                      diff > 0 &&
                                      ` (${diff.toLocaleString()} remaining)`}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                    </>
                  )}

                  {/* Summary */}
                  <div className="rounded-2xl bg-secondary p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Summary
                    </p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground font-medium">
                        {form.type === "BILL" ? "Group Bill" : "Savings Goal"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Title</span>
                      <span className="text-foreground font-medium">
                        {form.title}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="text-foreground font-medium">
                        {Number(form.targetAmount).toLocaleString()} TJS
                      </span>
                    </div>
                    {form.type === "BILL" &&
                      form.splitType === "EQUAL" &&
                      form.members.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Per person
                          </span>
                          <span className="text-primary font-semibold">
                            {(
                              Number(form.targetAmount) /
                              (form.members.length + 1)
                            ).toLocaleString()}{" "}
                            TJS
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span className="text-foreground font-medium">
                        {form.members.length + 1} (including you)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-5 py-4 border-t border-border">
              <button
                onClick={() => {
                  if (!canProceed()) return;
                  if (step < totalSteps - 1) {
                    setStep((s) => s + 1);
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={!canProceed() || isPending}
                className="w-full py-4 rounded-2xl font-semibold text-sm text-white gradient-primary flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
              >
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : step < totalSteps - 1 ? (
                  <>
                    Continue <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  `Create ${form.type === "BILL" ? "Bill" : "Goal"}`
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
