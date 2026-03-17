'use client'

import { useRef } from 'react'
import { usePathname } from 'next/navigation'
import { useReportWebVitals } from 'next/web-vitals'

type WebVitalMetric = {
  id: string
  name: string
  value: number
  delta: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
}

function sendMetric(metric: WebVitalMetric, pathname: string) {
  const body = JSON.stringify({
    ...metric,
    pathname,
    href: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  })

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/api/internal/monitoring/web-vitals', blob)
    return
  }

  void fetch('/api/internal/monitoring/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  })
}

export default function WebVitalsReporter() {
  const pathname = usePathname()
  const sentMetrics = useRef<Set<string>>(new Set())

  useReportWebVitals((metric) => {
    const key = `${pathname}:${metric.id}`
    if (sentMetrics.current.has(key)) {
      return
    }

    sentMetrics.current.add(key)

    sendMetric(
      {
        id: metric.id,
        name: metric.name,
        value: metric.value,
        delta: metric.delta,
        ...(metric.rating ? { rating: metric.rating } : {}),
        ...(metric.navigationType ? { navigationType: metric.navigationType } : {}),
      },
      pathname,
    )
  })

  return null
}
