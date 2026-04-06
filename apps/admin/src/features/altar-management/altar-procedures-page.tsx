export function AltarProceduresPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quy trình bàn thờ</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hướng dẫn và quy trình chuẩn cho việc chăm sóc bàn thờ
        </p>
      </div>

      <div className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Quy tắc cốt lõi</h2>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              1
            </span>
            <div>
              <p className="font-medium">Nước cúng</p>
              <p className="text-sm text-muted-foreground">
                Chỉ dùng nước mát. Tuyệt đối cấm dùng nước nóng hoặc nước sôi.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              2
            </span>
            <div>
              <p className="font-medium">Nhang</p>
              <p className="text-sm text-muted-foreground">
                Phải dùng số lẻ (1, 3, 5…). Không dùng số chẵn. Cắm đúng hướng, thẳng đứng.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              3
            </span>
            <div>
              <p className="font-medium">Bình chứa Ngôi Nhà Nhỏ (NNN)</p>
              <p className="text-sm text-muted-foreground">
                Phải bằng gốm hoặc sứ trắng. Tuyệt đối không dùng vật liệu kim loại.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              4
            </span>
            <div>
              <p className="font-medium">Hình ảnh thờ cúng</p>
              <p className="text-sm text-muted-foreground">
                Không dùng ảnh được tạo bởi AI. Không dùng vật phẩm có QR code hoặc UUID in trên bề mặt.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 flex size-7 items-center justify-center rounded-full bg-muted text-sm font-semibold">
              5
            </span>
            <div>
              <p className="font-medium">Báo hỏng vật phẩm</p>
              <p className="text-sm text-muted-foreground">
                Khi phát hiện vật phẩm bị hỏng, hệ thống tự động giao nhiệm vụ{" "}
                <strong>"7 biến Lễ Phật"</strong> cho người phụ trách.
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
