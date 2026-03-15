import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage, uploadAvatarFile, updateMe } from '@/lib/api/user';

export default function AvatarUploader({ initialUrl }: { initialUrl?: string }) {
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await uploadAvatarFile(file);
      // Update user avatar_url field
      await updateMe({ avatar_url: data.id });
      setPreview(data.url);
      toast.success('Đã cập nhật ảnh đại diện');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Tải ảnh đại diện thất bại'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {preview ? (
        <Image src={preview} alt="Avatar" width={80} height={80} className="rounded-full border-2 border-card" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center">
          <span className="font-display text-2xl text-gold">?</span>
        </div>
      )}
      <label className="cursor-pointer text-xs text-gold hover:underline">
        {uploading ? 'Đang tải...' : 'Thay đổi ảnh'}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}
