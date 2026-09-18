async function testSnapSaveRaw() {
  const url = 'https://www.facebook.com/reel/1149722302831888';
  const formData = new URLSearchParams();
  formData.append('url', url);

  const res = await fetch('https://snapsave.app/action.php?lang=en', {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'content-type': 'application/x-www-form-urlencoded',
      'origin': 'https://snapsave.app',
      'referer': 'https://snapsave.app/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
    body: formData.toString()
  });

  const text = await res.text();
  console.log('Got response length:', text.length);

  // Let's inspect decode
  function decodeSnapApp(args) {
    const [h, u, n, t, e, r] = args;
    const tNum = Number(t);
    const eNum = Number(e);

    function decode(d, eVal, fVal) {
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

  function getEncodedSnapApp(data) {
    const part = data.split('decodeURIComponent(escape(r))}(')[1];
    if (!part) return [];
    const inside = part.split('))')[0];
    if (!inside) return [];
    return inside.split(',').map((v) => v.replace(/"/g, '').trim());
  }

  const encoded = getEncodedSnapApp(text);
  console.log('Encoded args count:', encoded.length);
  if (encoded.length >= 6) {
    const decoded = decodeSnapApp(encoded);
    console.log('Decoded JS length:', decoded.length);
    console.log('Decoded sample:', decoded.slice(0, 300));
  }
}

testSnapSaveRaw();
