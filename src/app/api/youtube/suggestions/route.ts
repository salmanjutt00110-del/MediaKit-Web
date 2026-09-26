import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

// Curated high-relevance topics & creator patterns to match legitimate discovery
const CURATED_SUGGESTIONS: string[] = [
  'Perza Qadri',
  'Perza Qadri Naat',
  'Perza Qadri Bayan',
  'Perza Qadri latest',
  'Perza Qadri new Naat',
  'Perza Qadri short bayan',
  'Peer Ajmal Raza Qadri',
  'Peer Ajmal Raza Qadri Bayan',
  'Naat',
  'Naat Sharif',
  'Best Naat 2026',
  'Beautiful Naat Recitation',
  'Bayan',
  'Islamic Bayan',
  'Tariq Jamil Bayan',
  'Saqib Raza Mustafai Bayan',
  'Quran Recitation',
  'Surah Rahman Recitation',
  'Surah Yaseen Recitation',
  'Islamic Lecture',
  'Mufti Menk Lecture',
  'Nouman Ali Khan Lecture',
  'Podcast',
  'Tech Podcast',
  'The Joe Rogan Experience Podcast',
  'Tech Tutorial',
  'Next.js 15 Tutorial',
  'React Full Course',
  'Python for Beginners',
  'Web Development Tutorial',
  'Lofi Hip Hop Beats to Relax',
  'Deep Work Ambient Music',
  'Nature 4K Relaxation Video',
  'Documentary Full HD',
  'Shorts Trending',
];

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request.headers);
    const rateCheck = checkRateLimit(`yt-sugg:${clientId}`, { limit: 120, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json({ success: true, suggestions: [] });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();

    if (!q || q.length < 2) {
      // Return popular trending topics when input is minimal
      return NextResponse.json({
        success: true,
        query: q,
        suggestions: [
          'Perza Qadri',
          'Naat',
          'Bayan',
          'Quran Recitation',
          'Islamic Lecture',
          'Podcast',
          'Tech Tutorial',
        ],
      });
    }

    const lowerQ = q.toLowerCase();
    const suggestionsSet = new Set<string>();

    // 1. Curated suggestions that start with or include the user's query
    const curatedMatches = CURATED_SUGGESTIONS.filter((item) =>
      item.toLowerCase().includes(lowerQ)
    );
    for (const item of curatedMatches) {
      suggestionsSet.add(item);
    }

    // Dynamic creator expansion if query contains 'perza' or 'qadri'
    if (lowerQ.includes('perza') || lowerQ.includes('qadri')) {
      [
        'Perza Qadri',
        'Perza Qadri Naat',
        'Perza Qadri Bayan',
        'Perza Qadri latest',
        'Perza Qadri new Naat',
        'Perza Qadri status',
      ].forEach((s) => suggestionsSet.add(s));
    }

    // 2. Query safe public YouTube suggest endpoint
    try {
      const suggestUrl = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(
        q
      )}`;
      const res = await fetch(suggestUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && Array.isArray(json[1])) {
          for (const s of json[1]) {
            if (typeof s === 'string' && s.trim()) {
              suggestionsSet.add(s.trim());
            }
          }
        }
      }
    } catch {}

    const list = Array.from(suggestionsSet).slice(0, 10);

    return NextResponse.json({
      success: true,
      query: q,
      suggestions: list,
    });
  } catch {
    return NextResponse.json({
      success: true,
      query: '',
      suggestions: [],
    });
  }
}
