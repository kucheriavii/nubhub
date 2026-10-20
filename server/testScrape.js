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
  console.log('Djinni length:', djinniHtml.length);
  const titles = [...djinniHtml.matchAll(/<a[^>]+class="[^"]*job-item__title-link[^"]*"[^>]*>([\s\S]*?)<\/a>/g)].map(m => m[1].trim());
  console.log('Djinni titles count:', titles.length);
  if (titles.length) console.log('Sample Djinni titles:', titles.slice(0, 5));

  const douHtml = await fetchPage('https://jobs.dou.ua/vacancies/?exp=0-1');
  console.log('DOU length:', douHtml.length);
  const douTitles = [...douHtml.matchAll(/<a[^>]+class="vt"[^>]*>([\s\S]*?)<\/a>/g)].map(m => m[1].trim());
  console.log('DOU titles count:', douTitles.length);
  if (douTitles.length) console.log('Sample DOU titles:', douTitles.slice(0, 5));
}

run();
