import React from 'react'
import { getPageMetadata, generateJsonLd } from '@/lib/seo-metadata'

export interface SEOHeadProps {
  path?: string
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  robots?: string
  ogImage?: string
}

/**
 * SEO Head Component
 *
 * Usage:
 * 1. Auto mode (recommended): Pass only path
 *    <SEOHead path="/admin/dashboard" />
 *
 * 2. Custom mode: Override individual fields
 *    <SEOHead
 *      path="/custom-page"
 *      title="Custom Title"
 *      description="Custom description"
 *    />
 */
export const SEOHead: React.FC<SEOHeadProps> = ({
  path = '/',
  title,
  description,
  keywords,
  canonical,
  robots,
  ogImage = 'https://sadecmarketinghub.com/og-image.png'
}) => {
  const metadata = getPageMetadata(path)

  // Use provided values or fallback to metadata
  const finalTitle = title || metadata.title
  const finalDescription = description || metadata.description
  const finalKeywords = keywords || metadata.keywords
  const finalRobots = robots || metadata.robots || 'index, follow'
  const finalCanonical = canonical || metadata.canonical || `https://sadecmarketinghub.com${path}`

  const jsonLd = generateJsonLd(metadata)

  return (
    <>
      {/* Basic SEO */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={finalRobots} />
      <meta name="author" content="SaĐéc Marketing Hub" />
      <meta name="theme-color" content="#3b82f6" />

      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={metadata.ogType || 'website'} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={finalCanonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="SaĐéc Marketing Hub" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:creator" content="@sadecmarketinghub" />

      {/* Favicon */}
      <link rel="icon" type="image/png" href="/favicon.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
    </>
  )
}

/**
 * Document Head Component (for index.html template)
 * Includes preconnect hints and performance optimizations
 */
export const DocumentHead: React.FC<{
  children?: React.ReactNode
  preconnectUrls?: string[]
}> = ({ children, preconnectUrls }) => {
  const defaultPreconnect = [
    'https://pzcgvfhppglzfjavxuid.supabase.co',
    'https://cdn.jsdelivr.net',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]

  const urls = preconnectUrls || defaultPreconnect

  return (
    <>
      {/* Performance: Preconnect hints */}
      {urls.map((url) => (
        <link
          key={url}
          rel="preconnect"
          href={url}
          crossOrigin={url.includes('supabase') || url.includes('jsdelivr') ? 'anonymous' : undefined}
        />
      ))}

      {/* DNS Prefetch for external resources */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      <link rel="dns-prefetch" href="https://esm.run" />

      {/* Charset and Viewport */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {children}
    </>
  )
}

export default SEOHead
