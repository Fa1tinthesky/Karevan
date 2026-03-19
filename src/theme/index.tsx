export const theme = {
  colors: {
    primary: "#7C3AED", // purple-600
    primaryLight: "#8B5CF6", // purple-500
    primaryDark: "#5B21B6", // purple-800
    primaryGhost: "#7C3AED1A", // purple with 10% opacity
    surface: "#0F0A1E", // near-black with purple tint
    surfaceCard: "#1A1033", // card background
    surfaceBorder: "#2D1F4E", // border color
    text: "#F5F3FF", // primary text
    textMuted: "#A78BFA", // muted / placeholder text
    error: "#F87171", // red-400
    success: "#34D399", // emerald-400
  },
} as const;

export type AppTheme = typeof theme;
