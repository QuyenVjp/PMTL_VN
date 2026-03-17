import type { Metadata } from "next";

import VideosClient from "./VideosClient";

export const metadata: Metadata = {
  title: "Video Khai Thị",
  description: "Tổng hợp video khai thị, pháp hội và câu chuyện nhân quả hiện tiền từ Pháp Môn Tâm Linh.",
};

export default function VideosPage() {
  return <VideosClient />;
}
