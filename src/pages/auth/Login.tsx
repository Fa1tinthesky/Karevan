import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // const [formValues, setFormValues] = useState({
  //   email: "",
  //   password: "",
  // });
  const navigate = useNavigate();

  const { session } = useSession();
  if (session) return <Navigate to="/" />;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Logging in...");
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert(error.message);
    }
    setStatus("");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Section */}
      <div className="gradient-primary px-6 pt-16 pb-12 rounded-b-[2.5rem] flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mb-4"
        >
          <span className="text-primary-foreground text-3xl font-bold">T</span>
        </motion.div>
        <h1 className="text-primary-foreground text-2xl font-bold">MyTcell</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">Welcome back</p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="flex-1 px-6 pt-8 space-y-5"
      >
        <div>
          <label className="text-foreground text-sm font-medium mb-2 block">Phone Number</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="tcell"
              name="email"
              placeholder="megabonk@gmail.com"
              value={email}
              onChange={(e) => {setEmail(e.target.value)}}
              className="w-full bg-secondary border-0 rounded-xl py-3.5 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-foreground text-sm font-medium mb-2 block">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => {setPassword(e.target.value)}}
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
          <button type="button" className="text-primary text-xs font-medium mt-2">
            Forgot password?
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full gradient-primary text-primary-foreground font-semibold py-3.5 rounded-xl shadow-primary text-sm"
        >
          Sign In
        </motion.button>

        <p className="text-center text-muted-foreground text-sm">
          Don't have an account?{" "}
          <button type="button" onClick={() => navigate("/auth/sign-up")} className="text-primary font-semibold">
            Sign Up
          </button>
        </p>
        {status && <p>{status}</p>}
      </motion.form>
    </div>
  );
};

export default Login;
