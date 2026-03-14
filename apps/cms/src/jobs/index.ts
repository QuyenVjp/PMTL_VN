export function enqueuePlaceholderJob(name: string, payload: Record<string, string>): void {
  console.info("[cms:job-placeholder]", { name, payload });
}

