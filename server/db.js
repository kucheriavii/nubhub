import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { SKILLS as RAW_SKILLS, VACANCIES as DEFAULT_VACANCIES } from '../src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.join(__dirname, 'db.json');
const DB_PATH = process.env.DB_PATH || DEFAULT_DB_PATH;

export const DEFAULT_LEVEL_LABELS = ['Базовий', 'Просунутий', 'Бог'];

export const DEFAULT_SKILLS = RAW_SKILLS.map((s) => ({
  ...s,
  levels: Array.isArray(s.levels) && s.levels.length > 0 ? s.levels : DEFAULT_LEVEL_LABELS,
}));

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password + '_nubhub_salt').digest('hex');
}

export function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 днів
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export function verifyToken(token) {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf-8');
    const data = JSON.parse(json);
    if (data.exp && data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export const INITIAL_USERS = [
  // ================= АДМІНІСТРАТОР =================
  {
    id: 'admin-1',
    name: 'Максим Коваленко (Admin)',
    email: 'admin@nubhub.ua',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    authProvider: 'email',
    targetRole: 'Platform Architect / Senior Mentor',
    englishLevel: 'C1 (Advanced)',
    city: 'Київ',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    githubUrl: 'https://github.com/nubhub-admin',
    bio: 'Головний адміністратор платформи NubHub. Керую базою скілів, рівнями майстерності, вакансіями та менторю джунів.',
    skills: ['sql', 'postgresql', 'git', 'javascript', 'typescript', 'react', 'html-css', 'python', 'fastapi-django', 'rest-api', 'docker'],
    skillLevels: {
      sql: 'Бог',
      postgresql: 'Бог',
      git: 'Бог',
      javascript: 'Просунутий',
      typescript: 'Просунутий',
      react: 'Просунутий',
      'html-css': 'Бог',
      python: 'Бог',
      'fastapi-django': 'Бог',
      'rest-api': 'Бог',
      docker: 'Просунутий',
    },
    createdAt: '2026-09-01T10:00:00Z',
  },

  // ================= 10 ЮЗЕРІВ (ДЖУНІВ) =================
  {
    id: 'user-1',
    name: 'Олександр Бондаренко',
    email: 'alex.frontend@gmail.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'google',
    targetRole: 'Junior Frontend Developer (React)',
    englishLevel: 'B1 (Intermediate)',
    city: 'Київ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    githubUrl: 'https://github.com/alex-bond-dev',
    bio: 'Верстаю сайти, активно вчу React та TypeScript. Шукаю першу роботу на Djinni або DOU.',
    skills: ['html-css', 'javascript', 'react', 'git'],
    skillLevels: {
      'html-css': 'Просунутий',
      javascript: 'Просунутий',
      react: 'Базовий',
      git: 'Базовий',
    },
    createdAt: '2026-10-01T12:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Марія Шевченко',
    email: 'maria.data@gmail.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'google',
    targetRole: 'Junior Data / BI Analyst',
    englishLevel: 'B2 (Upper-Intermediate)',
    city: 'Львів',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    githubUrl: 'https://github.com/maria-data-ua',
    bio: 'Переходжу з фінансів в IT-аналітику. Обожнюю SQL-запити та дашборди в Power BI.',
    skills: ['sql', 'excel-bi', 'python'],
    skillLevels: {
      sql: 'Просунутий',
      'excel-bi': 'Бог',
      python: 'Базовий',
    },
    createdAt: '2026-10-03T14:20:00Z',
  },
  {
    id: 'user-3',
    name: 'Дмитро Ткаченко',
    email: 'dmytro.py@github.user',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'github',
    targetRole: 'Junior Python Backend Developer',
    englishLevel: 'B1 (Intermediate)',
    city: 'Дніпро',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmytro',
    githubUrl: 'https://github.com/dmytro-tkach',
    bio: 'Пишу пет-проєкти на FastAPI та PostgreSQL. Розібрався з базовим Docker.',
    skills: ['python', 'fastapi-django', 'sql', 'postgresql', 'git'],
    skillLevels: {
      python: 'Просунутий',
      'fastapi-django': 'Просунутий',
      sql: 'Базовий',
      postgresql: 'Базовий',
      git: 'Просунутий',
    },
    createdAt: '2026-10-05T09:15:00Z',
  },
  {
    id: 'user-4',
    name: 'Анна Мельник',
    email: 'anna.qa@ukr.net',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'email',
    targetRole: 'Junior Manual QA Engineer',
    englishLevel: 'B1 (Intermediate)',
    city: 'Вінниця',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    githubUrl: 'https://github.com/anna-qa-test',
    bio: 'Закінчила курс QA на Prometheus. Знаю тест-дизайн, ганяю запити в Postman та перевіряю БД через SQL.',
    skills: ['qa-theory', 'rest-api', 'sql', 'html-css'],
    skillLevels: {
      'qa-theory': 'Просунутий',
      'rest-api': 'Просунутий',
      sql: 'Базовий',
      'html-css': 'Базовий',
    },
    createdAt: '2026-10-06T16:40:00Z',
  },
  {
    id: 'user-5',
    name: 'Іван Кравчук',
    email: 'ivan.fullstack@github.user',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'github',
    targetRole: 'Trainee / Junior Fullstack Developer',
    englishLevel: 'B2 (Upper-Intermediate)',
    city: 'Одеса',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
    githubUrl: 'https://github.com/ivan-kravchuk',
    bio: 'Люблю і фронтенд на React, і бекенд на Python. Хочу потрапити в інтернатуру великої компанії.',
    skills: ['html-css', 'javascript', 'react', 'python', 'git', 'rest-api'],
    skillLevels: {
      'html-css': 'Просунутий',
      javascript: 'Просунутий',
      react: 'Базовий',
      python: 'Базовий',
      git: 'Просунутий',
      'rest-api': 'Базовий',
    },
    createdAt: '2026-10-08T11:10:00Z',
  },
  {
    id: 'user-6',
    name: 'Софія Бойко',
    email: 'sofia.boyko@gmail.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'google',
    targetRole: 'Trainee Frontend Developer',
    englishLevel: 'A2 (Pre-Intermediate)',
    city: 'Івано-Франківськ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    githubUrl: 'https://github.com/sofia-web',
    bio: 'Тільки починаю свій шлях. Вже впевнено верстаю адаптивні лендінги та вчу базовий JS.',
    skills: ['html-css', 'javascript', 'git'],
    skillLevels: {
      'html-css': 'Просунутий',
      javascript: 'Базовий',
      git: 'Базовий',
    },
    createdAt: '2026-10-10T18:05:00Z',
  },
  {
    id: 'user-7',
    name: 'Артем Лисенко',
    email: 'artem.sql@outlook.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'email',
    targetRole: 'Junior Database / Backend Engineer',
    englishLevel: 'B1 (Intermediate)',
    city: 'Харків',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Artem',
    githubUrl: 'https://github.com/artem-db',
    bio: 'Фанатію від реляційних баз даних, оптимізації запитів у PostgreSQL та контейнеризації.',
    skills: ['sql', 'postgresql', 'docker', 'git', 'python'],
    skillLevels: {
      sql: 'Бог',
      postgresql: 'Просунутий',
      docker: 'Базовий',
      git: 'Просунутий',
      python: 'Базовий',
    },
    createdAt: '2026-10-11T08:30:00Z',
  },
  {
    id: 'user-8',
    name: 'Катерина Савченко',
    email: 'kate.savchenko@gmail.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'google',
    targetRole: 'Junior QA Automation (JS/Python)',
    englishLevel: 'B2 (Upper-Intermediate)',
    city: 'Київ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kateryna',
    githubUrl: 'https://github.com/kate-aqa',
    bio: 'Маю базу мануального тестування, зараз активно пишу автотести на Python та вивчаю CI/CD.',
    skills: ['qa-theory', 'python', 'rest-api', 'git', 'sql'],
    skillLevels: {
      'qa-theory': 'Бог',
      python: 'Просунутий',
      'rest-api': 'Просунутий',
      git: 'Базовий',
      sql: 'Базовий',
    },
    createdAt: '2026-10-12T15:50:00Z',
  },
  {
    id: 'user-9',
    name: 'Богдан Руденко',
    email: 'bohdan.ts@github.user',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'github',
    targetRole: 'Junior React / TypeScript Developer',
    englishLevel: 'B2 (Upper-Intermediate)',
    city: 'Тернопіль',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bohdan',
    githubUrl: 'https://github.com/bohdan-ts',
    bio: 'Переписав усі свої проєкти на суворий TypeScript + React. Готовий до технічних співбесід.',
    skills: ['html-css', 'javascript', 'typescript', 'react', 'rest-api', 'git'],
    skillLevels: {
      'html-css': 'Просунутий',
      javascript: 'Просунутий',
      typescript: 'Просунутий',
      react: 'Просунутий',
      'rest-api': 'Базовий',
      git: 'Просунутий',
    },
    createdAt: '2026-10-14T13:25:00Z',
  },
  {
    id: 'user-10',
    name: 'Юлія Мороз',
    email: 'yulia.moroz@ukr.net',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'email',
    targetRole: 'Молодший аналітик даних (Work.ua / Robota.ua)',
    englishLevel: 'A2 (Pre-Intermediate)',
    city: 'Полтава',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yulia',
    githubUrl: 'https://github.com/yulia-analytics',
    bio: 'Круто знаю Excel та Power BI, зараз підтягую SQL та PostgreSQL за допомогою тренажерів на NubHub.',
    skills: ['excel-bi', 'sql'],
    skillLevels: {
      'excel-bi': 'Просунутий',
      sql: 'Базовий',
    },
    createdAt: '2026-10-16T19:00:00Z',
  },
];

export function recalculateSkillsDemand(db) {
  if (!db || !Array.isArray(db.skills) || !Array.isArray(db.vacancies)) return;
  const platforms = ['Djinni', 'DOU', 'Work.ua', 'Robota.ua'];
  const totalVacancies = db.vacancies.length;

  db.skills.forEach((skill) => {
    const mentionedIn = db.vacancies.filter(
      (v) =>
        (Array.isArray(v.requiredSkills) && v.requiredSkills.includes(skill.id)) ||
        (Array.isArray(v.optionalSkills) && v.optionalSkills.includes(skill.id))
    );

    skill.overallDemand =
      totalVacancies > 0 ? Math.round((mentionedIn.length / totalVacancies) * 100) : 0;

    const pDemand = {};
    platforms.forEach((pName) => {
      const platVacancies = db.vacancies.filter((v) => v.platform === pName);
      if (platVacancies.length === 0) {
        pDemand[pName] = 0;
      } else {
        const platMentioned = platVacancies.filter(
          (v) =>
            (Array.isArray(v.requiredSkills) && v.requiredSkills.includes(skill.id)) ||
            (Array.isArray(v.optionalSkills) && v.optionalSkills.includes(skill.id))
        );
        pDemand[pName] = Math.round((platMentioned.length / platVacancies.length) * 100);
      }
    });
    skill.platformDemand = pDemand;
  });
}

export function loadDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    if (DB_PATH !== DEFAULT_DB_PATH && fs.existsSync(DEFAULT_DB_PATH)) {
      try {
        fs.copyFileSync(DEFAULT_DB_PATH, DB_PATH);
      } catch (err) {
        console.error('Failed to copy initial DB to DB_PATH:', err);
      }
    } else {
      const initialData = {
        users: INITIAL_USERS,
        skills: DEFAULT_SKILLS,
        vacancies: DEFAULT_VACANCIES,
      };
      recalculateSkillsDemand(initialData);
      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    let changed = false;

    if (!Array.isArray(parsed.users)) {
      parsed.users = INITIAL_USERS;
      changed = true;
    } else {
      parsed.users.forEach((u, idx) => {
        if (!u.skillLevels || typeof u.skillLevels !== 'object') {
          const seedUser = INITIAL_USERS.find((su) => su.id === u.id) || INITIAL_USERS[idx];
          u.skillLevels = seedUser?.skillLevels || {};
          u.skills?.forEach((sId) => {
            if (!u.skillLevels[sId]) u.skillLevels[sId] = 'Базовий';
          });
          changed = true;
        }
      });
    }

    if (!Array.isArray(parsed.skills)) {
      parsed.skills = DEFAULT_SKILLS;
      changed = true;
    } else {
      const defaultMap = new Map(DEFAULT_SKILLS.map((ds) => [ds.id, ds]));
      parsed.skills.forEach((s) => {
        if (!Array.isArray(s.levels) || s.levels.length === 0) {
          s.levels = DEFAULT_LEVEL_LABELS;
          changed = true;
        }
        const defSkill = defaultMap.get(s.id);
        if (defSkill && s.category !== defSkill.category) {
          s.category = defSkill.category;
          changed = true;
        }
      });
      DEFAULT_SKILLS.forEach((ds) => {
        if (!parsed.skills.some((s) => s.id === ds.id)) {
          parsed.skills.push(ds);
          changed = true;
        }
      });
    }

    if (!Array.isArray(parsed.vacancies)) {
      parsed.vacancies = DEFAULT_VACANCIES;
      changed = true;
    } else {
      DEFAULT_VACANCIES.forEach((dv) => {
        if (!parsed.vacancies.some((v) => v.id === dv.id)) {
          parsed.vacancies.push(dv);
          changed = true;
        }
      });
    }

    recalculateSkillsDemand(parsed);
    if (changed) {
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch {
    const initialData = {
      users: INITIAL_USERS,
      skills: DEFAULT_SKILLS,
      vacancies: DEFAULT_VACANCIES,
    };
    recalculateSkillsDemand(initialData);
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function saveDb(data) {
  recalculateSkillsDemand(data);
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
