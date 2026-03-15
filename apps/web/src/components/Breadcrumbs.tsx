'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  centered?: boolean
}

export default function Breadcrumbs({ items, className = '', centered = false }: BreadcrumbsProps) {
  return (
    <nav
      className={`flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground mb-8 flex-wrap ${centered ? 'justify-center' : ''} ${className}`}
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="hover:text-gold transition-colors flex items-center gap-1"
        title="Trang chủ"
      >
        <Home className="w-3 h-3 md:w-3.5 md:h-3.5" />
        <span className="sr-only md:not-sr-only">Trang chủ</span>
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5 opacity-40 shrink-0" />

            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-gold transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ) : (
              <span className={`whitespace-nowrap ${isLast ? 'text-foreground font-medium' : ''}`}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
