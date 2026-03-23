import { InputHTMLAttributes } from "react";
import { theme } from "../../theme";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const AppInput = ({ label, error, ...props }: Props) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label
        className="text-sm font-medium"
        style={{ color: theme.colors.textMuted }}
      >
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
        style={{
          background: theme.colors.primaryGhost,
          border: `1.5px solid ${error ? theme.colors.error : theme.colors.surfaceBorder}`,
          color: theme.colors.text,
          // @ts-ignore
          "--tw-ring-color": theme.colors.primary,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primaryLight;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? theme.colors.error
            : theme.colors.surfaceBorder;
          props.onBlur?.(e);
        }}
      />
      {error && (
        <p className="text-xs" style={{ color: theme.colors.error }}>
          {error}
        </p>
      )}
    </div>
  );
};
