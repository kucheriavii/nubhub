import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';
import { SKILLS as RAW_SKILLS, VACANCIES as DEFAULT_VACANCIES } from '../src/data/mockData.js';
import { SKILL_TRACKS as DEFAULT_ROADMAPS } from '../src/data/skillTrees.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SQLITE_PATH = path.join(__dirname, 'nubhub.db');
const SQLITE_DB_PATH = process.env.DB_PATH || DEFAULT_SQLITE_PATH;
const JSON_BACKUP_PATH = path.join(__dirname, 'db.json');

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
    createdAt: '2026-10-01T10:00:00Z',
  },
  {
    id: 'user-1',
    name: 'Олександр Бондаренко',
    email: 'oleksandr.dev@gmail.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'google',
    targetRole: 'Junior Frontend Developer (React)',
    englishLevel: 'B2 (Upper-Intermediate)',
    city: 'Київ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oleksandr',
    githubUrl: 'https://github.com/oleksandr-react',
    bio: 'Вчу React, TypeScript та Tailwind. Зробив 3 пет-проєкти, шукаю першу роботу в IT.',
    skills: ['html-css', 'javascript', 'react', 'tailwind', 'git'],
    skillLevels: {
      'html-css': 'Бог',
      javascript: 'Просунутий',
      react: 'Базовий',
      tailwind: 'Просунутий',
      git: 'Базовий',
    },
    createdAt: '2026-10-02T12:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Марія Шевченко',
    email: 'maria.data@gmail.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'google',
    targetRole: 'Junior Data / BI Analyst',
    englishLevel: 'B1 (Intermediate)',
    city: 'Львів',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    githubUrl: 'https://github.com/maria-analytics',
    bio: 'Обожнюю візуалізацію даних та SQL. Працюю з Power BI, вчу Python для автоматизації звітів.',
    skills: ['sql', 'postgresql', 'excel-bi', 'python', 'git'],
    skillLevels: {
      sql: 'Просунутий',
      postgresql: 'Базовий',
      'excel-bi': 'Бог',
      python: 'Базовий',
      git: 'Базовий',
    },
    createdAt: '2026-10-03T14:30:00Z',
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
    createdAt: '2026-10-06T11:20:00Z',
  },
  {
    id: 'user-5',
    name: 'Іван Кравчук',
    email: 'ivan.fullstack@github.user',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'github',
    targetRole: 'Trainee Fullstack Developer',
    englishLevel: 'A2 (Pre-Intermediate)',
    city: 'Одеса',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
    githubUrl: 'https://github.com/ivan-kravchuk-dev',
    bio: 'Студент 3 курсу комп’ютерних наук. Базово знаю React та Node.js, активно шукаю першу інтернатуру.',
    skills: ['html-css', 'javascript', 'react', 'git'],
    skillLevels: {
      'html-css': 'Просунутий',
      javascript: 'Базовий',
      react: 'Базовий',
      git: 'Базовий',
    },
    createdAt: '2026-10-08T16:45:00Z',
  },
  {
    id: 'user-6',
    name: 'Софія Бойко',
    email: 'sofia.frontend@gmail.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'google',
    targetRole: 'Junior Frontend Developer (Vue / React)',
    englishLevel: 'B2 (Upper-Intermediate)',
    city: 'Харків',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    githubUrl: 'https://github.com/sofia-boyko-ui',
    bio: 'Перейшла з графічного дизайну у фронтенд. Верстаю піксель-в-піксель, добре відчуваю UX.',
    skills: ['html-css', 'javascript', 'vue', 'tailwind', 'git'],
    skillLevels: {
      'html-css': 'Бог',
      javascript: 'Просунутий',
      vue: 'Просунутий',
      tailwind: 'Бог',
      git: 'Базовий',
    },
    createdAt: '2026-10-09T17:10:00Z',
  },
  {
    id: 'user-7',
    name: 'Артем Лисенко',
    email: 'artem.sql@outlook.com',
    passwordHash: hashPassword('user123'),
    role: 'user',
    authProvider: 'email',
    targetRole: 'Junior Database Developer / Backend',
    englishLevel: 'B1 (Intermediate)',
    city: 'Черкаси',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Artem',
    githubUrl: 'https://github.com/artem-lysenko-db',
    bio: 'Закоханий у складні SQL-запити, оптимізацію індексів та транзакції в PostgreSQL та MySQL.',
    skills: ['sql', 'postgresql', 'mysql', 'git'],
    skillLevels: {
      sql: 'Бог',
      postgresql: 'Просунутий',
      mysql: 'Просунутий',
      git: 'Базовий',
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

let sqliteDbInstance = null;

// ================= SQLITE MAPPERS =================

function rowToUser(row) {
  if (!row) return null;
  let skills = [];
  let skillLevels = {};
  try {
    skills = row.skills ? JSON.parse(row.skills) : [];
  } catch {}
  try {
    skillLevels = row.skill_levels ? JSON.parse(row.skill_levels) : {};
  } catch {}

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    authProvider: row.auth_provider,
    targetRole: row.target_role || '',
    englishLevel: row.english_level || 'B1 (Intermediate)',
    city: row.city || '',
    avatar: row.avatar || '',
    githubUrl: row.github_url || '',
    bio: row.bio || '',
    skills,
    skillLevels,
    createdAt: row.created_at,
  };
}

function rowToSkill(row) {
  if (!row) return null;
  let platformDemand = {};
  let levels = DEFAULT_LEVEL_LABELS;
  let resources = [];
  try {
    platformDemand = row.platform_demand ? JSON.parse(row.platform_demand) : {};
  } catch {}
  try {
    levels = row.levels ? JSON.parse(row.levels) : DEFAULT_LEVEL_LABELS;
  } catch {}
  try {
    resources = row.resources ? JSON.parse(row.resources) : [];
  } catch {}

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    overallDemand: Number(row.overall_demand) || 0,
    platformDemand,
    levels: Array.isArray(levels) && levels.length > 0 ? levels : DEFAULT_LEVEL_LABELS,
    timeToLearn: row.time_to_learn || '2–3 тижні',
    description: row.description || '',
    resources,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToVacancy(row) {
  if (!row) return null;
  let requiredSkills = [];
  let optionalSkills = [];
  try {
    requiredSkills = row.required_skills ? JSON.parse(row.required_skills) : [];
  } catch {}
  try {
    optionalSkills = row.optional_skills ? JSON.parse(row.optional_skills) : [];
  } catch {}

  return {
    id: row.id,
    title: row.title,
    company: row.company,
    platform: row.platform,
    url: row.url || '',
    salary: row.salary || '',
    location: row.location || '',
    direction: row.direction || '',
    postedAgo: row.posted_ago || '',
    description: row.description || '',
    summary: row.description || '',
    requiredSkills,
    optionalSkills,
    source: row.source || '',
    postedAt: row.posted_at || '',
    createdAt: row.created_at,
  };
}

function rowToRoadmap(row) {
  if (!row) return null;
  let primaryRoles = [];
  let nodes = [];
  try {
    primaryRoles = row.primary_roles ? JSON.parse(row.primary_roles) : [];
  } catch {}
  try {
    nodes = row.nodes ? JSON.parse(row.nodes) : [];
  } catch {}

  return {
    id: row.id,
    name: row.name,
    badge: row.badge || '',
    color: row.color || 'from-indigo-600 to-purple-600',
    description: row.description || '',
    estimatedTotalTime: row.estimated_total_time || '',
    estimatedTotalHours: row.estimated_total_hours || '',
    primaryRoles,
    nodes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ================= DATABASE INITIALIZATION =================

export function getSqliteDb() {
  if (sqliteDbInstance) return sqliteDbInstance;

  const dir = path.dirname(SQLITE_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // If running in Docker or another path and source exists, copy over
  if (!fs.existsSync(SQLITE_DB_PATH) && SQLITE_DB_PATH !== DEFAULT_SQLITE_PATH && fs.existsSync(DEFAULT_SQLITE_PATH)) {
    try {
      fs.copyFileSync(DEFAULT_SQLITE_PATH, SQLITE_DB_PATH);
    } catch (err) {
      console.error('Failed to copy initial sqlite db to target path:', err);
    }
  }

  const db = new DatabaseSync(SQLITE_DB_PATH);
  sqliteDbInstance = db;

  // Performance pragmas
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');

  // Create tables: users, skills, vacancies, roadmaps
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      auth_provider TEXT NOT NULL DEFAULT 'email',
      target_role TEXT,
      english_level TEXT,
      city TEXT,
      avatar TEXT,
      github_url TEXT,
      bio TEXT,
      skills TEXT,
      skill_levels TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      overall_demand INTEGER DEFAULT 0,
      platform_demand TEXT,
      levels TEXT,
      time_to_learn TEXT,
      description TEXT,
      resources TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS vacancies (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      platform TEXT NOT NULL,
      url TEXT,
      salary TEXT,
      location TEXT,
      direction TEXT,
      posted_ago TEXT,
      description TEXT,
      required_skills TEXT,
      optional_skills TEXT,
      source TEXT,
      posted_at TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS roadmaps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      badge TEXT,
      color TEXT,
      description TEXT,
      estimated_total_time TEXT,
      estimated_total_hours TEXT,
      primary_roles TEXT,
      nodes TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
    CREATE INDEX IF NOT EXISTS idx_vacancies_platform ON vacancies(platform);
  `);

  // Seed tables if empty
  seedDatabaseIfEmpty(db);

  return db;
}

function seedDatabaseIfEmpty(db) {
  const userCount = db.prepare('SELECT count(*) as c FROM users').get().c;
  const skillCount = db.prepare('SELECT count(*) as c FROM skills').get().c;
  const vacCount = db.prepare('SELECT count(*) as c FROM vacancies').get().c;
  const roadmapCount = db.prepare('SELECT count(*) as c FROM roadmaps').get().c;

  let seedSource = null;
  if (fs.existsSync(JSON_BACKUP_PATH)) {
    try {
      seedSource = JSON.parse(fs.readFileSync(JSON_BACKUP_PATH, 'utf-8'));
    } catch {}
  }

  // 1. Seed users
  if (userCount === 0) {
    const usersToInsert = (seedSource && Array.isArray(seedSource.users) && seedSource.users.length > 0)
      ? seedSource.users
      : INITIAL_USERS;

    const stmt = db.prepare('INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const u of usersToInsert) {
      stmt.run(
        u.id,
        u.name,
        u.email,
        u.passwordHash || '',
        u.role || 'user',
        u.authProvider || 'email',
        u.targetRole || '',
        u.englishLevel || '',
        u.city || '',
        u.avatar || '',
        u.githubUrl || '',
        u.bio || '',
        JSON.stringify(u.skills || []),
        JSON.stringify(u.skillLevels || {}),
        u.createdAt || new Date().toISOString()
      );
    }
  }

  // 2. Seed skills
  if (skillCount === 0) {
    const skillsToInsert = (seedSource && Array.isArray(seedSource.skills) && seedSource.skills.length > 0)
      ? seedSource.skills
      : DEFAULT_SKILLS;

    const stmt = db.prepare('INSERT OR REPLACE INTO skills VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const s of skillsToInsert) {
      stmt.run(
        s.id,
        s.name,
        s.category || 'Загальне',
        s.overallDemand || 0,
        JSON.stringify(s.platformDemand || {}),
        JSON.stringify(s.levels || DEFAULT_LEVEL_LABELS),
        s.timeToLearn || '',
        s.description || '',
        JSON.stringify(s.resources || []),
        new Date().toISOString(),
        new Date().toISOString()
      );
    }
  }

  // 3. Seed vacancies
  if (vacCount === 0) {
    const vacsToInsert = (seedSource && Array.isArray(seedSource.vacancies) && seedSource.vacancies.length > 0)
      ? seedSource.vacancies
      : DEFAULT_VACANCIES;

    const stmt = db.prepare('INSERT OR REPLACE INTO vacancies VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const v of vacsToInsert) {
      stmt.run(
        v.id,
        v.title,
        v.company,
        v.platform,
        v.url || '',
        v.salary || '',
        v.location || '',
        v.direction || '',
        v.postedAgo || '',
        v.description || v.summary || '',
        JSON.stringify(v.requiredSkills || []),
        JSON.stringify(v.optionalSkills || []),
        v.source || '',
        v.postedAt || '',
        v.createdAt || new Date().toISOString()
      );
    }
  }

  // 4. Seed roadmaps
  if (roadmapCount === 0) {
    const stmt = db.prepare('INSERT OR REPLACE INTO roadmaps VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const r of DEFAULT_ROADMAPS) {
      stmt.run(
        r.id,
        r.name,
        r.badge || '',
        r.color || '',
        r.description || '',
        r.estimatedTotalTime || '',
        r.estimatedTotalHours || '',
        JSON.stringify(r.primaryRoles || []),
        JSON.stringify(r.nodes || []),
        new Date().toISOString(),
        new Date().toISOString()
      );
    }
  }
}

// ================= DEMAND CALCULATION =================

export function recalculateSkillsDemand(dbData) {
  if (!dbData || !Array.isArray(dbData.skills) || !Array.isArray(dbData.vacancies)) return;
  const platforms = ['Djinni', 'DOU', 'Work.ua', 'Robota.ua'];
  const totalVacancies = dbData.vacancies.length;

  dbData.skills.forEach((skill) => {
    const mentionedIn = dbData.vacancies.filter(
      (v) =>
        (Array.isArray(v.requiredSkills) && v.requiredSkills.includes(skill.id)) ||
        (Array.isArray(v.optionalSkills) && v.optionalSkills.includes(skill.id))
    );

    skill.overallDemand = totalVacancies > 0 ? Math.round((mentionedIn.length / totalVacancies) * 100) : 0;

    const pDemand = {};
    platforms.forEach((pName) => {
      const platVacancies = dbData.vacancies.filter((v) => v.platform === pName);
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

// ================= HIGH-LEVEL API =================

export function loadDb() {
  const db = getSqliteDb();

  const users = db.prepare('SELECT * FROM users').all().map(rowToUser);
  const skills = db.prepare('SELECT * FROM skills').all().map(rowToSkill);
  const vacancies = db.prepare('SELECT * FROM vacancies').all().map(rowToVacancy);
  const roadmaps = db.prepare('SELECT * FROM roadmaps').all().map(rowToRoadmap);

  const dbData = { users, skills, vacancies, roadmaps };
  recalculateSkillsDemand(dbData);
  return dbData;
}

export function saveDb(data) {
  const db = getSqliteDb();
  recalculateSkillsDemand(data);

  // Sync to SQLite tables in a transaction
  db.exec('BEGIN IMMEDIATE;');
  try {
    if (Array.isArray(data.users)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO users VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const u of data.users) {
        stmt.run(
          u.id,
          u.name,
          u.email,
          u.passwordHash || '',
          u.role || 'user',
          u.authProvider || 'email',
          u.targetRole || '',
          u.englishLevel || '',
          u.city || '',
          u.avatar || '',
          u.githubUrl || '',
          u.bio || '',
          JSON.stringify(u.skills || []),
          JSON.stringify(u.skillLevels || {}),
          u.createdAt || new Date().toISOString()
        );
      }
    }

    if (Array.isArray(data.skills)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO skills VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const s of data.skills) {
        stmt.run(
          s.id,
          s.name,
          s.category || 'Загальне',
          s.overallDemand || 0,
          JSON.stringify(s.platformDemand || {}),
          JSON.stringify(s.levels || DEFAULT_LEVEL_LABELS),
          s.timeToLearn || '',
          s.description || '',
          JSON.stringify(s.resources || []),
          s.createdAt || new Date().toISOString(),
          new Date().toISOString()
        );
      }
    }

    if (Array.isArray(data.vacancies)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO vacancies VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const v of data.vacancies) {
        stmt.run(
          v.id,
          v.title,
          v.company,
          v.platform,
          v.url || '',
          v.salary || '',
          v.location || '',
          v.direction || '',
          v.postedAgo || '',
          v.description || v.summary || '',
          JSON.stringify(v.requiredSkills || []),
          JSON.stringify(v.optionalSkills || []),
          v.source || '',
          v.postedAt || '',
          v.createdAt || new Date().toISOString()
        );
      }
    }

    if (Array.isArray(data.roadmaps)) {
      const stmt = db.prepare('INSERT OR REPLACE INTO roadmaps VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const r of data.roadmaps) {
        stmt.run(
          r.id,
          r.name,
          r.badge || '',
          r.color || '',
          r.description || '',
          r.estimatedTotalTime || '',
          r.estimatedTotalHours || '',
          JSON.stringify(r.primaryRoles || []),
          JSON.stringify(r.nodes || []),
          r.createdAt || new Date().toISOString(),
          new Date().toISOString()
        );
      }
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('Failed to save to SQLite database:', err);
    throw err;
  }

  // Backup to JSON for portable inspection
  try {
    fs.writeFileSync(JSON_BACKUP_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write JSON backup:', err);
  }
}

export function getDatabaseStats() {
  const db = getSqliteDb();
  let fileSize = 0;
  try {
    fileSize = fs.statSync(SQLITE_DB_PATH).size;
  } catch {}

  return {
    engine: 'SQLite 3 (Relational Database)',
    path: SQLITE_DB_PATH,
    fileSize,
    fileSizeFormatted: `${(fileSize / 1024).toFixed(1)} KB`,
    tables: {
      users: db.prepare('SELECT count(*) as c FROM users').get().c,
      roadmaps: db.prepare('SELECT count(*) as c FROM roadmaps').get().c,
      skills: db.prepare('SELECT count(*) as c FROM skills').get().c,
      vacancies: db.prepare('SELECT count(*) as c FROM vacancies').get().c,
    },
  };
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
