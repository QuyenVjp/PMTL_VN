import type { Metadata } from "next";

import DonationsClient from "./DonationsClient";

export const metadata: Metadata = {
  title: "Hộ Trì Phật Pháp",
  description: "Thông tin minh bạch về hộ trì Phật pháp, nguyên tắc không nhận tiền và các hình thức hỗ trợ phù hợp.",
};

export default function DonationsPage() {
  return <DonationsClient />;
}
