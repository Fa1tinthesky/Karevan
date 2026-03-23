import { ButtonHTMLAttributes } from "react";
import { theme } from "../../theme";

type Variant = "primary" | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export const AppButton = ({
  variant = "primary",
  loading,
  children,
  disabled,
  ...props
}: Props) => {
  const isPrimary = variant === "primary";

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: isPrimary
          ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`
          : "transparent",
        color: theme.colors.text,
        border: isPrimary
          ? "none"
          : `1.5px solid ${theme.colors.surfaceBorder}`,
      }}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};
