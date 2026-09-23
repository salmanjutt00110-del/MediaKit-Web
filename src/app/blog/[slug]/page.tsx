import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BLOG_ARTICLES, getArticleBySlug } from '@/lib/blog-data';
import styles from '../blog.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | MediaKit Blog',
      description: 'The requested guide could not be found.',
    };
  }

  const url = `https://mediakit.website/blog/${article.slug}`;

  return {
    title: `${article.metaTitle} | MediaKit`,
    description: article.metaDescription,
    keywords: [
      article.targetKeyword,
      'video downloader',
      'no watermark downloader',
      'free video download',
      'MediaKit guide',
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url,
      siteName: 'MediaKit',
      title: article.metaTitle,
      description: article.metaDescription,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle,
      description: article.metaDescription,
      images: ['/og-image.png'],
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const articleUrl = `https://mediakit.website/blog/${article.slug}`;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: article.title,
    description: article.metaDescription,
    image: 'https://mediakit.website/og-image.png',
    author: {
      '@type': 'Organization',
      name: article.author,
      url: 'https://mediakit.website',
    },
    publisher: {
      '@type': 'Organization',
      name: 'MediaKit',
      logo: {
        '@type': 'ImageObject',
        url: 'https://mediakit.website/logo.png',
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://mediakit.website',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://mediakit.website/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  const otherArticles = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/blog">Blog</Link>
        <span>/</span>
        <span>{article.category}</span>
      </nav>

      <div className={styles.articleLayout}>
        {/* Main Article Content */}
        <div className={styles.articleMain}>
          <header className={styles.articleHeader}>
            <span className={styles.cardCategory}>{article.category}</span>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <div className={styles.authorMeta}>
              <span>By {article.author}</span>
              <span>&bull;</span>
              <time dateTime={article.updatedAt}>Updated {article.updatedAt}</time>
              <span>&bull;</span>
              <span>{article.readingTime}</span>
            </div>
          </header>

          <article
            className={styles.prose}
            dangerouslySetInnerHTML={{ __html: article.contentHtml }}
          />

          {/* FAQ Accordion / List */}
          <section className={styles.faqSection} aria-labelledby="faq-heading">
            <h2 id="faq-heading" style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '24px' }}>
              Frequently Asked Questions
            </h2>
            {article.faqs.map((faq, idx) => (
              <div key={idx} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>{faq.question}</h3>
                <p className={styles.faqAnswer}>{faq.answer}</p>
              </div>
            ))}
          </section>
        </div>

        {/* Sticky Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.ctaCard}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⚡</div>
            <h3 className={styles.ctaTitle}>Try the Free Tool</h3>
            <p className={styles.ctaDesc}>
              No watermarks. No registrations. 100% free direct HD downloads in seconds.
            </p>
            <Link href={article.ctaUrl} className={styles.ctaBtn}>
              {article.ctaText}
            </Link>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-card)',
              borderRadius: '16px',
              padding: '24px',
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
              Related Guides
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {otherArticles.map((rel) => (
                <div key={rel.slug}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--brand-blue)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {rel.category}
                  </span>
                  <Link
                    href={`/blog/${rel.slug}`}
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      textDecoration: 'none',
                      marginTop: '4px',
                      lineHeight: '1.4',
                    }}
                  >
                    {rel.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
