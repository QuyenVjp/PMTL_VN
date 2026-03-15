import { getBeginnerGuides } from "@/lib/api/guides";
import BeginnerGuideClient from "./BeginnerGuideClient";

export const metadata = {
  title: "Hướng Dẫn Sơ Học | Pháp Môn Tâm Linh",
  description: "Lộ trình bước để bắt đầu tu học Pháp Môn Tâm Linh. Tất cả tài liệu đều miễn phí tuyệt đối.",
};

export default async function BeginnerGuidePage() {
  const guides = await getBeginnerGuides();
  return <BeginnerGuideClient initialGuides={guides} />;
}
