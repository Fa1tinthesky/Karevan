import { motion } from "framer-motion";
import {
  ChevronRight,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Moon,
  Camera,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import BottomNav from "@/components/BottomNav";
import { useCurrentUser } from "@/context/SessionContext";
import { useEditUser } from "@/hooks/useEditUser";
import supabase from "@/supabase";

const menuItems = [
  { icon: Globe, label: "Language", value: "English", path: "/language" },
  { icon: Bell, label: "Notifications", toggle: true },
  { icon: Moon, label: "Dark Mode", toggle: true },
  { icon: Shield, label: "Security", path: "/security" },
  { icon: HelpCircle, label: "Help & Support", path: "/support" },
];

async function handleLogout(navigate: NavigateFunction) {
  await supabase.auth.signOut();
  navigate("/auth/login");
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { mutate: editUser, isPending: isUploadingAvatar } = useEditUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [toggles, setToggles] = useState<Record<string, boolean>>(() => ({
    Notifications: true,
    "Dark Mode": document.documentElement.classList.contains("dark"),
  }));

  useEffect(() => {
    if (toggles["Dark Mode"]) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [toggles["Dark Mode"]]);

  // Initials fallback from name or username
  const initials = (user?.name ?? user?.username ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    editUser({ avatarFile: file });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary px-5 pt-12 pb-10 rounded-b-[2rem] flex flex-col items-center">
        <div className="relative mb-3">
          <Avatar className="w-20 h-20 border-4 border-primary-foreground/20">
            <AvatarImage src={user?.avatarUrl ?? ""} />
            <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Camera button */}
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary-foreground flex items-center justify-center shadow-primary disabled:opacity-50"
          >
            {isUploadingAvatar ? (
              <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-primary" />
            )}
          </button>

          {/* Hidden file input */}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <h1 className="text-primary-foreground text-lg font-bold">
          {user?.name ?? user?.username ?? "—"}
        </h1>
        <p className="text-primary-foreground/60 text-sm">
          {user?.phone ?? user?.email ?? "—"}
        </p>
      </div>

      {/* Account Info */}
      <div className="px-5 -mt-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 shadow-card"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-xs">Username</p>
              <p className="text-foreground font-semibold text-sm mt-0.5">
                @{user?.username ?? "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Wallet Balance</p>
              <p className="text-foreground font-semibold text-sm mt-0.5">
                {user?.wallet
                  ? `${Number(user.wallet.balance).toLocaleString()} ${user.wallet.currency}`
                  : "—"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Menu */}
      <div className="px-5 mt-5 space-y-2">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => !item.toggle && item.path && navigate(item.path)}
              className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-3 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-foreground text-sm font-medium flex-1 text-left">
                {item.label}
              </span>
              {item.toggle ? (
                <Switch
                  checked={toggles[item.label] ?? false}
                  onCheckedChange={(checked) =>
                    setToggles((prev) => ({ ...prev, [item.label]: checked }))
                  }
                />
              ) : (
                <div className="flex items-center gap-1">
                  {item.value && (
                    <span className="text-muted-foreground text-xs">
                      {item.value}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={() => handleLogout(navigate)}
          className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-3 mt-4"
        >
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-4.5 h-4.5 text-destructive" />
          </div>
          <span className="text-destructive text-sm font-medium flex-1 text-left">
            Log Out
          </span>
        </motion.button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
