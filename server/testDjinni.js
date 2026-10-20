import https from 'https';

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'uk-UA,uk;q=0.9,en;q=0.8',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const djinniHtml = await fetchPage('https://djinni.co/jobs/?exp_level=no_exp');
  const matches = [...djinniHtml.matchAll(/href="(\/jobs\/[0-9]+-[^"]+)"[^>]*>([\s\S]*?)<\/a>/g)];
  console.log('Matches with /jobs/ID:', matches.length);
  matches.slice(0, 5).forEach(m => console.log(m[1], '-->', m[2].replace(/<[^>]+>/g, '').trim()));
}

run();
