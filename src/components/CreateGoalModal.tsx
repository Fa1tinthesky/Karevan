import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Users } from "lucide-react";
import { useState } from "react";

interface CreateGoalModalProps {
  open: boolean;
  onClose: () => void;
}

const emojis = ["🎯", "✈️", "📱", "🏠", "🚗", "💍", "🎮", "🎓", "💻", "🎉"];

const CreateGoalModal = ({ open, onClose }: CreateGoalModalProps) => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🎯");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/30 z-50"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[2rem] p-6 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-bold">Create Goal</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Emoji Picker */}
              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Choose Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                        selectedEmoji === emoji
                          ? "bg-primary/15 ring-2 ring-primary scale-110"
                          : "bg-secondary"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Goal Name</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="e.g., Trip to Dubai"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-secondary border-0 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Target Amount (TJS)</label>
                <input
                  type="number"
                  placeholder="10,000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-secondary border-0 rounded-xl py-3.5 px-4 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Invite Members</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Enter phone numbers"
                    className="w-full bg-secondary border-0 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-primary text-sm"
              >
                Create Goal
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateGoalModal;
