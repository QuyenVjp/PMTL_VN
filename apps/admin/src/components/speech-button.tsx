/**
 * SpeechButton — text-to-speech for elderly-first UX.
 *
 * Uses browser Web Speech API (SpeechSynthesis) to read content aloud.
 * Designed for moderation queue and content preview panels.
 * Falls back silently when SpeechSynthesis is unavailable (Firefox ESR, etc).
 */
import { useState, useEffect, useCallback } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { announce } from "@react-aria/live-announcer";

interface SpeechButtonProps {
  text: string;
  label?: string;
  lang?: string;
  className?: string;
}

export function SpeechButton({
  text,
  label = "Đọc to",
  lang = "vi-VN",
  className = "",
}: SpeechButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (!supported || !text.trim()) return;

    if (speaking) {
      stop();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;  // slightly slower for elderly users
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setSpeaking(true);
      // Announce to screen readers that playback started
      announce(`Đang đọc: ${label}`, "polite");
    };
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported, text, lang, label, speaking, stop]);

  // Stop on unmount
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={speaking ? "Dừng đọc" : label}
      aria-pressed={speaking}
      title={speaking ? "Dừng đọc" : label}
      className={[
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        "border border-border bg-background hover:bg-muted",
        speaking
          ? "text-primary border-primary/50 bg-primary/5"
          : "text-muted-foreground",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {speaking ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Volume2 className="h-3.5 w-3.5" aria-hidden />
      )}
      {speaking ? "Dừng" : label}
    </button>
  );
}

/**
 * SpeechStopButton — standalone stop control for moderation table toolbars.
 */
export function SpeechStopButton({ className = "" }: { className?: string }) {
  const active = typeof window !== "undefined" && window.speechSynthesis?.speaking;

  if (!active) return null;

  return (
    <button
      type="button"
      onClick={() => window.speechSynthesis.cancel()}
      aria-label="Dừng đọc"
      className={[
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
        "text-destructive border border-destructive/30 hover:bg-destructive/10",
        className,
      ].join(" ")}
    >
      <VolumeX className="h-3.5 w-3.5" aria-hidden />
      Dừng
    </button>
  );
}
