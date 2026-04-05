import type { LifeReleaseRecord, ReleaseAnimalEntry, ProxyLifeRelease } from "../../generated/prisma/client.js";

type RecordWithRelations = LifeReleaseRecord & {
  user?: { publicId: string; displayName: string; email?: string } | null;
  animals?: ReleaseAnimalEntry[];
  proxyItems?: ProxyLifeRelease[];
};

export function mapRecordToItem(r: RecordWithRelations) {
  return {
    id: r.publicId,
    recordType: r.recordType,
    status: r.status,
    releaseDate: r.releaseDate,
    locationName: r.locationName,
    totalAnimals: (r.animals ?? []).reduce((sum, a) => sum + a.quantity, 0),
    user: r.user ? { id: r.user.publicId, name: r.user.displayName } : null,
    createdAt: r.createdAt,
  };
}

export function mapRecordToDetail(r: RecordWithRelations) {
  return {
    ...mapRecordToItem(r),
    locationCoords: r.locationCoords,
    merit: r.merit,
    notes: r.notes,
    animals: (r.animals ?? []).map((a) => ({
      species: a.species,
      quantity: a.quantity,
      isPredatory: a.isPredatory,
      sourceLocation: a.sourceLocation,
    })),
    proxyItems: (r.proxyItems ?? []).map((p) => ({
      beneficiary: p.beneficiary,
      merit: p.merit,
    })),
  };
}
