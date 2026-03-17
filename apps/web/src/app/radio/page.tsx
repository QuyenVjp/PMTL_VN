import type { Metadata } from "next";

import RadioClient from "./RadioClient";

export const metadata: Metadata = {
  title: "Chương Trình Phát Thanh",
  description: "Radio Phật pháp với các bài giảng, vấn đáp và chủ đề tu học có thể nghe mọi lúc.",
};

export default function RadioPage() {
  return <RadioClient />;
}
