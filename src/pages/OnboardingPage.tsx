import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useEditUser } from "../hooks/useEditUser";
import { useCurrentUser } from "../context/SessionContext";
import { AppInput } from "../components/ui/AppInput";
import { AppButton } from "../components/ui/AppButton";
import { theme } from "../theme";

// ── Slide data ─────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🤝",
    title: "Group Bills",
    desc: "Split rent, utilities, and shared expenses with friends and family — no more chasing people on Telegram.",
  },
  {
    icon: "🎯",
    title: "Savings Goals",
    desc: "Save for a trip, a gift, or anything — solo or with a crew. Set a schedule and watch it grow.",
  },
  {
    icon: "💬",
    title: "Group Chat",
    desc: "Every bill and goal has its own live chat. The app notifies your group automatically when someone pays.",
  },
  {
    icon: "🔒",
    title: "Committed Money",
    desc: "When you commit to a group bill, your share is soft-locked. No surprises on payment day.",
  },
];

// ── Slide components ───────────────────────────────────────────
const SlideWelcome = ({
  name,
  phone,
  nameError,
  phoneError,
  onChange,
}: {
  name: string;
  phone: string;
  nameError: string;
  phoneError: string;
  onChange: (field: "name" | "phone", value: string) => void;
}) => (
  <div className="flex flex-col gap-6">
    <div>
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: theme.colors.text }}
      >
        Welcome 👋
      </h1>
      <p className="text-sm" style={{ color: theme.colors.textMuted }}>
        Let's get your profile set up. This takes 30 seconds.
      </p>
    </div>

    <AppInput
      label="Your name"
      placeholder="e.g. Bahir"
      value={name}
      error={nameError}
      onChange={(e) => onChange("name", e.target.value)}
    />
    <AppInput
      label="Phone number"
      placeholder="+992 XX XXX XXXX"
      type="tel"
      value={phone}
      error={phoneError}
      onChange={(e) => onChange("phone", e.target.value)}
    />
  </div>
);

// SlideAvatar onChange now receives a File
const SlideAvatar = ({
  avatarPreview,
  name,
  onChange,
}: {
  avatarPreview: string;
  name: string;
  onChange: (file: File, preview: string) => void; // both file and preview URL
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = name?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: theme.colors.text }}
        >
          Add a photo
        </h1>
        <p className="text-sm" style={{ color: theme.colors.textMuted }}>
          Optional but makes your group experience better.
        </p>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold transition-transform hover:scale-105 active:scale-95"
        style={{
          background: avatarPreview
            ? "transparent"
            : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
          border: `3px solid ${theme.colors.surfaceBorder}`,
          color: theme.colors.text,
          overflow: "hidden",
        }}
      >
        {avatarPreview ? (
          <img
            src={avatarPreview}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <span className="text-sm text-white">Change</span>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const preview = URL.createObjectURL(file); // local preview only
          onChange(file, preview);
        }}
      />

      <AppButton variant="ghost" onClick={() => inputRef.current?.click()}>
        {avatarPreview ? "Change photo" : "Upload photo"}
      </AppButton>
    </div>
  );
};

const SlideFeatures = ({ name }: { name: string }) => (
  <div className="flex flex-col gap-5">
    <div>
      <h1
        className="text-3xl font-bold mb-2"
        style={{ color: theme.colors.text }}
      >
        You're all set{name ? `, ${name.split(" ")[0]}` : ""} 🎉
      </h1>
      <p className="text-sm" style={{ color: theme.colors.textMuted }}>
        Here's what you can do inside the app.
      </p>
    </div>

    <div className="flex flex-col gap-3">
      {FEATURES.map((f) => (
        <div
          key={f.title}
          className="flex gap-4 p-4 rounded-xl"
          style={{
            background: theme.colors.primaryGhost,
            border: `1px solid ${theme.colors.surfaceBorder}`,
          }}
        >
          <span className="text-2xl">{f.icon}</span>
          <div>
            <p
              className="font-semibold text-sm mb-0.5"
              style={{ color: theme.colors.text }}
            >
              {f.title}
            </p>
            <p
              className="text-xs leading-relaxed"
              style={{ color: theme.colors.textMuted }}
            >
              {f.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Main page ──────────────────────────────────────────────────
const TOTAL_SLIDES = 3;

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { mutate: editUser, isPending } = useEditUser();

  const [slide, setSlide] = useState(0);
  // Change the form state — store the File, not the URL
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    avatarFile: null as File | null,
    avatarPreview: user?.avatarUrl ?? "", // only for display
  });
  const [errors, setErrors] = useState({ name: "", phone: "" });

  const handleChange = (field: "name" | "phone", value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validateSlide0 = () => {
    const e = { name: "", phone: "" };
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[0-9\s\-]{7,15}$/.test(form.phone))
      e.phone = "Enter a valid phone number";
    setErrors(e);
    return !e.name && !e.phone;
  };

  const next = () => {
    if (slide === 0 && !validateSlide0()) return;
    if (slide === 1) {
      // Save name + phone + avatar after slide 2
      // In next() — slide 1 saves with the file
      if (slide === 1) {
        editUser(
          {
            name: form.name,
            phone: form.phone,
            avatarFile: form.avatarFile, // File object — hook uploads it
          },
          { onSuccess: () => setSlide(2) },
        );
        return;
      }
      return;
    }
    if (slide === 2) {
      navigate("/");
      return;
    }
    setSlide((s) => s + 1);
  };

  const back = () => setSlide((s) => Math.max(0, s - 1));

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: theme.colors.surface }}
    >
      {/* Ambient glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: theme.colors.primary }}
      />

      <div
        className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-8 relative"
        style={{
          background: theme.colors.surfaceCard,
          border: `1px solid ${theme.colors.surfaceBorder}`,
        }}
      >
        {/* Progress dots */}
        <div className="flex gap-2 justify-center">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? "2rem" : "0.5rem",
                background:
                  i === slide
                    ? theme.colors.primary
                    : i < slide
                      ? theme.colors.primaryLight
                      : theme.colors.surfaceBorder,
              }}
            />
          ))}
        </div>

        {/* Slide content */}
        <div
          key={slide}
          className="animate-in fade-in slide-in-from-right-4 duration-300"
        >
          {slide === 0 && (
            <SlideWelcome
              name={form.name}
              phone={form.phone}
              nameError={errors.name}
              phoneError={errors.phone}
              onChange={handleChange}
            />
          )}
          {slide === 1 && (
            <SlideAvatar
              avatarPreview={form.avatarPreview}
              name={form.name}
              onChange={(file, preview) =>
                setForm((p) => ({
                  ...p,
                  avatarFile: file,
                  avatarPreview: preview,
                }))
              }
            />
          )}
          {slide === 2 && <SlideFeatures name={form.name} />}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {slide > 0 && slide < 2 && (
            <AppButton variant="ghost" onClick={back}>
              Back
            </AppButton>
          )}
          <AppButton onClick={next} loading={isPending}>
            {slide === 2 ? "Go to app →" : "Continue"}
          </AppButton>
        </div>

        {/* Skip avatar */}
        {slide === 1 && (
          <button
            onClick={next}
            className="text-xs text-center transition-opacity hover:opacity-70"
            style={{ color: theme.colors.textMuted }}
          >
            Skip for now
          </button>
        )}
      </div>
    </main>
  );
};

export default OnboardingPage;
