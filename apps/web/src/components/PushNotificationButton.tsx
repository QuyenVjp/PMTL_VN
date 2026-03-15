'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Bell, BellOff, Loader2, ShieldAlert, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { createHttpError, getErrorMessage } from '@/lib/http-error'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const NOTIFICATION_TYPES = [
  { 
    value: 'daily_chant', 
    label: 'Tu học hằng ngày',
    description: 'Lời nhắc công khóa và nhịp tu học.',
    recommended: true
  },
  { 
    value: 'content_update', 
    label: 'Bài viết & kinh điển',
    description: 'Nội dung mới phù hợp với sở thích của anh.',
    recommended: true
  },
  { 
    value: 'event_reminder', 
    label: 'Sự kiện & lịch tu',
    description: 'Sự kiện sắp diễn ra, cách thông báo thông minh.',
    recommended: true
  },
  { 
    value: 'community', 
    label: 'Diễn đàn',
    description: 'Phản hồi trong các bài viết anh quan tâm.',
    recommended: true
  },
] as const

type NotificationType = (typeof NOTIFICATION_TYPES)[number]['value']
type Status =
  | 'unsupported'
  | 'loading'
  | 'permission_required'
  | 'ready_to_subscribe'
  | 'subscribed'
  | 'saving'
  | 'error'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array(Array.from(rawData).map((c) => c.charCodeAt(0)))
}

function statusCopy(status: Status, message: string | null) {
  switch (status) {
    case 'unsupported':
      return {
        title: 'Thiết bị hiện tại chưa hỗ trợ web push',
        description: 'Tính năng này cần Notification, Service Worker và Push API trên trình duyệt.',
      }
    case 'permission_required':
      return {
        title: 'Chưa cấp quyền thông báo',
        description: 'Anh cần cho phép thông báo trong trình duyệt trước khi bật tính năng này.',
      }
    case 'subscribed':
      return {
        title: 'Đã bật thông báo',
        description: 'Thiết bị này sẽ nhận đúng các nhóm nội dung anh đã tick, không còn phụ thuộc giờ cố định.',
      }
    case 'error':
      return {
        title: 'Thiết lập thông báo chưa hoàn tất',
        description: message || 'Có lỗi khi lưu cấu hình push.',
      }
    case 'saving':
      return {
        title: 'Đang lưu cấu hình thông báo',
        description: 'Hệ thống đang đồng bộ subscription và nhóm thông báo đã chọn.',
      }
    case 'ready_to_subscribe':
      return {
        title: 'Có thể bật thông báo ngay',
        description: 'Chọn nhóm muốn nhận rồi bật cho thiết bị này.',
      }
    default:
      return {
        title: 'Đang kiểm tra cấu hình thông báo',
        description: 'Hệ thống đang xác định trạng thái push trên trình duyệt và máy chủ.',
      }
  }
}

function statusBadge(status: Status) {
  switch (status) {
    case 'subscribed':
      return { label: 'Đã bật', variant: 'default' as const }
    case 'saving':
      return { label: 'Đang lưu', variant: 'secondary' as const }
    case 'permission_required':
      return { label: 'Cần cấp quyền', variant: 'secondary' as const }
    case 'unsupported':
      return { label: 'Không hỗ trợ', variant: 'destructive' as const }
    case 'error':
      return { label: 'Lỗi cấu hình', variant: 'destructive' as const }
    case 'ready_to_subscribe':
      return { label: 'Sẵn sàng', variant: 'outline' as const }
    default:
      return { label: 'Đang kiểm tra', variant: 'secondary' as const }
  }
}

function alertVariant(status: Status) {
  return status === 'error' || status === 'unsupported' ? 'destructive' : 'default'
}

export default function PushNotificationButton({
  className,
  compact = false,
  title = 'Thông báo tu học trên thiết bị này',
  description = 'Chọn đúng loại muốn nhận. Khi có bài mới, hoạt động cộng đồng hoặc sự kiện được phát hành, hệ thống sẽ gửi ngay.',
}: {
  className?: string
  compact?: boolean
  title?: string
  description?: string
}) {
  const { user } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>(['community'])
  const [endpoint, setEndpoint] = useState<string | null>(null)

  const statusText = useMemo(() => statusCopy(status, message), [status, message])
  const badge = useMemo(() => statusBadge(status), [status])
  const isSubscribed = status === 'subscribed'
  const disabled = saving || status === 'unsupported'

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (mounted) setStatus('unsupported')
        return
      }

      if (Notification.permission === 'denied') {
        if (mounted) setStatus('permission_required')
        return
      }

      try {
        const reg = await navigator.serviceWorker.ready
        const subscription = await reg.pushManager.getSubscription()
        const currentEndpoint = subscription?.endpoint ?? null
        if (mounted) setEndpoint(currentEndpoint)

        if (!currentEndpoint) {
          if (mounted) {
            setStatus(Notification.permission === 'granted' ? 'ready_to_subscribe' : 'permission_required')
          }
          return
        }

        const res = await fetch('/api/push/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: currentEndpoint }),
        })

        if (!res.ok) throw await createHttpError(res, 'Không thể đọc cấu hình push')
        const data = await res.json()
        const record = data?.data

        if (mounted && record) {
          setNotificationTypes(
            Array.isArray(record.notificationTypes) && record.notificationTypes.length > 0
              ? record.notificationTypes
              : ['community']
          )
          setStatus(record.isActive === false ? 'ready_to_subscribe' : 'subscribed')
        } else if (mounted) {
          setStatus('subscribed')
        }
      } catch (error) {
        if (mounted) {
          setMessage(getErrorMessage(error, 'Không thể khởi tạo cấu hình push'))
          setStatus('error')
        }
      }
    }

    bootstrap()
    return () => {
      mounted = false
    }
  }, [])

  const persistSubscription = async (subscription: PushSubscription) => {
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        notificationTypes,
        userId: user?.id,
      }),
    })

    if (!res.ok) throw await createHttpError(res, 'Lưu cấu hình thông báo thất bại')
  }

  const handleSubscribe = async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) {
      setMessage('Thiếu NEXT_PUBLIC_VAPID_PUBLIC_KEY.')
      setStatus('error')
      toast.error('Thiếu cấu hình thông báo đẩy trên môi trường hiện tại.')
      return
    }

    setSaving(true)
    setStatus('saving')
    setMessage(null)

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('permission_required')
        toast.error('Anh chưa cấp quyền thông báo cho trình duyệt.')
        return
      }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      const subscription =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        }))

      await persistSubscription(subscription)
      setEndpoint(subscription.endpoint)
      setStatus('subscribed')
      toast.success('Đã bật thông báo và lưu cấu hình push.')
    } catch (error) {
      const nextMessage = getErrorMessage(error, 'Đăng ký thông báo thất bại')
      setMessage(nextMessage)
      setStatus('error')
      toast.error(nextMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    if (!endpoint) return handleSubscribe()

    setSaving(true)
    setStatus('saving')
    setMessage(null)

    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (!subscription) {
        setStatus('ready_to_subscribe')
        toast.error('Subscription trên trình duyệt đã mất, cần bật lại.')
        return
      }

      await persistSubscription(subscription)
      setStatus('subscribed')
      toast.success('Đã cập nhật cài đặt thông báo.')
    } catch (error) {
      const nextMessage = getErrorMessage(error, 'Cập nhật thông báo thất bại')
      setMessage(nextMessage)
      setStatus('error')
      toast.error(nextMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUnsubscribe = async () => {
    setSaving(true)
    setStatus('saving')
    setMessage(null)

    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        const res = await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        if (!res.ok) throw await createHttpError(res, 'Tắt thông báo thất bại')
      }

      setEndpoint(null)
      setStatus(Notification.permission === 'granted' ? 'ready_to_subscribe' : 'permission_required')
      toast.success('Đã tắt thông báo trên thiết bị này.')
    } catch (error) {
      const nextMessage = getErrorMessage(error, 'Tắt thông báo thất bại')
      setMessage(nextMessage)
      setStatus('error')
      toast.error(nextMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      await handleSubscribe()
      return
    }

    await handleUnsubscribe()
  }

  return (
    <Card
      className={cn(
        'overflow-hidden border-border bg-background text-foreground shadow-ant',
        compact ? 'rounded-lg' : 'rounded-xl',
        className
      )}
    >
      <CardHeader className={cn(compact ? 'p-5' : 'p-6 md:p-8')}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground">
              {status === 'subscribed' ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[11px] uppercase tracking-[0.32em] text-gold/90">Thông báo đa kênh</p>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <CardTitle className="max-w-2xl text-2xl leading-tight md:text-[2.2rem]">{title}</CardTitle>
              <CardDescription className="max-w-2xl pt-1 text-sm leading-7 text-muted-foreground md:text-base">
                Chọn nhóm thông báo phù hợp. Hệ thống sẽ gửi ngay khi có nội dung mới hoặc hoạt động anh quan tâm.
              </CardDescription>
            </div>
          </div>

          <div className="surface-panel-muted flex items-center gap-3 px-4 py-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">Bật thông báo</p>
              <p className="text-xs text-muted-foreground">
                {isSubscribed ? 'Thiết bị này đang nhận thông báo' : 'Chưa bật'}
              </p>
            </div>
            <Switch
              checked={isSubscribed}
              disabled={disabled}
              onCheckedChange={(checked) => void handleToggle(checked)}
              aria-label="Bật thông báo"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('space-y-5', compact ? 'px-5 pb-5' : 'px-6 pb-6 md:px-7 md:pb-7')}>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Alert variant={alertVariant(status)} className="rounded-lg border-border bg-background">
            {status === 'saving' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === 'error' || status === 'unsupported' ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <AlertTitle>{statusText.title}</AlertTitle>
            <AlertDescription>{statusText.description}</AlertDescription>
          </Alert>

          <div className="rounded-lg border border-border bg-muted/30 px-5 py-4 text-foreground">
            <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Nhận ở đâu</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Máy không hiện banner vẫn không mất tin. Tất cả đợt gửi thành công sẽ hiện lại ở mục trung tâm thông báo trên web.
            </p>
            <Link
              href="/thong-bao"
              className="mt-4 inline-flex items-center gap-2 rounded-md border border-gold/20 bg-gold/10 px-3 py-2 text-sm font-medium text-gold transition hover:bg-gold/15"
            >
              Mở trung tâm thông báo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {status !== 'unsupported' && (
          <>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-stone-600">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Chọn nhóm thông báo
                </Label>
                <p className="text-sm leading-6 text-muted-foreground">
                  Bật những nhóm cần thiết. Giữ ít nhóm để thông báo đủ hữu ích mà không quá phiền.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {NOTIFICATION_TYPES.map((item) => {
                  const checked = notificationTypes.includes(item.value)
                  return (
                    <label
                      key={item.value}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all',
                        checked
                          ? 'border-gold/40 bg-gold/5 shadow-ant'
                          : 'border-border bg-background hover:border-gold/30 hover:bg-muted/30'
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        disabled={saving}
                        onCheckedChange={(nextChecked) => {
                          setNotificationTypes((prev) => {
                            if (nextChecked) return Array.from(new Set([...prev, item.value]))
                            const next = prev.filter((value) => value !== item.value)
                            return next.length > 0 ? next : ['community']
                          })
                        }}
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold leading-none text-foreground">{item.label}</p>
                          {item.recommended && (
                            <Badge variant="secondary" className="text-xs">Nên bật</Badge>
                          )}
                        </div>
                        <p className="text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>

      {status !== 'unsupported' && (
        <CardFooter
          className={cn(
            'flex flex-wrap items-center justify-between gap-3 border-t border-border bg-muted/20',
            compact ? 'px-5 py-4' : 'px-6 py-5 md:px-7'
          )}
        >
          <p className="text-sm leading-6 text-muted-foreground">
            {isSubscribed
              ? 'Thay đổi sẽ áp dụng ngay.'
              : 'Bật thông báo để thiết bị này nhận các nhóm đã chọn.'}
          </p>

          <div className="flex flex-wrap gap-3">
            {isSubscribed ? (
              <>
                <Button type="button" onClick={() => void handleUpdate()} disabled={saving} size="lg">
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Button>
                <Button type="button" onClick={() => void handleUnsubscribe()} disabled={saving} size="lg" variant="outline">
                  Tắt
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => void handleSubscribe()} disabled={saving} size="lg">
                {saving ? 'Đang bật...' : 'Bật thông báo'}
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
