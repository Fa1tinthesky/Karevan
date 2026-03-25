import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import TransferModal from "@/components/TransferModal";
import CreateGoalModal from "@/components/CreateGoalModal";

const groupGoals = [
  {
    id: "1",
    name: "Trip to Istanbul 🇹🇷",
    members: ["F", "A", "S", "M"],
    target: 15000,
    current: 8750,
    avatar: "✈️",
  },
  {
    id: "2",
    name: "New iPhone 📱",
    members: ["F", "D"],
    target: 8000,
    current: 3200,
    avatar: "📱",
  },
  {
    id: "3",
    name: "Wedding Fund 💍",
    members: ["F", "A", "S", "M", "D", "K"],
    target: 50000,
    current: 22000,
    avatar: "💍",
  },
  {
    id: "4",
    name: "Gaming PC 🎮",
    members: ["F", "S"],
    target: 6000,
    current: 5400,
    avatar: "🎮",
  },
];

import { Plus, Users, Target, ChevronRight, Receipt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { CreateGroupSheet } from "@/components/CreateGroupSheet";
import { useGroups } from "@/hooks/useGroups";
import { useCurrentUser } from "@/context/SessionContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function chooseRandomAvatar() {
    const groupAvatars = ["🇹🇷", "📱", "💍", "🎮"];
    const randomAvatar = groupAvatars[Math.floor(Math.random() * groupAvatars.length)];

    return randomAvatar;
}

const Wallet = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { data: groups = [], isLoading } = useGroups();
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<"BILL" | "GOAL">("BILL");

  const filtered = groups.filter((g) => g.type === activeTab);

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-primary-foreground text-xl font-bold">Wallet</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center"
          >
            <Plus className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>

        {/* Balance card */}
        <div className="bg-primary-foreground/15 backdrop-blur-sm rounded-2xl p-4 border border-primary-foreground/10">
          <p className="text-primary-foreground/60 text-xs mb-1">
            Available Balance
          </p>
          <p className="text-primary-foreground text-2xl font-bold">
            {user?.wallet
              ? `${Number(user.wallet.balance).toLocaleString()} ${user.wallet.currency}`
              : "—"}
          </p>
          {user?.wallet && Number(user.wallet.lockedBalance) > 0 && (
            <p className="text-primary-foreground/50 text-xs mt-1">
              {Number(user.wallet.lockedBalance).toLocaleString()}{" "}
              {user.wallet.currency} committed
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-5">
        {/* <div className="flex items-center justify-between mb-3"> */}
        {/*   <h2 className="text-foreground font-semibold text-base flex items-center gap-2"> */}
        {/*     <Users className="w-4 h-4 text-primary" /> */}
        {/*     Group Savings */}
        {/*   </h2> */}
        {/*   <span className="text-muted-foreground text-xs">{groupGoals.length} groups</span> */} 
        {/*   {groups?.length === 0 ?  */}
        {/*       <span className="text-muted-foreground text-xs">No groups yet</span> : */}
        {/*       <span className="text-muted-foreground text-xs">{groups?.length} groups</span> */}
        {/*   } */}
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

      {/* Group list */}
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
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {group.type === "BILL"
                    ? group.category === "RENT"
                      ? "🏠"
                      : group.category === "ELECTRICITY"
                        ? "⚡"
                        : group.category === "WATER"
                          ? "💧"
                          : group.category === "INTERNET"
                            ? "📡"
                            : group.category === "TRIP"
                              ? "✈️"
                              : group.category === "GIFT"
                                ? "🎁"
                                : "🧾"
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

                  {/* Members */}
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

                  {/* Progress */}
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

      {/* Group Goals Network */}
      {/* <div className="px-5 mt-5"> */}
      {/*   <div className="flex items-center justify-between mb-3"> */}
      {/*     <h2 className="text-foreground font-semibold text-base flex items-center gap-2"> */}
      {/*       <Users className="w-4 h-4 text-primary" /> */}
      {/*       Group Savings */}
      {/*     </h2> */}
      {/*     {groups?.length === 0 ?  */}
      {/*         <span className="text-muted-foreground text-xs">No groups yet</span> : */}
      {/*         <span className="text-muted-foreground text-xs">{groups?.length} groups</span> */}
      {/*     } */}
      {/*   </div> */}
      {/**/}
      {/*   <div className="space-y-3"> */}
      {/*     {groups?.map((goal, i) => { */}
      {/*       const progress = (goal.currentAmount / goal.targetAmount) * 100; */}
      {/*       const groupInitials = members?.[goal.id] ?? []; */}
      {/**/}
      {/*       return ( */}
      {/*         <motion.button */}
      {/*           key={goal.id} */}
      {/*           initial={{ opacity: 0, y: 20 }} */}
      {/*           animate={{ opacity: 1, y: 0 }} */}
      {/*           transition={{ delay: i * 0.05 }} */}
      {/*           onClick={() => navigate(`/goal/${goal.id}`)} */}
      {/*           className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 text-left" */}
      {/*         > */}
      {/*           <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl"> */}
      {/*             {chooseRandomAvatar()} */}
      {/*           </div> */}
      {/*           <div className="flex-1 min-w-0"> */}
      {/*             <p className="text-foreground text-sm font-semibold truncate">{goal.title}</p> */}
      {/*             <div className="flex items-center gap-1 mt-1"> */}
      {/*               <div className="flex -space-x-1.5"> */}
      {/*                 {groups && groupInitials && groupInitials.slice(0, 3).map((m, j) => ( */}
      {/*                   <div */}
      {/*                     key={j} */}
      {/*                     className="w-5 h-5 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center" */}
      {/*                   > */}
      {/*                     <span className="text-[8px] font-bold text-primary">{m}</span> */}
      {/*                   </div> */}
      {/*                 ))} */}
      {/*                 {groupInitials.length > 3 && ( */}
      {/*                   <div className="w-5 h-5 rounded-full bg-muted border-2 border-card flex items-center justify-center"> */}
      {/*                     <span className="text-[8px] font-bold text-muted-foreground"> */}
      {/*                        +{groupInitials.length - 3} */}
      {/*                     </span> */}
      {/*                   </div> */}
      {/*                 )} */}
      {/*               </div> */}
      {/*               <span className="text-muted-foreground text-xs ml-1"> */}
      {/*                 {members?.length} members */}
      {/*               </span> */}
      {/*             </div> */}
      {/*             <div className="mt-2"> */}
      {/*               <div className="flex justify-between text-xs mb-1"> */}
      {/*                 <span className="text-muted-foreground"> */}
      {/*                   {goal.currentAmount.toLocaleString()} TJS */}
      {/*                 </span> */}
      {/*                 <span className="text-foreground font-medium"> */}
      {/*                   {goal.targetAmount.toLocaleString()} TJS */}
      {/*                 </span> */}
      {/*               </div> */}
      {/*               <div className="h-1.5 bg-secondary rounded-full overflow-hidden"> */}
      {/*                 <motion.div */}
      {/*                   initial={{ width: 0 }} */}
      {/*                   animate={{ width: `${progress}%` }} */}
      {/*                   transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} */}
      {/*                   className="h-full gradient-primary rounded-full" */}
      {/*                 /> */}
      {/*               </div> */}
      {/*             </div> */}
      {/*           </div> */}
      {/*           <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" /> */}
      {/*         </motion.button> */}
      {/*       ); */}
      {/*     })} */}
      {/*   </div> */}
      {/* </div> */}
      {/**/}
      {/* <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} /> */}
      {/* <CreateGoalModal open={showCreateGoal} onClose={() => setShowCreateGoal(false)} /> */}
      <CreateGroupSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <BottomNav />
    </div>
  );
};

export default Wallet;
