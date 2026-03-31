export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
      <h1 className="text-3xl font-bold mb-4">Không có kết nối mạng</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Vui lòng kiểm tra kết nối internet và thử lại.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg text-lg hover:bg-primary/90 transition"
      >
        Thử lại
      </button>
    </main>
  );
}
