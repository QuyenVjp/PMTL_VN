'use client'

import { useTheme } from "next-themes";
import { motion } from "framer-motion";

const SunIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" strokeLinecap="round" />
    <line x1="12" y1="21" x2="12" y2="23" strokeLinecap="round" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeLinecap="round" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeLinecap="round" />
    <line x1="1" y1="12" x2="3" y2="12" strokeLinecap="round" />
    <line x1="21" y1="12" x2="23" y2="12" strokeLinecap="round" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeLinecap="round" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeLinecap="round" />
  </svg>
);

const MoonIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <motion.button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 text-muted-foreground hover:text-gold transition-colors"
      whileTap={{ scale: 0.9 }}
      aria-label="Chuyển đổi giao diện sáng/tối"
    >
      <div className="dark:hidden">
        <MoonIcon />
      </div>
      <div className="hidden dark:block">
        <SunIcon />
      </div>
    </motion.button>
  );
};

export default ThemeToggle;
