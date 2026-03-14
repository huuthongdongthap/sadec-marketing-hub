/**
 * SEO Metadata Configuration
 * Centralized SEO metadata for all pages
 * Usage: import { getPageMetadata } from '@/lib/seo-metadata'
 */

export interface PageMetadata {
  title: string
  description: string
  keywords: string
  robots?: string
  ogType?: string
  canonical?: string
}

const BASE_URL = 'https://sadecmarketinghub.com'
const DEFAULT_ROBOTS = 'index, follow'
const NOINDEX_ROBOTS = 'noindex, follow'

/**
 * Metadata registry for all pages
 */
export const pageMetadata: Record<string, PageMetadata> = {
  // Admin Pages
  '/admin': {
    title: 'Admin Dashboard - SaĐéc Marketing Hub',
    description: 'Bảng điều khiển quản trị - Quản lý marketing, chiến dịch, leads và analytics toàn diện',
    keywords: 'admin dashboard, quản trị, marketing dashboard, analytics, Sa Đéc, quản lý chiến dịch',
    robots: NOINDEX_ROBOTS,
    ogType: 'website',
    canonical: `${BASE_URL}/admin`
  },
  '/admin/dashboard': {
    title: 'Dashboard - Admin | SaĐéc Marketing Hub',
    description: 'Tổng quan hiệu suất marketing, KPIs, và báo cáo thời gian thực',
    keywords: 'dashboard, KPI, marketing metrics, báo cáo, analytics',
    robots: NOINDEX_ROBOTS
  },
  '/admin/campaigns': {
    title: 'Chiến Dịch - Quản Lý Campaign | SaĐéc Marketing Hub',
    description: 'Quản lý và theo dõi tất cả chiến dịch marketing từ một nơi',
    keywords: 'campaigns, chiến dịch, marketing campaigns, quản lý',
    robots: NOINDEX_ROBOTS
  },
  '/admin/leads': {
    title: 'Leads - Quản Lý Khách Hàng Tiềm Năng | SaĐéc Marketing Hub',
    description: 'Theo dõi và quản lý leads, chuyển đổi khách hàng tiềm năng',
    keywords: 'leads, khách hàng tiềm năng, CRM, conversion',
    robots: NOINDEX_ROBOTS
  },
  '/admin/content': {
    title: 'Content Calendar - Lịch Nội Dung | SaĐéc Marketing Hub',
    description: 'Lên lịch và quản lý nội dung trên tất cả các kênh',
    keywords: 'content calendar, lịch nội dung, social media, planning',
    robots: NOINDEX_ROBOTS
  },

  // Portal Pages (Client)
  '/portal': {
    title: 'Client Portal - SaĐéc Marketing Hub',
    description: 'Cổng thông tin khách hàng - Theo dõi dự án, báo cáo và thanh toán',
    keywords: 'client portal, khách hàng, dự án, báo cáo, thanh toán',
    robots: NOINDEX_ROBOTS,
    canonical: `${BASE_URL}/portal`
  },
  '/portal/dashboard': {
    title: 'Dashboard - Khách Hàng | SaĐéc Marketing Hub',
    description: 'Bảng điều khiển khách hàng - Theo dõi chiến dịch, hiệu quả và báo cáo marketing',
    keywords: 'dashboard, khách hàng, chiến dịch, báo cáo, marketing',
    robots: NOINDEX_ROBOTS
  },
  '/portal/projects': {
    title: 'Dự Án - Client Portal | SaĐéc Marketing Hub',
    description: 'Theo dõi tiến độ và trạng thái các dự án marketing của bạn',
    keywords: 'dự án, projects, tiến độ, marketing projects',
    robots: NOINDEX_ROBOTS
  },
  '/portal/reports': {
    title: 'Báo Cáo - Reports | SaĐéc Marketing Hub',
    description: 'Báo cáo chi tiết về hiệu suất chiến dịch và ROI',
    keywords: 'báo cáo, reports, ROI, performance, analytics',
    robots: NOINDEX_ROBOTS
  },
  '/portal/payments': {
    title: 'Thanh Toán - Payments | SaĐéc Marketing Hub',
    description: 'Quản lý hóa đơn và thanh toán dịch vụ',
    keywords: 'thanh toán, payments, hóa đơn, invoices',
    robots: NOINDEX_ROBOTS
  },

  // Affiliate Pages
  '/affiliate': {
    title: 'Affiliate Program - SaĐéc Marketing Hub',
    description: 'Chương trình affiliate - Kiếm thu nhập thụ động bằng cách giới thiệu dịch vụ',
    keywords: 'affiliate, tiếp thị liên kết, hoa hồng, referrals, thu nhập thụ động',
    canonical: `${BASE_URL}/affiliate`
  },
  '/affiliate/dashboard': {
    title: 'Affiliate Dashboard - SaĐéc Marketing Hub',
    description: 'Bảng điều khiển affiliate - Theo dõi hoa hồng và referrals',
    keywords: 'affiliate dashboard, thống kê, doanh thu, hoa hồng',
    robots: NOINDEX_ROBOTS
  },
  '/affiliate/links': {
    title: 'Affiliate Links - Liên Kết Giới Thiệu | SaĐéc Marketing Hub',
    description: 'Quản lý và theo dõi hiệu suất các link affiliate',
    keywords: 'affiliate links, liên kết, tracking, performance',
    robots: NOINDEX_ROBOTS
  },
  '/affiliate/commissions': {
    title: 'Hoa Hồng - Commissions | SaĐéc Marketing Hub',
    description: 'Theo dõi hoa hồng và lịch sử thanh toán affiliate',
    keywords: 'hoa hồng, commissions, thanh toán, payments',
    robots: NOINDEX_ROBOTS
  },

  // Public Pages
  '/': {
    title: 'Mekong Agency - Digital Marketing cho Doanh Nghiệp Địa Phương',
    description: 'Giải pháp marketing số toàn diện cho SME vùng ĐBSCL. Tăng trưởng doanh thu, xây dựng thương hiệu với chi phí tiết kiệm.',
    keywords: 'Sa Đéc Marketing Hub, digital marketing, agency, SEO, quảng cáo, Sa Đéc, Đồng Tháp',
    robots: DEFAULT_ROBOTS,
    canonical: BASE_URL
  },
  '/auth/login': {
    title: 'Đăng Nhập - SaĐéc Marketing Hub',
    description: 'Đăng nhập vào hệ thống SaĐéc Marketing Hub - Quản trị marketing, leads, campaigns và analytics',
    keywords: 'login, đăng nhập, marketing hub, sa đéc, agency',
    robots: NOINDEX_ROBOTS
  },
  '/auth/register': {
    title: 'Đăng Ký - SaĐéc Marketing Hub',
    description: 'Đăng ký tài khoản SaĐéc Marketing Hub',
    keywords: 'register, đăng ký, tài khoản, signup',
    robots: NOINDEX_ROBOTS
  },
  '/pricing': {
    title: 'Bảng Giá - Pricing | SaĐéc Marketing Hub',
    description: 'Các gói dịch vụ marketing linh hoạt, phù hợp mọi ngân sách',
    keywords: 'bảng giá, pricing, gói dịch vụ, chi phí marketing',
    robots: DEFAULT_ROBOTS
  },
  '/contact': {
    title: 'Liên Hệ - Contact | SaĐéc Marketing Hub',
    description: 'Liên hệ tư vấn miễn phí về giải pháp marketing',
    keywords: 'liên hệ, contact, tư vấn, consultation',
    robots: DEFAULT_ROBOTS
  }
}

/**
 * Get metadata for a specific page
 * @param path - URL path (e.g., '/admin/dashboard')
 * @returns PageMetadata object
 */
export function getPageMetadata(path: string): PageMetadata {
  // Normalize path
  const normalizedPath = path.replace(/\/+$/, '') || '/'

  // Try exact match first
  if (pageMetadata[normalizedPath]) {
    return pageMetadata[normalizedPath]
  }

  // Try parent path (e.g., /admin/dashboard -> /admin)
  const parentPath = normalizedPath.split('/').slice(0, -1).join('/') || '/'
  if (pageMetadata[parentPath]) {
    return pageMetadata[parentPath]
  }

  // Default metadata
  return {
    title: 'SaĐéc Marketing Hub',
    description: 'Giải pháp marketing số toàn diện cho doanh nghiệp địa phương',
    keywords: 'marketing, digital agency, Sa Đéc, Mekong Delta',
    robots: DEFAULT_ROBOTS,
    canonical: `${BASE_URL}${normalizedPath}`
  }
}

/**
 * Generate JSON-LD structured data
 * @param metadata - Page metadata
 * @returns JSON-LD script content
 */
export function generateJsonLd(metadata: PageMetadata): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'MarketingAgency',
    'name': 'SaĐéc Marketing Hub',
    'description': metadata.description,
    'url': metadata.canonical || BASE_URL,
    'logo': {
      '@type': 'ImageObject',
      'url': `${BASE_URL}/favicon.png`,
      'width': 512,
      'height': 512
    },
    'telephone': '+84-915-997-989',
    'email': 'hello@sadecmarketinghub.com',
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Sa Đéc',
      'addressRegion': 'Đồng Tháp',
      'addressCountry': 'VN'
    },
    'areaServed': 'Mekong Delta',
    'priceRange': '$$'
  }, null, 2)
}

/**
 * React Helmet helper component usage example:
 *
 * import { getPageMetadata, generateJsonLd } from '@/lib/seo-metadata'
 *
 * function Page() {
 *   const metadata = getPageMetadata(location.pathname)
 *
 *   return (
 *     <>
 *       <Helmet>
 *         <title>{metadata.title}</title>
 *         <meta name="description" content={metadata.description} />
 *         <meta name="keywords" content={metadata.keywords} />
 *         {metadata.robots && <meta name="robots" content={metadata.robots} />}
 *         <link rel="canonical" href={metadata.canonical} />
 *
 *         {/* Open Graph */}
 *         <meta property="og:title" content={metadata.title} />
 *         <meta property="og:description" content={metadata.description} />
 *         <meta property="og:type" content={metadata.ogType || 'website'} />
 *         <meta property="og:url" content={metadata.canonical} />
 *         <meta property="og:image" content={`${BASE_URL}/og-image.png`} />
 *
 *         {/* Twitter Card */}
 *         <meta name="twitter:card" content="summary_large_image" />
 *         <meta name="twitter:title" content={metadata.title} />
 *         <meta name="twitter:description" content={metadata.description} />
 *         <meta name="twitter:image" content={`${BASE_URL}/og-image.png`} />
 *
 *         {/* JSON-LD */}
 *         <script type="application/ld+json" children={generateJsonLd(metadata)} />
 *       </Helmet>
 *       {/* Page content */}
 *     </>
 *   )
 * }
 */
