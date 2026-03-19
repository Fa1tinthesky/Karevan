import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Phone, User } from "lucide-react";

const Signup = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="gradient-primary px-6 pt-16 pb-12 rounded-b-[2.5rem] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-4"
        >
          <span className="text-primary-foreground text-3xl font-bold">T</span>
        </motion.div>
        <h1 className="text-primary-foreground text-2xl font-bold">Create Account</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Join MyTcell today</p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSignup}
        className="flex-1 px-6 pt-8 space-y-4"
      >
        <div>
          <label className="text-foreground text-sm font-medium mb-2 block">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary border-0 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-foreground text-sm font-medium mb-2 block">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tel"
              placeholder="+992 90 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-secondary border-0 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-foreground text-sm font-medium mb-2 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border-0 rounded-xl py-3.5 pl-4 pr-11 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Eye className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-primary text-sm"
        >
          Create Account
        </motion.button>

        <p className="text-center text-muted-foreground text-sm">
          Already have an account?{" "}
          <button type="button" onClick={() => navigate("/login")} className="text-primary font-semibold">
            Sign In
          </button>
        </p>
      </motion.form>
    </div>
  );
};

export default Signup;
