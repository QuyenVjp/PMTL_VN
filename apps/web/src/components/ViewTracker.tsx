'use client'

import { useEffect, useRef } from 'react'
import { incrementViewAction } from '@/app/actions/search'

export default function ViewTracker({ documentId, slug }: { documentId: string; slug?: string }) {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!documentId || hasTracked.current) return
    hasTracked.current = true

    incrementViewAction(documentId).catch(() => {
      // View tracking là best-effort, không log lỗi ra production
    })
  }, [documentId, slug])

  return null
}
