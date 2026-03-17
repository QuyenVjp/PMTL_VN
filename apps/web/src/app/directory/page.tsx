import type { Metadata } from "next";

import DirectoryClient from "./DirectoryClient";

export const metadata: Metadata = {
  title: "Danh Bạ Quán Âm Đường",
  description: "Tra cứu Quán Âm Đường và trung tâm tu học Pháp Môn Tâm Linh trên toàn thế giới.",
};

export default function DirectoryPage() {
  return <DirectoryClient />;
}
