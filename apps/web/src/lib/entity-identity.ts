type EntityIdentityLike = {
  uuid?: string | null
  documentId?: string | null
  slug?: string | null
  id?: string | number | null
}

export function getEntityStableKey(entity: EntityIdentityLike | null | undefined): string {
  if (!entity) return ''

  const uuid = entity.uuid?.trim()
  if (uuid) return uuid

  const documentId = entity.documentId?.trim()
  if (documentId) return documentId

  const slug = entity.slug?.trim()
  if (slug) return slug

  if (entity.id !== undefined && entity.id !== null) return String(entity.id)

  return ''
}
