'use client'
// ─────────────────────────────────────────────────────────────
//  components/MeditationTimer.tsx — Đồng hồ thiền định
//
//  Chức năng:
//   - Đếm ngược hoặc đếm lên (tuỳ chọn)
//   - Chuông báo hiệu bắt đầu / kết thúc / khoảng (interval)
//   - Preset thời gian: 5, 10, 15, 20, 30, 45, 60 phút
//   - Lưu thời gian yêu thích vào localStorage
// ─────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

const PRESETS_MIN = [5, 10, 15, 20, 30, 45, 60]

// Tạo tiếng chuông bằng Web Audio API (không cần file âm thanh)
function playBell(ctx: AudioContext, frequency = 528, duration = 2.5, volume = 0.6) {
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  // Giảm dần âm lượng để giống chuông
  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)

  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

interface MeditationTimerProps {
  /** Lớp CSS bổ sung */
  className?: string
  /** Thời gian mặc định (phút, mặc định 10) */
  defaultMinutes?: number
}

export default function MeditationTimer({
  className,
  defaultMinutes = 10,
}: MeditationTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60)
  const [remaining, setRemaining] = useState(defaultMinutes * 60)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const [intervalMin, setIntervalMin] = useState(0)   // 0 = không có chuông khoảng
  const [elapsed, setElapsed] = useState(0)
  const [customMin, setCustomMin] = useState('')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  const ringBell = useCallback((f = 528, d = 2.5) => {
    try { playBell(getAudioCtx(), f, d) } catch { }
  }, [getAudioCtx])

  // Tick mỗi giây
  useEffect(() => {
    if (!running) return

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          setFinished(true)
          ringBell(396, 4) // Chuông kết thúc — tần số thấp hơn, dài hơn
          return 0
        }
        const next = prev - 1
        setElapsed((e) => {
          const newElapsed = e + 1
          // Chuông khoảng
          if (intervalMin > 0 && newElapsed % (intervalMin * 60) === 0) {
            ringBell(528, 2)
          }
          return newElapsed
        })
        return next
      })
    }, 1000)

    return () => clearInterval(intervalRef.current!)
  }, [running, intervalMin, ringBell])

  const start = useCallback(() => {
    setFinished(false)
    setRunning(true)
    ringBell(639, 2) // Chuông bắt đầu
  }, [ringBell])

  const pause = useCallback(() => {
    setRunning(false)
    clearInterval(intervalRef.current!)
  }, [])

  const reset = useCallback((min?: number) => {
    clearInterval(intervalRef.current!)
    const secs = (min ?? totalSeconds / 60) * 60
    setTotalSeconds(secs)
    setRemaining(secs)
    setElapsed(0)
    setRunning(false)
    setFinished(false)
  }, [totalSeconds])

  const setPreset = useCallback((min: number) => {
    reset(min)
  }, [reset])

  const applyCustom = () => {
    const min = parseInt(customMin, 10)
    if (!isNaN(min) && min > 0 && min <= 180) {
      setPreset(min)
      setCustomMin('')
    }
  }

  // Tính % tiến trình
  const progress = totalSeconds > 0 ? ((totalSeconds - remaining) / totalSeconds) * 100 : 0
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  // Format thời gian
  const fmtTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* ── Tiêu đề ── */}
      <div className="text-center">
        <p className="text-gold text-xs font-medium tracking-widest uppercase mb-1">Thiền Định</p>
        <h2 className="font-display text-xl text-foreground">Đồng Hồ Thiền Định</h2>
      </div>

      {/* ── Vòng tròn tiến trình ── */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="192" height="192" viewBox="0 0 192 192">
          {/* Vòng nền */}
          <circle
            cx="96" cy="96" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-border"
          />
          {/* Vòng tiến trình */}
          <circle
            cx="96" cy="96" r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-gold transition-all duration-1000"
          />
        </svg>
        {/* Thời gian */}
        <div className="text-center z-10">
          <span className={cn(
            'font-mono text-3xl font-semibold tracking-tight',
            finished ? 'text-gold' : 'text-foreground'
          )}>
            {fmtTime(remaining)}
          </span>
          {finished && (
            <p className="text-xs text-gold mt-1 animate-pulse">Hoàn thành</p>
          )}
          {running && remaining > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {fmtTime(totalSeconds - remaining)} / {fmtTime(totalSeconds)}
            </p>
          )}
        </div>
      </div>

      {/* ── Nút điều khiển ── */}
      <div className="flex items-center gap-3">
        {/* Reset */}
        <button
          onClick={() => reset()}
          disabled={remaining === totalSeconds && !running}
          className="p-2.5 rounded-full border border-border hover:border-gold/50 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
          aria-label="Đặt lại"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>

        {/* Start / Pause */}
        <button
          onClick={running ? pause : start}
          disabled={remaining === 0}
          className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center font-medium transition-all text-black',
            running
              ? 'bg-gold/80 hover:bg-gold'
              : 'bg-gold hover:opacity-90',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          aria-label={running ? 'Tạm dừng' : 'Bắt đầu'}
        >
          {running ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          )}
        </button>

        {/* Chuông khoảng */}
        <button
          onClick={() => {
            const opts = [0, 5, 10, 15, 20]
            const idx = opts.indexOf(intervalMin)
            setIntervalMin(opts[(idx + 1) % opts.length])
          }}
          className={cn(
            'p-2.5 rounded-full border transition-all',
            intervalMin > 0
              ? 'border-gold/60 text-gold'
              : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
          )}
          aria-label="Chuông khoảng"
          title={intervalMin > 0 ? `Chuông mỗi ${intervalMin} phút` : 'Bật chuông khoảng'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {intervalMin > 0 && (
            <span className="text-xs font-medium">{intervalMin}p</span>
          )}
        </button>
      </div>

      {intervalMin > 0 && (
        <p className="text-xs text-muted-foreground">
          Chuông nhắc mỗi <span className="text-gold">{intervalMin} phút</span>
        </p>
      )}

      {/* ── Preset thời gian ── */}
      <div className="w-full">
        <p className="text-xs text-muted-foreground text-center mb-2">Chọn thời gian</p>
        <div className="flex flex-wrap justify-center gap-2">
          {PRESETS_MIN.map((min) => (
            <button
              key={min}
              onClick={() => setPreset(min)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                totalSeconds === min * 60 && !running
                  ? 'bg-gold text-black border-gold'
                  : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground'
              )}
            >
              {min >= 60 ? `${min / 60}h` : `${min}p`}
            </button>
          ))}
        </div>

        {/* Custom thời gian */}
        <div className="flex items-center gap-2 mt-3 justify-center">
          <input
            type="number"
            min="1"
            max="180"
            value={customMin}
            onChange={(e) => setCustomMin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyCustom()}
            placeholder="Tuỳ chỉnh"
            className="w-24 px-3 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-gold"
          />
          <span className="text-xs text-muted-foreground">phút</span>
          <button
            onClick={applyCustom}
            className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:border-gold/50 hover:text-foreground transition-all"
          >
            Đặt
          </button>
        </div>
      </div>
    </div>
  )
}
