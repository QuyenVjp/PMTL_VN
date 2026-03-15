export interface PushProcessResult {
  success: number;
  failed: number;
  invalid: number;
  matched: number;
  processedRows: number;
  completed: boolean;
  jobDocumentId: string;
}

export async function processNextPushJob(): Promise<PushProcessResult | null> {
  return null;
}
