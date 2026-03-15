import { getStrapiMediaUrl, strapiFetch } from '@/lib/strapi'
import type { GalleryItem, StrapiList } from '@/types/strapi'

export interface GalleryCardItem {
  id: number
  documentId: string
  slug: string
  title: string
  description: string | null
  quote: string | null
  category: string
  album: string | null
  location: string | null
  device: string | null
  photographer: string | null
  shotDate: string | null
  featured: boolean
  sortOrder: number
  tags: string[]
  imageUrl: string
  imageAlt: string
  width: number | null
  height: number | null
}

export const GALLERY_CATEGORIES = [
  'Tất cả',
  'Hoa Sen',
  'Kiến Trúc',
  'Nghi Lễ',
  'Pháp Hội',
  'Thiền Định',
  'Thiên Nhiên',
  'Kinh Sách',
  'Phật Tượng',
  'Khác',
] as const

function parseKeywords(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toGalleryCardItem(item: GalleryItem): GalleryCardItem | null {
  const imageUrl = getStrapiMediaUrl(item.image?.url)
  if (!imageUrl) return null

  return {
    id: item.id,
    documentId: item.documentId,
    slug: item.slug,
    title: item.title,
    description: item.description,
    quote: item.quote,
    category: item.category,
    album: item.album,
    location: item.location,
    device: item.device,
    photographer: item.photographer,
    shotDate: item.shotDate,
    featured: item.featured,
    sortOrder: item.sortOrder,
    tags: parseKeywords(item.keywords),
    imageUrl,
    imageAlt: item.image?.alternativeText || item.title,
    width: item.image?.width ?? null,
    height: item.image?.height ?? null,
  }
}

export async function fetchGalleryItems(): Promise<GalleryCardItem[]> {
  const response = await strapiFetch<StrapiList<GalleryItem>>('/gallery-items', {
    status: 'published',
    sort: ['featured:desc', 'sortOrder:asc', 'shotDate:desc', 'publishedAt:desc'],
    populate: ['image'],
    pagination: { pageSize: 100 },
    next: { revalidate: 3600, tags: ['gallery'] },
  })

  return (response.data ?? [])
    .map(toGalleryCardItem)
    .filter((item): item is GalleryCardItem => item !== null)
}

export const FALLBACK_GALLERY_ITEMS: GalleryCardItem[] = [
  {
    id: 1,
    documentId: 'demo-lotus',
    slug: 'gan-bun-khong-hoi',
    title: 'Gần Bùn Không Hôi',
    description: 'Khoảnh khắc hoa sen vươn lên trên mặt nước tĩnh, gợi nhắc sự thanh tịnh giữa đời sống nhiều biến động.',
    quote: 'Trong bùn lầy hoa sen vẫn tỏa ngát, cũng như tâm hồn con người giữa cõi trần ai vẫn giữ được sự thanh tịnh nguyên bản.',
    category: 'Hoa Sen',
    album: 'Dấu Ấn Sen Việt',
    location: 'Chùa Trấn Quốc',
    device: 'Canon EOS R5',
    photographer: 'Ban Truyền Thông PMTL',
    shotDate: '2024-02-15',
    featured: true,
    sortOrder: 0,
    tags: ['hoa sen', 'thanh tịnh', 'chùa cổ'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO9OkwTtezOWxPyAxkhw_DrsWcuUX-GHohRPvcgL-JPRYVGBjuyaCpuyW9OnUGCvR3_Lsmc4z3WQO48mCSvqxdGR7KTZYKaJT9Cu6K3YxnWaOiUWXEilLASIxBcKaggWDB2tlRBeQuP95NohRp_wvkvHnu58Hd7st3t289Zsg1RnM9Vxen2ns5qd6TzTJiZ_tEFsRxQ7_nZs42-r8C7Ju-gXV1JXEIKOGL2KPtZe_Ok-euZnT8X46LF6jWS5G2oq-Yv0gpXLMt2SI',
    imageAlt: 'Hoa sen hồng nở trên nền lá xanh',
    width: 1200,
    height: 1500,
  },
  {
    id: 2,
    documentId: 'demo-architecture',
    slug: 'kien-truc-co-tu',
    title: 'Kiến Trúc Cổ Tự',
    description: 'Đường nét mái chùa và không gian hành lang cổ mang lại cảm giác an tĩnh, trang nghiêm và bền bỉ với thời gian.',
    quote: 'Mỗi mái ngói cong là một lời nhắc về sự bền tâm trong hành trình tu học.',
    category: 'Kiến Trúc',
    album: 'Nếp Chùa Việt',
    location: 'Chùa cổ miền Bắc',
    device: 'Sony A7 IV',
    photographer: 'Ban Truyền Thông PMTL',
    shotDate: '2024-01-08',
    featured: true,
    sortOrder: 1,
    tags: ['kiến trúc', 'cổ tự', 'hành lang'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjsc22mEKuA9yPqGXV-VkTzz2rwYGEcp7gVqDxcHKvuWa_GUwoI1kWffgHVjel9YwlGBG7oJIiuB76bM_vMQH3PVU4-oYiAw8WDswlhtUZCBQwM8B1O05oCarsWosLXp3Yp5CRL1SazzMZ0BF0PegJ_iMbRJeYBMBJeotOoCfl_f-GGzxnPUUH56EMFNwDSEJhgU9yHt835fVSVvnEEOdFQYZMeTua-PgxMJWtukhjKJz_9fvmO_e-P18ksiYq9GFAgy2EbNiw6Gw',
    imageAlt: 'Kiến trúc mái chùa cổ dưới nắng chiều',
    width: 1200,
    height: 1200,
  },
  {
    id: 3,
    documentId: 'demo-incense',
    slug: 'nen-tam-huong',
    title: 'Nén Tâm Hương',
    description: 'Khói hương mỏng quyện vào không gian như nhịp thở chậm, đưa tâm người về sự lắng dịu.',
    quote: 'Một nén hương chánh niệm đôi khi đủ mở ra cả một buổi hành trì sâu lắng.',
    category: 'Nghi Lễ',
    album: 'Khoảnh Khắc Hành Trì',
    location: 'Điện Phật PMTL',
    device: 'Fujifilm X-T5',
    photographer: 'Ban Truyền Thông PMTL',
    shotDate: '2024-02-25',
    featured: false,
    sortOrder: 2,
    tags: ['nghi lễ', 'khói hương', 'trầm mặc'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmzfzqk4dIgkqvLSg4lQLBFPhL0BhNMJwC3GPNg_tm0zJ4G4q4iCWlojvsZIze9UsUikWf2bL5H7B9R5iW9BXZTCbiLTZiI_mbemwnlobilOwd2_qBmwFI5EH1OlqAuJ_YLgePhMvDMu0R7kqDqONHKZD0LpGSnInApsoYocLd5TKaYKa-Rro9QDRD03saeD_WZH0e2zgvII1y2VFeYZUrYFDEo6Remmb_0A8k-IWAsPjGgdY96dSakyRna-YS20pBRWzYrSdw-gw',
    imageAlt: 'Những nén nhang đỏ trong nghi lễ',
    width: 1200,
    height: 1500,
  },
  {
    id: 4,
    documentId: 'demo-sunrise',
    slug: 'binh-minh-yen-a',
    title: 'Bình Minh Yên Ả',
    description: 'Ánh sáng đầu ngày phủ lên mái chùa, mở ra cảm giác khởi đầu thanh sạch và đầy hy vọng.',
    quote: 'Bình minh nơi cửa Phật luôn bắt đầu bằng sự nhẹ nhàng.',
    category: 'Thiên Nhiên',
    album: 'Nếp Chùa Việt',
    location: 'Miền Trung Việt Nam',
    device: 'Nikon Z6 II',
    photographer: 'Ban Truyền Thông PMTL',
    shotDate: '2024-02-02',
    featured: true,
    sortOrder: 3,
    tags: ['bình minh', 'mái chùa', 'ánh sáng'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzZlu62DGnkVrhPVFGwpmOLksp5dtu-vEiWM53KtrqvvDRNcLPYh3egtvtt6h7s8a4GVTD0HTkTggqdp4ZHIOdPPBuJKfNSSCQfb8JrvlHjH8X3qWD7ckZhBpqacaBXh2odKLI00OxO79z8511bKHVsRFSE8JWPKWTfVBjwJWdc6N9UXAPn7c6IArTsBBppsRNczXpdMBUjbl6T_KJNzBheABiTddS7JVbStdsxBfZS3pYjOFTYbDcpmx9j3J0YdHdRY3yF-KY99M',
    imageAlt: 'Bình minh sau lưng những mái chùa cổ',
    width: 1200,
    height: 1500,
  },
  {
    id: 5,
    documentId: 'demo-books',
    slug: 'tri-tue-ngan-nam',
    title: 'Trí Tuệ Ngàn Năm',
    description: 'Kinh sách và thư tịch xưa mang theo chiều sâu của pháp học, được gìn giữ như một kho báu sống.',
    quote: 'Mỗi trang kinh là một nhịp cầu nối người đọc với trí tuệ vượt thời gian.',
    category: 'Kinh Sách',
    album: 'Tàng Kinh Các',
    location: 'Tủ sách PMTL',
    device: 'Canon EOS RP',
    photographer: 'Ban Truyền Thông PMTL',
    shotDate: '2024-01-20',
    featured: false,
    sortOrder: 4,
    tags: ['kinh sách', 'thư tịch', 'pháp học'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcmq8x4Y5104tbhUkKGKY5p_yOp-oAGMYwt2fxeFARut15ji0NQkHF3Zhx-fJUXiegoBSsOfq0mZC9HK25TrnBrwSwGM_l-f8iJ7rA9o2lTSA_SPgG5KxxGYlyoes0DqUGLJY7TAJGuivaXlzF6lwv_teXdPEjjjp47_oGi5e589Br_vysf4BdpajyCDgvKg3f_caFn_A8UmDlbixZDvud5eoLdqWbN8YoaYx4ad4wgqkqyVqEGCFkbeMqR_nHQqPAgMQnziYE1fo',
    imageAlt: 'Kinh sách cổ xếp chồng trên bàn gỗ',
    width: 1200,
    height: 1500,
  },
  {
    id: 6,
    documentId: 'demo-statue',
    slug: 'tuong-phat-da',
    title: 'Tượng Phật Đá',
    description: 'Bề mặt tượng phủ rêu thời gian, tạo nên cảm giác trầm mặc và sâu lắng giữa thiên nhiên.',
    quote: 'Sự tĩnh lặng của pho tượng làm hiện rõ sự chuyển động trong lòng người.',
    category: 'Phật Tượng',
    album: 'Dấu Ấn Tôn Tượng',
    location: 'Vườn thiền',
    device: 'Leica Q3',
    photographer: 'Ban Truyền Thông PMTL',
    shotDate: '2024-01-05',
    featured: false,
    sortOrder: 5,
    tags: ['tượng Phật', 'đá', 'rêu phong'],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpP3J9QJjoHnAIVrlw8-NtXny90lOq4AcJpMXa7IMPcO0mt1rl5dL_4LRcILGbDuYqtPweIcwewjG35a1mRp53g7KOm7-FPs_TMTU3WeDg93GPGluTQGqXXZcinusuDytP9cqHt6O5yABpDEWu6ePZxijhievlx_XS4MJNt8zYY9nQGBLakowhJ0dI8Qt8DaDO1EQLKQZuzVtx_A4AdNKUPIcfEDxYq0qgvxdyc33e-m_6tViZLajmiqLwI_imqku9f1sGE1r3mI0',
    imageAlt: 'Cận cảnh tượng Phật đá phủ rêu xanh',
    width: 1200,
    height: 1500,
  },
]
