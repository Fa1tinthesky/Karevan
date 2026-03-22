import { motion } from "framer-motion";
import { ArrowUpRight, Plus, Users, Target, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
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

const Wallet = () => {
  const navigate = useNavigate();
  const [showTransfer, setShowTransfer] = useState(false);
  const [showCreateGoal, setShowCreateGoal] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-6 rounded-b-[2rem]">
        <h1 className="text-primary-foreground text-xl font-bold mb-4">Wallet</h1>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTransfer(true)}
            className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-primary-foreground/10"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-primary-foreground text-sm font-semibold">Transfer</p>
              <p className="text-primary-foreground/60 text-xs">Send money</p>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateGoal(true)}
            className="flex-1 bg-primary-foreground/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 border border-primary-foreground/10"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-primary-foreground text-sm font-semibold">New Goal</p>
              <p className="text-primary-foreground/60 text-xs">Save together</p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Group Goals */}
      <div className="px-5 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground font-semibold text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Group Savings
          </h2>
          <span className="text-muted-foreground text-xs">{groupGoals.length} groups</span>
        </div>

        <div className="space-y-3">
          {groupGoals.map((goal, i) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/goal/${goal.id}`)}
                className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-3 text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                  {goal.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground text-sm font-semibold truncate">{goal.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex -space-x-1.5">
                      {goal.members.slice(0, 3).map((m, j) => (
                        <div
                          key={j}
                          className="w-5 h-5 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center"
                        >
                          <span className="text-[8px] font-bold text-primary">{m}</span>
                        </div>
                      ))}
                      {goal.members.length > 3 && (
                        <div className="w-5 h-5 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                          <span className="text-[8px] font-bold text-muted-foreground">
                            +{goal.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-muted-foreground text-xs ml-1">
                      {goal.members.length} members
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {goal.current.toLocaleString()} TJS
                      </span>
                      <span className="text-foreground font-medium">
                        {goal.target.toLocaleString()} TJS
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                        className="h-full gradient-primary rounded-full"
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.button>
            );
          })}
        </div>
      </div>

      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} />
      <CreateGoalModal open={showCreateGoal} onClose={() => setShowCreateGoal(false)} />
      <BottomNav />
    </div>
  );
};

export default Wallet;
