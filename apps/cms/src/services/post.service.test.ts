import { describe, expect, it } from 'vitest'

import { buildPostData, validatePostTypeConstraints } from '@/services/post.service'

describe('post.service', () => {
  it('builds normalized post data with derived fields', () => {
    const result = buildPostData({
      title: '  Bài Viết Khai Thị  ',
      sourceRef: '  Ref-01  ',
      content: 'Nam mo A Di Da Phat',
      source: {
        sourceName: '  PMTL  ',
      },
      postFlags: {
        featured: 1 as unknown as boolean,
      },
      views: -4,
      likes: 2.8,
      _status: 'published',
    })

    expect(result.publicId).toMatch(/^pst_/)
    expect(result.title).toBe('Bài Viết Khai Thị')
    expect(result.sourceRef).toBe('Ref-01')
    expect(result.slug).toBe('bai-viet-khai-thi')
    expect(result.excerptComputed).toBe('Nam mo A Di Da Phat')
    expect(result.contentPlainText).toBe('Nam mo A Di Da Phat')
    expect(result.normalizedSearchText).toContain('bai viet khai thi')
    expect(result.postFlags).toEqual({
      featured: true,
      allowComments: true,
    })
    expect(result.views).toBe(0)
    expect(result.likes).toBe(2)
    expect(result.publishedAt).toBeTruthy()
  })

  it('rejects source-note posts without sourceRef', () => {
    expect(() =>
      validatePostTypeConstraints({
        postType: 'source-note',
        sourceRef: '',
      }),
    ).toThrow('Source note requires sourceRef.')
  })
})
