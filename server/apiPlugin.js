import {
  loadDb,
  saveDb,
  hashPassword,
  generateToken,
  verifyToken,
  sanitizeUser,
  INITIAL_USERS,
  DEFAULT_SKILLS,
  DEFAULT_LEVEL_LABELS,
} from './db.js';
import { VACANCIES as DEFAULT_VACANCIES } from '../src/data/mockData.js';

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function getCurrentUser(req, db) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) return null;
  return db.users.find((u) => u.id === payload.id) || null;
}

export function apiMiddleware() {
  return {
    name: 'nubhub-api-middleware',
    configureServer(server) {
      loadDb();

      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;
        const db = loadDb();

        // 0. GET /api/catalog — отримати всі скіли та вакансії з БД
        if (req.method === 'GET' && pathname === '/api/catalog') {
          return sendJson(res, 200, {
            skills: db.skills,
            vacancies: db.vacancies,
          });
        }

        // 0.1 POST /api/skills — ТІЛЬКИ ДЛЯ АДМІНІВ: додати новий скіл (відсотки рахуються АВТОМАТИЧНО з вакансій)
        if (req.method === 'POST' && pathname === '/api/skills') {
          const currentUser = getCurrentUser(req, db);
          if (!currentUser || currentUser.role !== 'admin') {
            return sendJson(res, 403, { error: 'Тільки Адміністратор може додавати нові скіли!' });
          }

          const body = await parseBody(req);
          if (!body.name || !body.name.trim()) {
            return sendJson(res, 400, { error: 'Вкажіть назву скіла' });
          }

          const cleanName = body.name.trim();
          const slugId =
            (body.id || cleanName.toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '-').replace(/^-|-$/g, '')) ||
            'skill-' + Date.now();

          if (db.skills.some((s) => s.id === slugId || s.name.toLowerCase() === cleanName.toLowerCase())) {
            return sendJson(res, 409, { error: 'Такий скіл вже існує в базі!' });
          }

          let parsedLevels = DEFAULT_LEVEL_LABELS;
          if (Array.isArray(body.levels) && body.levels.length > 0) {
            parsedLevels = body.levels.map((l) => String(l).trim()).filter(Boolean);
          } else if (typeof body.levelsText === 'string' && body.levelsText.trim()) {
            parsedLevels = body.levelsText
              .split(',')
              .map((l) => l.trim())
              .filter(Boolean);
          }
          if (parsedLevels.length === 0) parsedLevels = DEFAULT_LEVEL_LABELS;

          const newSkill = {
            id: slugId,
            name: cleanName,
            category: body.category || 'Мова програмування',
            overallDemand: 0,
            platformDemand: { Djinni: 0, DOU: 0, 'Work.ua': 0, 'Robota.ua': 0 },
            levels: parsedLevels,
            timeToLearn: body.timeToLearn || '2–3 тижні',
            description: body.description || `Навичка ${cleanName} для Junior-спеціалістів.`,
            resources:
              Array.isArray(body.resources) && body.resources.length > 0
                ? body.resources
                : [
                    {
                      type: 'course',
                      title: `${cleanName} — Посібник та курси для початківців`,
                      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanName + ' курс українською')}`,
                      lang: 'UA',
                      free: true,
                    },
                  ],
          };

          db.skills.push(newSkill);

          if (Array.isArray(body.attachToVacancies)) {
            db.vacancies.forEach((v) => {
              if (body.attachToVacancies.includes(v.id) && !v.requiredSkills.includes(newSkill.id)) {
                v.requiredSkills.push(newSkill.id);
              }
            });
          }

          // saveDb автоматично перерахує відсотки попиту overallDemand та platformDemand!
          saveDb(db);
          return sendJson(res, 201, {
            skill: newSkill,
            skills: db.skills,
            vacancies: db.vacancies,
          });
        }

        // 0.12 PUT /api/skills — ТІЛЬКИ ДЛЯ АДМІНІВ: повноцінне редагування скіла (назва, категорія, рівні, ресурси, прив'язка до вакансій)
        if (req.method === 'PUT' && pathname === '/api/skills') {
          const currentUser = getCurrentUser(req, db);
          if (!currentUser || currentUser.role !== 'admin') {
            return sendJson(res, 403, { error: 'Тільки Адміністратор може редагувати скіли!' });
          }

          const body = await parseBody(req);
          const skill = db.skills.find((s) => s.id === body.id);
          if (!skill) return sendJson(res, 404, { error: 'Скіл не знайдено' });

          if (typeof body.name === 'string' && body.name.trim()) skill.name = body.name.trim();
          if (typeof body.category === 'string' && body.category.trim()) skill.category = body.category.trim();
          if (typeof body.timeToLearn === 'string') skill.timeToLearn = body.timeToLearn.trim();
          if (typeof body.description === 'string') skill.description = body.description.trim();

          if (Array.isArray(body.levels)) {
            const cleanLvls = body.levels.map((l) => String(l).trim()).filter(Boolean);
            if (cleanLvls.length > 0) skill.levels = cleanLvls;
          } else if (typeof body.levelsText === 'string') {
            const cleanLvls = body.levelsText
              .split(',')
              .map((l) => l.trim())
              .filter(Boolean);
            if (cleanLvls.length > 0) skill.levels = cleanLvls;
          }

          if (Array.isArray(body.resources)) {
            skill.resources = body.resources.filter((r) => r && r.title && r.title.trim());
          }

          // Оновлення прив'язки цього скіла до вакансій (як обов'язкового або опціонального)
          if (Array.isArray(body.requiredInVacancies)) {
            db.vacancies.forEach((v) => {
              const shouldHaveReq = body.requiredInVacancies.includes(v.id);
              if (shouldHaveReq) {
                if (!v.requiredSkills.includes(skill.id)) v.requiredSkills.push(skill.id);
                v.optionalSkills = (v.optionalSkills || []).filter((id) => id !== skill.id);
              } else {
                v.requiredSkills = v.requiredSkills.filter((id) => id !== skill.id);
              }
            });
          }

          if (Array.isArray(body.optionalInVacancies)) {
            db.vacancies.forEach((v) => {
              const shouldHaveOpt = body.optionalInVacancies.includes(v.id);
              if (shouldHaveOpt && !v.requiredSkills.includes(skill.id)) {
                if (!v.optionalSkills.includes(skill.id)) v.optionalSkills.push(skill.id);
              } else if (!shouldHaveOpt) {
                v.optionalSkills = (v.optionalSkills || []).filter((id) => id !== skill.id);
              }
            });
          }

          // saveDb автоматично перерахує відсотки попиту на основі оновлених вакансій!
          saveDb(db);
          return sendJson(res, 200, {
            skill,
            skills: db.skills,
            vacancies: db.vacancies,
          });
        }

        // 0.15 PATCH /api/skills/levels — ТІЛЬКИ ДЛЯ АДМІНІВ: налаштувати рівні для існуючого скіла
        if (req.method === 'PATCH' && pathname === '/api/skills/levels') {
          const currentUser = getCurrentUser(req, db);
          if (!currentUser || currentUser.role !== 'admin') {
            return sendJson(res, 403, { error: 'Тільки Адміністратор може налаштовувати рівні скілів!' });
          }

          const { skillId, levels } = await parseBody(req);
          const skill = db.skills.find((s) => s.id === skillId);
          if (!skill) return sendJson(res, 404, { error: 'Скіл не знайдено' });

          const cleanLevels = Array.isArray(levels)
            ? levels.map((l) => String(l).trim()).filter(Boolean)
            : String(levels || '')
                .split(',')
                .map((l) => l.trim())
                .filter(Boolean);

          if (cleanLevels.length > 0) {
            skill.levels = cleanLevels;
            saveDb(db);
          }
          return sendJson(res, 200, { skills: db.skills });
        }

        // 0.2 DELETE /api/skills — ТІЛЬКИ ДЛЯ АДМІНІВ: видалити скіл
        if (req.method === 'DELETE' && pathname === '/api/skills') {
          const currentUser = getCurrentUser(req, db);
          if (!currentUser || currentUser.role !== 'admin') {
            return sendJson(res, 403, { error: 'Тільки Адміністратор може видаляти скіли!' });
          }

          const skillId = urlObj.searchParams.get('id');
          db.skills = db.skills.filter((s) => s.id !== skillId);
          db.vacancies.forEach((v) => {
            v.requiredSkills = v.requiredSkills.filter((id) => id !== skillId);
            v.optionalSkills = v.optionalSkills.filter((id) => id !== skillId);
          });
          db.users.forEach((u) => {
            u.skills = u.skills.filter((id) => id !== skillId);
            if (u.skillLevels && u.skillLevels[skillId]) {
              delete u.skillLevels[skillId];
            }
          });
          saveDb(db);
          return sendJson(res, 200, {
            skills: db.skills,
            vacancies: db.vacancies,
          });
        }

        // 1. GET /api/users/demo-list
        if (req.method === 'GET' && pathname === '/api/users/demo-list') {
          return sendJson(res, 200, {
            users: db.users.map(sanitizeUser),
          });
        }

        // 2. GET /api/auth/me
        if (req.method === 'GET' && pathname === '/api/auth/me') {
          const user = getCurrentUser(req, db);
          if (!user) return sendJson(res, 401, { error: 'Не авторизовано' });
          return sendJson(res, 200, { user: sanitizeUser(user) });
        }

        // 3. POST /api/auth/login
        if (req.method === 'POST' && pathname === '/api/auth/login') {
          const { email, password } = await parseBody(req);
          if (!email || !password) {
            return sendJson(res, 400, { error: 'Введіть Email та пароль' });
          }
          const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
          if (!user || user.passwordHash !== hashPassword(password)) {
            return sendJson(res, 401, { error: 'Невірний Email або пароль' });
          }
          const token = generateToken(user);
          return sendJson(res, 200, { token, user: sanitizeUser(user) });
        }

        // 4. POST /api/auth/register
        if (req.method === 'POST' && pathname === '/api/auth/register') {
          const { name, email, password, targetRole, englishLevel, city } = await parseBody(req);
          if (!name || !email || !password) {
            return sendJson(res, 400, { error: "Ім'я, Email та пароль обов'язкові" });
          }
          const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
          if (exists) {
            return sendJson(res, 409, { error: 'Користувач з таким Email вже існує' });
          }

          const newUser = {
            id: 'user-' + Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash: hashPassword(password),
            role: 'user',
            authProvider: 'email',
            targetRole: targetRole || 'Junior Developer',
            englishLevel: englishLevel || 'B1 (Intermediate)',
            city: city || 'Україна',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`,
            githubUrl: '',
            bio: 'Новий учасник спільноти NubHub. Вивчаю скіли та готуюсь до першого оферу!',
            skills: ['git', 'sql'],
            skillLevels: { git: 'Базовий', sql: 'Базовий' },
            createdAt: new Date().toISOString(),
          };

          db.users.push(newUser);
          saveDb(db);
          const token = generateToken(newUser);
          return sendJson(res, 201, { token, user: sanitizeUser(newUser) });
        }

        // 5. POST /api/auth/oauth
        if (req.method === 'POST' && pathname === '/api/auth/oauth') {
          const { provider, email, name, userId } = await parseBody(req);

          if (userId) {
            const target = db.users.find((u) => u.id === userId);
            if (!target) return sendJson(res, 404, { error: 'Користувача не знайдено' });
            const token = generateToken(target);
            return sendJson(res, 200, { token, user: sanitizeUser(target) });
          }

          let user = null;
          if (email) {
            user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
          }

          if (!user && email) {
            user = {
              id: `${provider}-${Date.now()}`,
              name: name || (provider === 'google' ? 'Google Користувач' : 'GitHub Розробник'),
              email: email.toLowerCase().trim(),
              passwordHash: hashPassword(String(Date.now())),
              role: 'user',
              authProvider: provider,
              targetRole: provider === 'github' ? 'Junior Fullstack Developer' : 'Junior Data Analyst',
              englishLevel: 'B1 (Intermediate)',
              city: 'Київ',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
              githubUrl: provider === 'github' ? `https://github.com/${email.split('@')[0]}` : '',
              bio: `Авторизовано через ${provider === 'google' ? 'Google OAuth' : 'GitHub OAuth'}.`,
              skills: provider === 'github' ? ['git', 'javascript', 'react'] : ['sql', 'python'],
              skillLevels:
                provider === 'github'
                  ? { git: 'Просунутий', javascript: 'Базовий', react: 'Базовий' }
                  : { sql: 'Базовий', python: 'Базовий' },
              createdAt: new Date().toISOString(),
            };
            db.users.push(user);
            saveDb(db);
          }

          if (!user) {
            user = db.users.find((u) => u.authProvider === provider) || db.users[1];
          }

          const token = generateToken(user);
          return sendJson(res, 200, { token, user: sanitizeUser(user) });
        }

        // 6. PUT /api/profile — оновлення свого профілю, скілів та їхніх рівнів (skillLevels)
        if (req.method === 'PUT' && pathname === '/api/profile') {
          const currentUser = getCurrentUser(req, db);
          if (!currentUser) return sendJson(res, 401, { error: 'Не авторизовано' });

          const updates = await parseBody(req);
          if (Array.isArray(updates.skills)) {
            currentUser.skills = updates.skills;
            if (!currentUser.skillLevels) currentUser.skillLevels = {};
            updates.skills.forEach((sId) => {
              if (!currentUser.skillLevels[sId]) {
                const skObj = db.skills.find((s) => s.id === sId);
                currentUser.skillLevels[sId] = skObj?.levels?.[0] || 'Базовий';
              }
            });
          }
          if (updates.skillLevels && typeof updates.skillLevels === 'object') {
            currentUser.skillLevels = { ...(currentUser.skillLevels || {}), ...updates.skillLevels };
          }
          if (typeof updates.name === 'string') currentUser.name = updates.name.trim();
          if (typeof updates.targetRole === 'string') currentUser.targetRole = updates.targetRole.trim();
          if (typeof updates.englishLevel === 'string') currentUser.englishLevel = updates.englishLevel;
          if (typeof updates.city === 'string') currentUser.city = updates.city.trim();
          if (typeof updates.bio === 'string') currentUser.bio = updates.bio.trim();
          if (typeof updates.githubUrl === 'string') currentUser.githubUrl = updates.githubUrl.trim();

          saveDb(db);
          return sendJson(res, 200, { user: sanitizeUser(currentUser) });
        }

        // 7. АДМІН-маршрути
        if (pathname.startsWith('/api/admin/')) {
          const currentUser = getCurrentUser(req, db);
          if (!currentUser || currentUser.role !== 'admin') {
            return sendJson(res, 403, { error: 'Доступ дозволено лише Адміністратору' });
          }

          if (req.method === 'POST' && pathname === '/api/admin/reset-seed') {
            db.users = JSON.parse(JSON.stringify(INITIAL_USERS));
            db.skills = JSON.parse(JSON.stringify(DEFAULT_SKILLS));
            db.vacancies = JSON.parse(JSON.stringify(DEFAULT_VACANCIES));
            saveDb(db);
            return sendJson(res, 200, {
              users: db.users.map(sanitizeUser),
              skills: db.skills,
              vacancies: db.vacancies,
            });
          }

          if (req.method === 'DELETE' && pathname === '/api/admin/users') {
            const userId = urlObj.searchParams.get('id');
            if (userId === currentUser.id) {
              return sendJson(res, 400, { error: 'Не можна видалити власний акаунт адміністратора' });
            }
            db.users = db.users.filter((u) => u.id !== userId);
            saveDb(db);
            return sendJson(res, 200, { users: db.users.map(sanitizeUser) });
          }

          if (req.method === 'PATCH' && pathname === '/api/admin/users/role') {
            const { userId, role } = await parseBody(req);
            const target = db.users.find((u) => u.id === userId);
            if (!target) return sendJson(res, 404, { error: 'Користувача не знайдено' });
            target.role = role === 'admin' ? 'admin' : 'user';
            saveDb(db);
            return sendJson(res, 200, { users: db.users.map(sanitizeUser) });
          }
        }

        return sendJson(res, 404, { error: 'API route not found' });
      });
    },
  };
}
