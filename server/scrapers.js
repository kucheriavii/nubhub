import https from 'https';

export function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        },
      },
      (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : new URL(res.headers.location, url).href;
          return resolve(fetchHtml(redirectUrl));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    ).on('error', reject);
  });
}

// Функція для визначення скілів з тексту вакансії
export function extractSkillsFromText(text, allSkills = []) {
  const lower = text.toLowerCase();
  const matched = [];

  const patterns = {
    sql: /\bsql\b/i,
    postgresql: /\b(postgres|postgresql|psql)\b/i,
    mysql: /\bmysql\b/i,
    mongodb: /\b(mongo|mongodb)\b/i,
    javascript: /\b(javascript|js|ecmascript)\b/i,
    typescript: /\b(typescript|ts)\b/i,
    python: /\bpython\b/i,
    csharp: /\b(c#|\.net|csharp|dotnet)\b/i,
    react: /\b(react|react\.js|reactjs)\b/i,
    'fastapi-django': /\b(fastapi|django|flask)\b/i,
    vue: /\b(vue|vue\.js|vuejs|nuxt)\b/i,
    'html-css': /\b(html|css|html5|css3|sass|scss)\b/i,
    tailwind: /\b(tailwind|tailwindcss)\b/i,
    git: /\b(git|github|gitlab)\b/i,
    'rest-api': /\b(rest|restful|api|postman|swagger)\b/i,
    docker: /\b(docker|docker-compose|container)\b/i,
    'excel-bi': /\b(excel|power\s*bi|tableau|bi\b)/i,
    'qa-theory': /\b(test\s*case|bug\s*report|jira|qa\b|manual\s*qa|тестування|тест-кейс)/i,
  };

  allSkills.forEach((s) => {
    const customRegex = patterns[s.id] || new RegExp(`\\b${s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (customRegex.test(lower)) {
      matched.push(s.id);
    }
  });

  return Array.from(new Set(matched));
}

// Парсер Djinni
export async function scrapeDjinni(keyword = '', exp = 'no_exp', allSkills = []) {
  try {
    const url = `https://djinni.co/jobs/?${keyword ? `primary_keyword=${encodeURIComponent(keyword)}&` : ''}exp_level=${exp}`;
    const html = await fetchHtml(url);
    const vacancies = [];

    // Шукаємо блоки вакансій на Djinni
    const itemRegex = /<li[^>]*class="[^"]*list-jobs__item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    let match;

    while ((match = itemRegex.exec(html)) !== null) {
      const block = match[1];

      const linkMatch = block.match(/href="(\/jobs\/[0-9]+-[^"]+)"/i);
      const titleMatch = block.match(/class="[^"]*job-item__title-link[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ||
                         block.match(/href="\/jobs\/[0-9]+-[^"]*"[^>]*>([\s\S]*?)<\/a>/i);

      if (!linkMatch || !titleMatch) continue;

      const urlPath = linkMatch[1];
      const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();

      const companyMatch = block.match(/class="[^"]*job-item__company[^"]*"[^>]*>([\s\S]*?)<\/a>/i) ||
                           block.match(/<a[^>]*href="\/jobs\/company-[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
      const company = companyMatch ? companyMatch[1].replace(/<[^>]+>/g, '').trim() : 'IT Company';

      const salaryMatch = block.match(/(до\s*\$[0-9]+|\$[0-9]+\s*[-–]\s*\$[0-9]+|\$[0-9]+\+)/i);
      const salary = salaryMatch ? salaryMatch[1].trim() : 'За домовленістю';

      const descMatch = block.match(/class="[^"]*job-item__description[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        block.match(/class="[^"]*text-card[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      const summary = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) : title;

      const fullText = `${title} ${summary} ${block}`;
      const foundSkills = extractSkillsFromText(fullText, allSkills);

      // Визначаємо напрямок
      let direction = 'General IT';
      if (/front|react|vue|angular|html|css|web/i.test(title)) direction = 'Frontend';
      else if (/python|back|node|c#|\.net|java|php/i.test(title)) direction = 'Backend';
      else if (/qa|test|quality/i.test(title)) direction = 'QA / Testing';
      else if (/data|analyst|bi\b|sql/i.test(title)) direction = 'Data Analytics';

      vacancies.push({
        id: `djinni-${urlPath.replace(/\D/g, '') || Math.random().toString(36).substr(2, 9)}`,
        title,
        company,
        platform: 'Djinni',
        salary,
        location: 'Remote / Україна',
        direction,
        postedAgo: 'Свіжа з Djinni',
        url: `https://djinni.co${urlPath}`,
        requiredSkills: foundSkills.length > 0 ? foundSkills : ['git'],
        optionalSkills: [],
        summary: summary || `Вакансія ${title} від компанії ${company} на Djinni.`,
      });
    }

    return vacancies;
  } catch (err) {
    console.error('Error scraping Djinni:', err.message);
    return [];
  }
}

// Парсер DOU (jobs.dou.ua)
export async function scrapeDOU(category = '', exp = '0-1', allSkills = []) {
  try {
    const url = `https://jobs.dou.ua/vacancies/?${category ? `category=${encodeURIComponent(category)}&` : ''}exp=${exp}`;
    const html = await fetchHtml(url);
    const vacancies = [];

    const itemRegex = /<li[^>]*class="[^"]*l-vacancy[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    let match;

    while ((match = itemRegex.exec(html)) !== null) {
      const block = match[1];

      const linkMatch = block.match(/<a[^>]+class="vt"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      if (!linkMatch) continue;

      const jobUrl = linkMatch[1];
      const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();

      const compMatch = block.match(/<a[^>]+class="company"[^>]*>([\s\S]*?)<\/a>/i);
      const company = compMatch ? compMatch[1].replace(/<[^>]+>/g, '').trim() : 'IT Company';

      const salaryMatch = block.match(/<span[^>]+class="salary"[^>]*>([\s\S]*?)<\/span>/i);
      const salary = salaryMatch ? salaryMatch[1].replace(/<[^>]+>/g, '').trim() : 'Не вказана';

      const citiesMatch = block.match(/<span[^>]+class="cities"[^>]*>([\s\S]*?)<\/span>/i);
      const location = citiesMatch ? citiesMatch[1].replace(/<[^>]+>/g, '').trim() : 'Віддалено / Україна';

      const descMatch = block.match(/<div[^>]+class="sh-info"[^>]*>([\s\S]*?)<\/div>/i);
      const summary = descMatch ? descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : title;

      const fullText = `${title} ${summary} ${category}`;
      const foundSkills = extractSkillsFromText(fullText, allSkills);

      let direction = 'General IT';
      if (/front|react|vue|angular|html/i.test(title + ' ' + category)) direction = 'Frontend';
      else if (/back|python|node|c#|\.net|java|php/i.test(title + ' ' + category)) direction = 'Backend';
      else if (/qa|test/i.test(title + ' ' + category)) direction = 'QA / Testing';
      else if (/data|analyst|analytics|sql/i.test(title + ' ' + category)) direction = 'Data Analytics';

      const idNum = jobUrl.match(/\/vacancies\/([0-9]+)/)?.[1] || Math.random().toString(36).substr(2, 9);

      vacancies.push({
        id: `dou-${idNum}`,
        title,
        company,
        platform: 'DOU',
        salary,
        location,
        direction,
        postedAgo: 'Свіжа з DOU',
        url: jobUrl,
        requiredSkills: foundSkills.length > 0 ? foundSkills : ['sql'],
        optionalSkills: [],
        summary: summary || `Вакансія ${title} від компанії ${company} на jobs.dou.ua.`,
      });
    }

    return vacancies;
  } catch (err) {
    console.error('Error scraping DOU:', err.message);
    return [];
  }
}
