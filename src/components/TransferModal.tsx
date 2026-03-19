import { motion, AnimatePresence } from "framer-motion";
import { X, User, ArrowUpRight } from "lucide-react";
import { useState } from "react";

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
}

const TransferModal = ({ open, onClose }: TransferModalProps) => {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");

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
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-[2rem] p-6 max-h-[80vh]"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground text-lg font-bold">Transfer Money</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Recipient</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="+992 Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-secondary border-0 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-foreground text-sm font-medium mb-2 block">Amount (TJS)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-secondary border-0 rounded-xl py-3.5 px-4 text-foreground placeholder:text-muted-foreground text-2xl font-bold text-center focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex gap-2">
                {[100, 500, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(String(val))}
                    className="flex-1 bg-secondary text-foreground text-sm font-medium py-2 rounded-xl"
                  >
                    {val} TJS
                  </button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-primary text-sm flex items-center justify-center gap-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                Send Money
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransferModal;
