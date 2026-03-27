export default function Loading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 h-4 w-full animate-pulse rounded bg-gray-100" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-gray-100" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      </div>
    </main>
  );
}
