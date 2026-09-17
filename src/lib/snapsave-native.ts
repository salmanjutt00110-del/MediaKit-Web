import { logger } from './logger';

function decodeSnapApp(args: string[]): string {
  const [h, u, n, t, e, r] = args;
  const tNum = Number(t);
  const eNum = Number(e);

  function decode(d: string, eVal: number, fVal: number) {
    const g = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'.split('');
    const hArr = g.slice(0, eVal);
    const iArr = g.slice(0, fVal);
    let j = d.split('').reverse().reduce((a, b, c) => {
      const idx = hArr.indexOf(b);
      if (idx !== -1) return a + idx * Math.pow(eVal, c);
      return a;
    }, 0);
    let k = '';
    while (j > 0) {
      k = iArr[j % fVal] + k;
      j = Math.floor(j / fVal);
    }
    return k || '0';
  }

  let result = '';
  for (let i = 0, len = h.length; i < len;) {
    let s = '';
    while (i < len && h[i] !== n[eNum]) {
      s += h[i];
      i++;
    }
    i++;
    for (let j = 0; j < n.length; j++) {
      s = s.replace(new RegExp(n[j], 'g'), j.toString());
    }
    result += String.fromCharCode(Number(decode(s, eNum, 10)) - tNum);
  }

  try {
    const bytes = new Uint8Array(result.split('').map((char) => char.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return result;
  }
}

function getEncodedSnapApp(data: string): string[] {
  const part = data.split('decodeURIComponent(escape(r))}(')[1];
  if (!part) return [];
  const inside = part.split('))')[0];
  if (!inside) return [];
  return inside.split(',').map((v) => v.replace(/"/g, '').trim());
}

function getDecodedSnapSave(data: string): string {
  const errMatch = data.match(/document\.querySelector\("#alert"\)\.innerHTML\s*=\s*"([^"]+)"/);
  if (errMatch && errMatch[1]) {
    throw new Error(errMatch[1]);
  }
  const split1 = data.split('getElementById("download-section").innerHTML = "')[1];
  if (!split1) return '';
  const split2 = split1.split('"; document.getElementById("inputData").remove();')[0];
  if (!split2) return '';
  return split2.replace(/\\(\\)?/g, '');
}

export interface SnapMediaItem {
  resolution?: string;
  thumbnail?: string;
  url: string;
}

export async function extractSnapSave(url: string): Promise<SnapMediaItem[] | null> {
  try {
    const formData = new URLSearchParams();
    formData.append('url', url);

    const res = await fetch('https://snapsave.app/action.php?lang=en', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'content-type': 'application/x-www-form-urlencoded',
        'origin': 'https://snapsave.app',
        'referer': 'https://snapsave.app/',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      body: formData.toString(),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const text = await res.text();
    const encoded = getEncodedSnapApp(text);
    if (!encoded || encoded.length < 6) return null;

    const decodedJs = decodeSnapApp(encoded);
    const html = getDecodedSnapSave(decodedJs);
    if (!html) return null;

    const items: SnapMediaItem[] = [];

    // Extract thumbnail
    const thumbMatch = html.match(/<article[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/i) ||
                       html.match(/<img[^>]+src="([^"]+)"/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : undefined;

    // Extract table rows for video links
    const trMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const tr of trMatches) {
      const rowHtml = tr[1];
      const resMatch = rowHtml.match(/class="video-quality"[^>]*>([^<]+)/i) ||
                       rowHtml.match(/<td[^>]*>([^<]+)<\/td>/i);
      const urlMatch = rowHtml.match(/href="([^"]+)"[^>]*class="[^"]*download-file/i) ||
                       rowHtml.match(/href="([^"]+)"[^>]*class="[^"]*btn/i) ||
                       rowHtml.match(/href="([^"]+)"/i);

      if (urlMatch && urlMatch[1] && urlMatch[1].startsWith('http')) {
        items.push({
          resolution: resMatch ? resMatch[1].trim() : '720p HD',
          thumbnail,
          url: urlMatch[1],
        });
      }
    }

    // Fallback if no table rows (e.g. single button)
    if (items.length === 0) {
      const singleBtn = html.match(/href="([^"]+)"[^>]*class="[^"]*btn/i) ||
                        html.match(/href="([^"]+)"/i);
      if (singleBtn && singleBtn[1] && singleBtn[1].startsWith('http')) {
        items.push({
          resolution: '720p (HD)',
          thumbnail,
          url: singleBtn[1],
        });
      }
    }

    return items.length > 0 ? items : null;
  } catch (err: any) {
    logger.warn('extractSnapSave error', { url: url.slice(0, 50), msg: err.message });
    return null;
  }
}
