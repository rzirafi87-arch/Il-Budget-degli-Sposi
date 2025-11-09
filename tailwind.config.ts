import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        "muted-fg": "var(--muted-fg)",

        primary: "var(--primary)",
        "primary-foreground": "var(--primary-fg)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-fg)",

        accent: "var(--accent)",
        "accent-foreground": "var(--accent-fg)",
        border: "var(--border)",
        ring: "var(--ring)",

        success: "var(--success)",
        warning: "var(--warning)",
        info: "var(--info)",
        destructive: "var(--destructive)",
      },
      borderColor: {
        DEFAULT: "var(--border)",
      },
      backgroundColor: {
        DEFAULT: "var(--bg)",
      },
      textColor: {
        DEFAULT: "var(--fg)",
      },
    },
  },
  plugins: [],
};

export default config;
