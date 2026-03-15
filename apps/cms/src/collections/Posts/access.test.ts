import { describe, expect, it } from 'vitest'

import { postAccess } from '@/collections/Posts/access'

describe('Posts access control', () => {
  it('allows guests to read only published posts', () => {
    const result = postAccess.read({ req: { user: null } })

    expect(result).toEqual({
      or: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          _status: {
            exists: false,
          },
        },
      ],
    })
  })

  it('allows editors to create posts and denies members', () => {
    expect(postAccess.create({ req: { user: { role: 'editor' } } })).toBe(true)
    expect(postAccess.create({ req: { user: { role: 'member' } } })).toBe(false)
  })
})
