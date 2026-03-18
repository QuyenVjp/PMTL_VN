'use client'
// ─────────────────────────────────────────────────────────────
//  /profile — Trang hồ sơ người dùng
//  Hiển thị thông tin Google profile + cho phép chỉnh sửa
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/AuthContext'
import Breadcrumbs from '@/components/Breadcrumbs'
import { getErrorMessage, updateMe, uploadAvatarFile } from '@/lib/api/user'
import PushNotificationButton from '@/components/PushNotificationButton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlogLibraryPanel from '@/components/profile/BlogLibraryPanel'

const CMS_API_URL = (process.env.PAYLOAD_PUBLIC_SERVER_URL ?? process.env.CMS_PUBLIC_URL ?? 'http://localhost:3001')


// ─── Field nhập liệu ───────────────────────────────────────
const Field = ({
  label,
  name,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  multiline?: boolean
}) => (
  <div className="flex flex-col gap-1">
    <label className="card-eyebrow">{label}</label>
    {multiline ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className="toolbar-search min-h-[7rem] resize-none px-3 py-2"
      />
    ) : (
      <input
        name={name}
        value={value}
        onChange={onChange}
        className="toolbar-search px-3 py-2"
      />
    )}
  </div>
)

// ─── Trang chính ───────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter()
  const { user, loading, logout, refetch } = useAuth()

  // State form chỉnh sửa
  const [form, setForm] = useState({
    fullName: '',
    dharmaName: '',
    phone: '',
    address: '',
    bio: '',
  })
  const [saving, setSaving] = useState(false)
  // State avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Đồng bộ form khi user thay đổi
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        dharmaName: user.dharmaName ?? '',
        phone: user.phone ?? '',
        address: user.address ?? '',
        bio: user.bio ?? '',
      })
      // Xác định avatar URL
      const av = user.avatar_url
        ? user.avatar_url.startsWith('http')
          ? user.avatar_url
          : `${CMS_API_URL}${user.avatar_url}`
        : null
      setAvatarPreview(av)
    }
  }, [user])

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!loading && !user) router.push('/auth')
  }, [user, loading, router])

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )

  if (!user) return null

  const userName = user.username || user.email || 'nguoi-dung'

  const joinDate = new Date(user.createdAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ─── Xử lý thay đổi form ──────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // ─── Lưu thông tin hồ sơ ─────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    try {
      await updateMe({
        fullName: form.fullName || null,
        dharmaName: form.dharmaName || null,
        phone: form.phone || null,
        address: form.address || null,
        bio: form.bio || null,
      })
      await refetch()
      toast.success('Đã lưu thông tin hồ sơ')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Lưu thất bại, thử lại.'))
    } finally {
      setSaving(false)
    }
  }

  // ─── Xử lý upload ảnh ─────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      // 1. Tạo preview cục bộ bằng URL.createObjectURL để người dùng thấy ngay
      const localUrl = URL.createObjectURL(file)
      setAvatarPreview(localUrl)

      // 2. Tải ảnh lên CMS và lấy Media ID
      const { id, url: remoteUrl } = await uploadAvatarFile(file)

      // 3. Cập nhật User record trong DB bằng Media ID
      await updateMe({ avatar_url: id })

      // 4. Cập nhật lại UI với URL thật từ server
      setAvatarPreview(remoteUrl)
      await refetch()
      toast.success('Đã cập nhật ảnh đại diện')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Tải ảnh thất bại.'))
    } finally {
      setUploadingAvatar(false)
    }
  }

  // ─── Chữ cái đại diện khi chưa có avatar ─────────────────
  const initials = (user.fullName || user.username || user.email)[0]?.toUpperCase() ?? '?'

  return (
    <>

      <main className="route-shell">
        <div className="route-frame">
          <Breadcrumbs items={[{ label: 'Hồ sơ cá nhân' }]} />

          {/* ── Profile header card ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel-shell-strong mb-6 overflow-hidden"
          >
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-gold/16 via-amber-500/8 to-transparent" />

            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-12 mb-4">
                {/* Avatar + nút upload */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {/* Ảnh hoặc chữ đại diện */}
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt={userName}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full border-4 border-card object-cover"
                      unoptimized={avatarPreview.startsWith('blob:')}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-secondary">
                      <span className="font-body text-2xl font-semibold text-gold-dim">{initials}</span>
                    </div>
                  )}

                  {/* Overlay hover */}
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    {uploadingAvatar ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                  </div>

                  {/* Dấu xác thực */}
                  {user.confirmed && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-card flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                  )}

                  {/* Input file ẩn */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Nút đăng xuất */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={logout}
                    variant="outline"
                    size="sm"
                    className="rounded-md text-xs text-muted-foreground hover:border-red-500/50 hover:text-red-400"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>

              {/* Tên + username */}
              <h1 className="ant-title text-2xl text-foreground">
                {user.fullName || user.username}
              </h1>
              {user.dharmaName && (
                <p className="mt-1 text-sm text-gold-dim">{user.dharmaName}</p>
              )}
              <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>

              {user.bio && (
                <p className="text-sm text-foreground/80 mt-3 leading-relaxed max-w-xl">{user.bio}</p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Tham gia: {joinDate}
                </span>
                {user.address && (
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {user.address}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 opacity-60">
                Nhấn vào avatar để thay đổi ảnh
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6"
          >
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-md border border-border/70 bg-card/70 p-1">
                <TabsTrigger value="account">Tài khoản</TabsTrigger>
                <TabsTrigger value="library">Thư viện</TabsTrigger>
                <TabsTrigger value="notifications">Thông báo</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="mt-6">
                <div className="panel-shell p-6">
                  <h2 className="ant-title mb-4 text-xl text-foreground">Thông tin tài khoản</h2>

                  <div className="mb-4">
                    <label className="card-eyebrow mb-1 block">Email (Đăng nhập)</label>
                    <input value={user.email} disabled className="toolbar-search w-full px-3 py-2 text-muted-foreground opacity-70" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Họ và tên" name="fullName" value={form.fullName} onChange={handleChange} />
                    <Field label="Pháp danh" name="dharmaName" value={form.dharmaName} onChange={handleChange} />
                    <Field label="Số điện thoại" name="phone" value={form.phone} onChange={handleChange} />
                    <Field label="Địa chỉ" name="address" value={form.address} onChange={handleChange} />
                    <div className="sm:col-span-2">
                      <Field label="Giới thiệu" name="bio" value={form.bio} onChange={handleChange} multiline />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      variant="sacred"
                      size="lg"
                    >
                      {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="library" className="mt-6">
                <BlogLibraryPanel />
              </TabsContent>

              <TabsContent value="notifications" className="mt-6">
                <PushNotificationButton />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </>
  )
}
