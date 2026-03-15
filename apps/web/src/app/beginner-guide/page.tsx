import { getBeginnerGuides } from "@/lib/api/guides";
import { connection } from "next/server";
import BeginnerGuideClient from "./BeginnerGuideClient";

export const metadata = {
  title: "Hướng Dẫn Sơ Học | Pháp Môn Tâm Linh",
  description: "Lộ trình bước để bắt đầu tu học Pháp Môn Tâm Linh. Tất cả tài liệu đều miễn phí tuyệt đối.",
};

export default async function BeginnerGuidePage() {
  await connection();
  const guides = await getBeginnerGuides();
  return <BeginnerGuideClient initialGuides={guides} />;
}
