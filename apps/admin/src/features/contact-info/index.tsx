import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GlobeIcon, LockIcon, SaveIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceScopeCards } from "@/components/workspace";
import { contactInfoOptions } from "./queries.js";
import { useUpdateContactInfo, type UpdateContactInfoInput } from "./mutations.js";

export function ContactInfoPage() {
  const { data, isLoading } = useQuery(contactInfoOptions());
  const update = useUpdateContactInfo();

  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");
  const [zalo, setZalo] = useState("");

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? "");
      setEmail(data.email ?? "");
      setPhone(data.phone ?? "");
      setAddress(data.address ?? "");
      setFacebook(data.socialLinks?.facebook ?? "");
      setYoutube(data.socialLinks?.youtube ?? "");
      setZalo(data.socialLinks?.zalo ?? "");
    }
  }, [data]);

  function handleSave() {
    const input: UpdateContactInfoInput = {
      title: title || undefined,
      email: email || undefined,
      phone: phone || undefined,
      address: address || undefined,
      socialLinks: {
        ...(facebook ? { facebook } : {}),
        ...(youtube ? { youtube } : {}),
        ...(zalo ? { zalo } : {}),
      },
    };
    update.mutate(input);
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thông tin liên hệ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Quản lý thông tin liên hệ hiển thị trên trang web công khai.
        </p>
      </div>

      <WorkspaceScopeCards
        items={[
          {
            title: "Public contact owner",
            description: "Các trường ở đây được public website dùng trực tiếp, nên chỉ nhập thông tin đã được xác nhận.",
            badge: "Contact",
            icon: GlobeIcon,
          },
          {
            title: "Tách khỏi phụng sự viên",
            description: "Danh sách phụng sự viên dùng route riêng; trang này chỉ là thông tin liên hệ chung của tổ chức.",
            badge: "Không phải staff CRUD",
            icon: UsersIcon,
          },
          {
            title: "Quyền ghi hẹp",
            description: "Design backlog ghi contact-info update là super-admin only, không trộn với quyền CRUD phụng sự viên.",
            badge: "Super-admin write",
            icon: LockIcon,
          },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>Tên đạo tràng, email, điện thoại, địa chỉ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tên đạo tràng</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Pháp Môn Tâm Linh Việt Nam"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="lienhe@pmtl.vn"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Số điện thoại</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 xxx xxx xxx"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Địa chỉ</label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, đường, quận/huyện, thành phố"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liên kết mạng xã hội</CardTitle>
            <CardDescription>URL các trang mạng xã hội chính thức.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Facebook</label>
              <Input
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">YouTube</label>
              <Input
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Zalo</label>
              <Input
                value={zalo}
                onChange={(e) => setZalo(e.target.value)}
                placeholder="https://zalo.me/..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={update.isPending}>
          <SaveIcon className="mr-2 h-4 w-4" />
          {update.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </div>
  );
}
