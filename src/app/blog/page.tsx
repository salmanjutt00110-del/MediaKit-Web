import type { Metadata } from 'next';
import Link from 'next/link';
import { BLOG_ARTICLES } from '@/lib/blog-data';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: 'Blog — Video Download Guides & Tutorials | MediaKit',
  description:
    'Learn how to download videos from YouTube, TikTok, Instagram, Facebook & Pinterest. Free guides and tutorials by MediaKit.',
  alternates: {
    canonical: 'https://mediakit.website/blog',
  },
  openGraph: {
    title: 'Blog — Video Download Guides & Tutorials | MediaKit',
    description:
      'Learn how to download videos from YouTube, TikTok, Instagram, Facebook & Pinterest. Free guides and tutorials by MediaKit.',
    url: 'https://mediakit.website/blog',
  },
};

export default function BlogListingPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'MediaKit Guides & Video Download Tutorials',
    description: 'Master list of expert tutorials on video downloading, audio conversion, and format optimization.',
    itemListElement: BLOG_ARTICLES.map((article, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: article.title,
      url: `https://mediakit.website/blog/${article.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <section className={styles.blogHero}>
        <div className={styles.badge}>
          <span>📖</span>
          <span>MediaKit Knowledge Base</span>
        </div>
        <h1 className={styles.heroTitle}>
          Video Download <span className={styles.highlight}>Guides &amp; Tutorials</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Step-by-step walkthroughs, technical deep dives, and expert tutorials on saving
          uncompressed HD videos, removing platform watermarks, and extracting 320kbps MP3s.
        </p>
      </section>

      <div className={styles.categoryBar} role="navigation" aria-label="Blog Categories">
        <span className={`${styles.categoryPill} ${styles.categoryPillActive}`}>All Guides</span>
        <span className={styles.categoryPill}>TikTok</span>
        <span className={styles.categoryPill}>YouTube</span>
        <span className={styles.categoryPill}>Instagram</span>
        <span className={styles.categoryPill}>Facebook</span>
        <span className={styles.categoryPill}>Comparison</span>
      </div>

      <div className={styles.articlesGrid}>
        {BLOG_ARTICLES.map((article) => (
          <article key={article.slug} className={styles.card}>
            <Link
              href={`/blog/${article.slug}`}
              className={styles.cardCategory}
              tabIndex={-1}
            >
              {article.category}
            </Link>
            <h2 className={styles.cardTitle}>
              <Link href={`/blog/${article.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {article.title}
              </Link>
            </h2>
            <p className={styles.cardSummary}>{article.summary}</p>
            <div className={styles.cardMeta}>
              <span>{article.readingTime}</span>
              <Link href={`/blog/${article.slug}`} className={styles.readMoreLink}>
                Read Guide <span>&rarr;</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
