import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Circle,
  BookOpen,
  GraduationCap,
  Code2,
  BarChart3,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Clock,
  Building2,
  MapPin,
  Wallet,
  Scale,
  Layers,
  Filter,
  User,
  Shield,
  LogOut,
  LogIn,
  Mail,
  KeyRound,
  Users,
  Trash2,
  RefreshCw,
  Save,
  Award,
  Globe,
  PlusCircle,
  Sliders,
  Flame,
  Edit3,
  GitBranch,
  Loader2
} from 'lucide-react';
import SkillRoadmapTree from './components/SkillRoadmapTree';
import {
  SKILLS as DEFAULT_SKILLS,
  VACANCIES as DEFAULT_VACANCIES,
  PLATFORMS,
  SKILL_CATEGORIES,
} from './data/mockData';

const RESOURCE_ICONS = {
  book: { icon: BookOpen, label: 'Книга / Дока', badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  course: { icon: GraduationCap, label: 'Курс / Відео', badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  practice: { icon: Code2, label: 'Тренажер / Практика', badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

const PROVIDER_BADGE = {
  google: { label: 'Google', color: 'bg-red-500/15 text-red-300 border-red-500/30' },
  github: { label: 'GitHub', color: 'bg-slate-700/60 text-slate-200 border-slate-600' },
  email: { label: 'Email', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' },
};

const COMPARE_PALETTE = [
  { bar: 'bg-indigo-500', text: 'text-indigo-400', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40' },
  { bar: 'bg-cyan-400', text: 'text-cyan-400', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' },
  { bar: 'bg-emerald-400', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
  { bar: 'bg-amber-400', text: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  { bar: 'bg-rose-400', text: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/40' },
  { bar: 'bg-purple-400', text: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
];

const DEFAULT_LEVELS = ['Базовий', 'Просунутий', 'Бог'];

export default function App() {
  // Динамічний каталог скілів та вакансій із бази даних
  const [skillsList, setSkillsList] = useState(DEFAULT_SKILLS);
  const [vacanciesList, setVacanciesList] = useState(DEFAULT_VACANCIES);

  // Модальне вікно додавання нового скіла (ТІЛЬКИ ДЛЯ АДМІНА, без ручних відсотків!)
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [addSkillError, setAddSkillError] = useState('');
  const [newSkillForm, setNewSkillForm] = useState({
    name: '',
    category: 'Мова програмування',
    levelsText: 'Базовий, Просунутий, Бог',
    timeToLearn: '2–3 тижні',
    description: '',
    resType: 'course',
    resTitle: '',
    resUrl: '',
    resLang: 'UA',
    resFree: true,
    attachToVacancies: [],
  });

  // Стан для ОКРЕМОЇ СТОРІНКИ РЕДАГУВАННЯ СКІЛІВ (Вкладка 'skill-editor')
  const [editorSkillId, setEditorSkillId] = useState('sql');
  const [editorForm, setEditorForm] = useState({
    id: 'sql',
    name: '',
    category: '',
    levelsText: '',
    timeToLearn: '',
    description: '',
    resources: [],
    requiredInVacancies: [],
    optionalInVacancies: [],
  });
  const [editorSavedMsg, setEditorSavedMsg] = useState('');

  // Авторизація та юзер
  const [token, setToken] = useState(() => localStorage.getItem('nubhub_token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    targetRole: 'Junior Frontend Developer',
    englishLevel: 'B1 (Intermediate)',
    city: 'Київ',
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    targetRole: '',
    englishLevel: '',
    city: '',
    githubUrl: '',
    bio: '',
  });
  const [profileSavedMsg, setProfileSavedMsg] = useState('');

  // Навички поточного юзера та їхні рівні (рівні використовуються ТІЛЬКИ в профілі)
  const [mySkills, setMySkills] = useState(['html-css', 'sql', 'git']);
  const [mySkillLevels, setMySkillLevels] = useState({
    'html-css': 'Просунутий',
    sql: 'Базовий',
    git: 'Базовий',
  });

  // Активна вкладка: 'vacancies' | 'skills' | 'compare' | 'profile' | 'skill-editor' | 'admin'
  const [activeTab, setActiveTab] = useState('vacancies');

  const [selectedVacancyId, setSelectedVacancyId] = useState(DEFAULT_VACANCIES[0].id);
  const [platformFilter, setPlatformFilter] = useState('ALL');
  const [selectedSkillId, setSelectedSkillId] = useState('sql');

  // Мульти-порівнялка скілів в межах ОДНІЄЇ категорії (властивості скіла)
  const [compareCategory, setCompareCategory] = useState('Бази даних');
  const [compareSkillIds, setCompareSkillIds] = useState(['sql', 'postgresql', 'mysql', 'mongodb']);

  const isAdmin = currentUser?.role === 'admin';

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (Array.isArray(data.skills)) setSkillsList(data.skills);
      if (Array.isArray(data.vacancies)) setVacanciesList(data.vacancies);
    } catch (e) {
      console.error('Failed to load catalog:', e);
    }
  };

  const fetchDemoUsers = async () => {
    try {
      const res = await fetch('/api/users/demo-list');
      const data = await res.json();
      if (data.users) setAllUsers(data.users);
    } catch (err) {
      console.error('Failed to load users list:', err);
    }
  };

  useEffect(() => {
    fetchCatalog();
    fetchDemoUsers();
  }, []);

  useEffect(() => {
    if (!token) {
      setCurrentUser(null);
      return;
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          setMySkills(data.user.skills || []);
          setMySkillLevels(data.user.skillLevels || {});
          setProfileForm({
            name: data.user.name || '',
            targetRole: data.user.targetRole || '',
            englishLevel: data.user.englishLevel || 'B1 (Intermediate)',
            city: data.user.city || '',
            githubUrl: data.user.githubUrl || '',
            bio: data.user.bio || '',
          });
        }
      })
      .catch(() => {
        localStorage.removeItem('nubhub_token');
        setToken('');
        setCurrentUser(null);
      });
  }, [token]);

  const skillsMap = useMemo(() => {
    const map = {};
    skillsList.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [skillsList]);

  // Заповнення форми редактора скілів при виборі скіла
  useEffect(() => {
    const sk = skillsMap[editorSkillId] || skillsList[0];
    if (!sk) return;
    const reqVacs = vacanciesList
      .filter((v) => Array.isArray(v.requiredSkills) && v.requiredSkills.includes(sk.id))
      .map((v) => v.id);
    const optVacs = vacanciesList
      .filter((v) => Array.isArray(v.optionalSkills) && v.optionalSkills.includes(sk.id))
      .map((v) => v.id);

    setEditorForm({
      id: sk.id,
      name: sk.name || '',
      category: sk.category || 'Мова програмування',
      levelsText: (Array.isArray(sk.levels) && sk.levels.length > 0 ? sk.levels : DEFAULT_LEVELS).join(', '),
      timeToLearn: sk.timeToLearn || '',
      description: sk.description || '',
      resources: Array.isArray(sk.resources) ? JSON.parse(JSON.stringify(sk.resources)) : [],
      requiredInVacancies: reqVacs,
      optionalInVacancies: optVacs,
    });
  }, [editorSkillId, skillsMap, skillsList, vacanciesList]);

  // Доступні категорії (властивості скілів)
  const availableCategories = useMemo(() => {
    const set = new Set(SKILL_CATEGORIES);
    skillsList.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [skillsList]);

  // Скіли обраної категорії у Порівнялці
  const categorySkills = useMemo(
    () => skillsList.filter((s) => s.category === compareCategory),
    [skillsList, compareCategory]
  );

  const handleSelectCompareCategory = (cat) => {
    setCompareCategory(cat);
    const inCat = skillsList.filter((s) => s.category === cat).map((s) => s.id);
    setCompareSkillIds(inCat);
  };

  const toggleCompareSkill = (skillId) => {
    setCompareSkillIds((prev) => {
      if (prev.includes(skillId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== skillId);
      }
      return [...prev, skillId];
    });
  };

  // Додавання нового скіла (ТІЛЬКИ ДЛЯ АДМІНІВ, відсотки рахуються АВТОМАТИЧНО!)
  const handleCreateSkill = async (e) => {
    e.preventDefault();
    setAddSkillError('');
    try {
      const resources = [];
      if (newSkillForm.resTitle.trim()) {
        resources.push({
          type: newSkillForm.resType,
          title: newSkillForm.resTitle.trim(),
          url:
            newSkillForm.resUrl.trim() ||
            `https://www.google.com/search?q=${encodeURIComponent(newSkillForm.name + ' ' + newSkillForm.resTitle)}`,
          lang: newSkillForm.resLang,
          free: newSkillForm.resFree,
        });
      }

      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newSkillForm,
          resources,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAddSkillError(data.error || 'Не вдалося додати скіл');
        return;
      }
      if (data.skills) setSkillsList(data.skills);
      if (data.vacancies) setVacanciesList(data.vacancies);
      if (data.skill) {
        setSelectedSkillId(data.skill.id);
        setEditorSkillId(data.skill.id);
        if (data.skill.category === compareCategory) {
          setCompareSkillIds((prev) => [...prev, data.skill.id]);
        }
      }
      setIsAddSkillOpen(false);
      setNewSkillForm({
        name: '',
        category: 'Мова програмування',
        levelsText: 'Базовий, Просунутий, Бог',
        timeToLearn: '2–3 тижні',
        description: '',
        resType: 'course',
        resTitle: '',
        resUrl: '',
        resLang: 'UA',
        resFree: true,
        attachToVacancies: [],
      });
    } catch {
      setAddSkillError('Помилка з’єднання з сервером');
    }
  };

  // Збереження відредагованого скіла на окремій сторінці Редактора скілів
  const handleSaveEditedSkill = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const res = await fetch('/api/skills', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(editorForm),
    });
    const data = await res.json();
    if (res.ok) {
      if (data.skills) setSkillsList(data.skills);
      if (data.vacancies) setVacanciesList(data.vacancies);
      setEditorSavedMsg('Зміни скіла та автоматичні % попиту успішно збережено!');
      setTimeout(() => setEditorSavedMsg(''), 3500);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    const res = await fetch(`/api/skills?id=${encodeURIComponent(skillId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.skills) {
      setSkillsList(data.skills);
      if (editorSkillId === skillId && data.skills.length > 0) {
        setEditorSkillId(data.skills[0].id);
      }
    }
    if (data.vacancies) setVacanciesList(data.vacancies);
  };

  const toggleMySkill = async (skillId) => {
    const isRemoving = mySkills.includes(skillId);
    const updatedSkills = isRemoving
      ? mySkills.filter((id) => id !== skillId)
      : [...mySkills, skillId];

    const updatedLevels = { ...mySkillLevels };
    if (!isRemoving && !updatedLevels[skillId]) {
      const skObj = skillsMap[skillId];
      updatedLevels[skillId] = skObj?.levels?.[0] || 'Базовий';
    }

    setMySkills(updatedSkills);
    setMySkillLevels(updatedLevels);

    if (token && currentUser) {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skills: updatedSkills, skillLevels: updatedLevels }),
        });
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          fetchDemoUsers();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSetUserSkillLevel = async (skillId, levelName) => {
    const updatedLevels = { ...mySkillLevels, [skillId]: levelName };
    setMySkillLevels(updatedLevels);

    if (token && currentUser) {
      try {
        const res = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ skillLevels: updatedLevels }),
        });
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          fetchDemoUsers();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const quickSwitchUser = async (userId) => {
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.token && data.user) {
        localStorage.setItem('nubhub_token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setMySkills(data.user.skills || []);
        setMySkillLevels(data.user.skillLevels || {});
        setProfileForm({
          name: data.user.name || '',
          targetRole: data.user.targetRole || '',
          englishLevel: data.user.englishLevel || 'B1 (Intermediate)',
          city: data.user.city || '',
          githubUrl: data.user.githubUrl || '',
          bio: data.user.bio || '',
        });
        setIsAuthModalOpen(false);
        if (data.user.role !== 'admin' && (activeTab === 'admin' || activeTab === 'skill-editor')) {
          setActiveTab('profile');
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Помилка авторизації');
        return;
      }
      localStorage.setItem('nubhub_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setMySkills(data.user.skills || []);
      setMySkillLevels(data.user.skillLevels || {});
      setIsAuthModalOpen(false);
      fetchDemoUsers();
    } catch {
      setAuthError('Помилка з’єднання з сервером');
    }
  };

  const handleOAuthLogin = async (provider, customEmail, customName) => {
    setAuthError('');
    try {
      const res = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email: customEmail,
          name: customName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Помилка OAuth');
        return;
      }
      localStorage.setItem('nubhub_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setMySkills(data.user.skills || []);
      setMySkillLevels(data.user.skillLevels || {});
      setIsAuthModalOpen(false);
      fetchDemoUsers();
    } catch {
      setAuthError('Помилка OAuth авторизації');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nubhub_token');
    setToken('');
    setCurrentUser(null);
    if (activeTab === 'profile' || activeTab === 'admin' || activeTab === 'skill-editor') {
      setActiveTab('vacancies');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!token) return;
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...profileForm, skills: mySkills, skillLevels: mySkillLevels }),
    });
    const data = await res.json();
    if (data.user) {
      setCurrentUser(data.user);
      fetchDemoUsers();
      setProfileSavedMsg('Профіль та рівні скілів успішно збережено!');
      setTimeout(() => setProfileSavedMsg(''), 3000);
    }
  };

  const handleAdminDeleteUser = async (userId) => {
    const res = await fetch(`/api/admin/users?id=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.users) setAllUsers(data.users);
  };

  const handleAdminToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const res = await fetch('/api/admin/users/role', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user.id, role: newRole }),
    });
    const data = await res.json();
    if (data.users) setAllUsers(data.users);
  };

  const handleAdminResetSeed = async () => {
    const res = await fetch('/api/admin/reset-seed', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.users) setAllUsers(data.users);
    if (data.skills) setSkillsList(data.skills);
    if (data.vacancies) setVacanciesList(data.vacancies);
  };

  const filteredVacancies = useMemo(() => {
    if (platformFilter === 'ALL') return vacanciesList;
    return vacanciesList.filter((v) => v.platform === platformFilter);
  }, [platformFilter, vacanciesList]);

  // Ліниве завантаження вакансій (Lazy Load)
  const [visibleVacanciesCount, setVisibleVacanciesCount] = useState(12);
  const vacancySentinelRef = React.useRef(null);

  // Скидання кількості відображених вакансій при зміні фільтра платформи
  useEffect(() => {
    setVisibleVacanciesCount(12);
  }, [platformFilter]);

  const displayedVacancies = useMemo(() => {
    return filteredVacancies.slice(0, visibleVacanciesCount);
  }, [filteredVacancies, visibleVacanciesCount]);

  // Автоматичне довантаження при скролі через IntersectionObserver
  useEffect(() => {
    if (activeTab !== 'vacancies') return;
    const el = vacancySentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleVacanciesCount((prev) => {
            if (prev < filteredVacancies.length) {
              return Math.min(prev + 10, filteredVacancies.length);
            }
            return prev;
          });
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [activeTab, filteredVacancies.length, visibleVacanciesCount]);

  const selectedVacancy = useMemo(
    () => vacanciesList.find((v) => v.id === selectedVacancyId) || vacanciesList[0],
    [selectedVacancyId, vacanciesList]
  );

  const selectedSkill = useMemo(
    () => skillsMap[selectedSkillId] || skillsList[0],
    [selectedSkillId, skillsMap, skillsList]
  );

  const getVacancyMatch = (vacancy) => {
    const totalReq = vacancy.requiredSkills.length;
    if (totalReq === 0) return { percent: 100, matched: [], missing: [] };
    const matched = vacancy.requiredSkills.filter((id) => mySkills.includes(id));
    const missing = vacancy.requiredSkills.filter((id) => !mySkills.includes(id));
    const percent = Math.round((matched.length / totalReq) * 100);
    return { percent, matched, missing };
  };

  const getPlatformBadge = (platformName) => {
    const p = PLATFORMS.find((item) => item.id === platformName);
    return p ? p.color : 'bg-slate-700 text-slate-200';
  };

  const getLevelBadgeStyle = (levelIndex, total) => {
    if (levelIndex === total - 1 && total > 1) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/10';
    }
    if (levelIndex > 0) {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50';
    }
    return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
  };

  // Попередній перегляд автоматичних % під час редагування скіла
  const liveEditorStats = useMemo(() => {
    const total = vacanciesList.length;
    const mentionedIds = new Set([...editorForm.requiredInVacancies, ...editorForm.optionalInVacancies]);
    const overall = total > 0 ? Math.round((mentionedIds.size / total) * 100) : 0;
    const byPlat = {};
    PLATFORMS.forEach((p) => {
      const pVacs = vacanciesList.filter((v) => v.platform === p.id);
      const pCount = pVacs.filter((v) => mentionedIds.has(v.id)).length;
      byPlat[p.id] = pVacs.length > 0 ? Math.round((pCount / pVacs.length) * 100) : 0;
    });
    return { overall, byPlat, count: mentionedIds.size, total };
  }, [editorForm.requiredInVacancies, editorForm.optionalInVacancies, vacanciesList]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* ПАНЕЛЬ ШВИДКОГО ПЕРЕМИКАННЯ (1 АДМІН + 10 ЮЗЕРІВ) */}
      <div className="bg-indigo-950/60 border-b border-indigo-500/20 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-indigo-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Швидке перемикання профілів (1 Адмін + 10 Джунів):
            </span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => {
                if (e.target.value) quickSwitchUser(e.target.value);
              }}
              className="bg-slate-900 border border-indigo-500/40 rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-indigo-400"
            >
              <option value="">-- Обери акаунт для миттєвого входу --</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.role === 'admin' ? '👑 [ADMIN] ' : '👤 '}
                  {u.name} ({u.authProvider.toUpperCase()} • {u.skills.length} скілів)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-300">
                  Ви увійшли як: <strong className="text-white">{currentUser.name}</strong>
                </span>
                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>
            ) : (
              <span className="text-slate-400">Гостьовий режим (увійдіть, щоб зберігати прогрес у БД)</span>
            )}
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 font-black text-slate-950 text-xl">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">NubHub</h1>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                    UA Junior Navigator
                  </span>
                </div>
                <p className="text-xs text-slate-400">Djinni • DOU • Work.ua • Robota.ua</p>
              </div>
            </div>

            <div className="xl:hidden">
              {currentUser ? (
                <button
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full bg-slate-700" />
                  <span>{currentUser.name.split(' ')[0]}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-xl text-xs font-semibold"
                >
                  Увійти
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex flex-wrap gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('vacancies')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'vacancies'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Вакансія ➔ Скіли</span>
              </button>

              <button
                onClick={() => setActiveTab('skills')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'skills'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Скіл ➔ Вакансії</span>
              </button>

              <button
                onClick={() => setActiveTab('compare')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'compare'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Порівнялка</span>
              </button>

              <button
                onClick={() => setActiveTab('tree')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'tree'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <GitBranch className="w-4 h-4" />
                <span>Дерево навичок & Роадмапи</span>
              </button>

              {currentUser && (
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Мій Профіль & Рівні</span>
                </button>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab('skill-editor')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === 'skill-editor'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                        : 'text-amber-300 hover:bg-amber-500/15 border border-amber-500/30'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Редактор скілів ({skillsList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      activeTab === 'admin'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                        : 'text-amber-300 hover:bg-amber-500/15 border border-amber-500/30'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Юзери ({allUsers.length})</span>
                  </button>
                </>
              )}
            </nav>

            <div className="hidden xl:flex items-center gap-2.5">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-white leading-none flex items-center gap-1.5">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{currentUser.targetRole}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Вийти"
                    className="ml-2 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Увійти / Реєстрація</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ПАНЕЛЬ "МІЙ СТЕК" */}
      <section className="bg-slate-900/40 border-b border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-slate-200">
                {currentUser
                  ? `Арсенал скілів профілю «${currentUser.name}» (% біля скілів рахується автоматично з вакансій!):`
                  : 'Твій поточний арсенал скілів (клікай, що вже знаєш):'}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">
                Вивчено навичок: <strong className="text-emerald-400">{mySkills.length}</strong> з{' '}
                {skillsList.length}
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setAddSkillError('');
                    setIsAddSkillOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>👑 Додати скіл (Admin)</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill) => {
              const isSelected = mySkills.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  onClick={() => toggleMySkill(skill.id)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200 shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                  )}
                  <span>{skill.name}</span>
                  <span className="text-[10px] opacity-60 ml-0.5">({skill.overallDemand}%)</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* ================= ОКРЕМА СТОРІНКА: РЕДАКТОР СКІЛІВ (ТІЛЬКИ ДЛЯ АДМІНІВ) ================= */}
        {activeTab === 'skill-editor' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Ліва колонка: список усіх скілів для вибору */}
            <div className="lg:col-span-4 bg-slate-900/70 border border-amber-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    Обери скіл для редагування
                  </h3>
                  <p className="text-[11px] text-slate-400">Всього у базі: {skillsList.length} скілів</p>
                </div>
                <button
                  onClick={() => {
                    setAddSkillError('');
                    setIsAddSkillOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 hover:bg-amber-400 transition"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Новий
                </button>
              </div>

              <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
                {skillsList.map((sk) => {
                  const active = sk.id === editorSkillId;
                  return (
                    <div
                      key={sk.id}
                      onClick={() => setEditorSkillId(sk.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        active
                          ? 'bg-indigo-600/25 border-indigo-500 text-white'
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{sk.name}</div>
                        <div className="text-[11px] text-slate-400">{sk.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-indigo-300 border border-slate-800">
                          {sk.overallDemand}%
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSkill(sk.id);
                          }}
                          title="Видалити скіл"
                          className="p-1 rounded text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Права колонка: Повна форма редагування обраного скіла */}
            <div className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Сторінка редагування скіла (ID: {editorForm.id})
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-0.5">{editorForm.name}</h2>
                </div>

                {/* Live-блок автоматично розрахованого попиту */}
                <div className="bg-slate-950 border border-indigo-500/40 rounded-xl px-4 py-2.5 text-right">
                  <div className="text-xs text-slate-400">Авто-розрахунок попиту з вакансій:</div>
                  <div className="text-lg font-black text-indigo-400">
                    {liveEditorStats.overall}% вакансій ({liveEditorStats.count} з {liveEditorStats.total})
                  </div>
                  <div className="text-[11px] text-slate-400 flex gap-2 justify-end mt-0.5">
                    {PLATFORMS.map((p) => (
                      <span key={p.id}>
                        {p.name}: <strong className="text-slate-200">{liveEditorStats.byPlat[p.id]}%</strong>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveEditedSkill} className="space-y-5 text-xs">
                {/* Основні поля */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Назва скіла</label>
                    <input
                      type="text"
                      required
                      value={editorForm.name}
                      onChange={(e) => setEditorForm({ ...editorForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Категорія (властивість для порівнялки)
                    </label>
                    <select
                      value={editorForm.category}
                      onChange={(e) => setEditorForm({ ...editorForm, category: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      {availableCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">
                      Час на вивчення
                    </label>
                    <input
                      type="text"
                      value={editorForm.timeToLearn}
                      onChange={(e) => setEditorForm({ ...editorForm, timeToLearn: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Налаштування рівнів скіла */}
                <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
                  <label className="block text-amber-300 font-semibold">
                    ⚡ Градація рівнів скіла у профілі користувача (через кому):
                  </label>
                  <input
                    type="text"
                    value={editorForm.levelsText}
                    onChange={(e) => setEditorForm({ ...editorForm, levelsText: e.target.value })}
                    placeholder="Базовий, Просунутий, Бог"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Опис скіла */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Опис скіла для джунів
                  </label>
                  <textarea
                    rows={2}
                    value={editorForm.description}
                    onChange={(e) => setEditorForm({ ...editorForm, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Редагування навчальних ресурсів (Книги, Курси, Тренажери) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300 text-sm">
                      📚 Навчальні ресурси цього скіла ({editorForm.resources.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditorForm({
                          ...editorForm,
                          resources: [
                            ...editorForm.resources,
                            { type: 'course', title: '', url: '', lang: 'UA', free: true },
                          ],
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 border border-indigo-500/40 font-semibold"
                    >
                      + Додати ресурс
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {editorForm.resources.map((res, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <select
                          value={res.type}
                          onChange={(e) => {
                            const updated = [...editorForm.resources];
                            updated[idx].type = e.target.value;
                            setEditorForm({ ...editorForm, resources: updated });
                          }}
                          className="sm:col-span-3 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white"
                        >
                          <option value="book">Книга / Дока</option>
                          <option value="course">Курс / Відео</option>
                          <option value="practice">Тренажер</option>
                        </select>

                        <input
                          type="text"
                          placeholder="Назва матеріалу"
                          value={res.title}
                          onChange={(e) => {
                            const updated = [...editorForm.resources];
                            updated[idx].title = e.target.value;
                            setEditorForm({ ...editorForm, resources: updated });
                          }}
                          className="sm:col-span-4 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                        />

                        <input
                          type="text"
                          placeholder="URL (https://...)"
                          value={res.url}
                          onChange={(e) => {
                            const updated = [...editorForm.resources];
                            updated[idx].url = e.target.value;
                            setEditorForm({ ...editorForm, resources: updated });
                          }}
                          className="sm:col-span-3 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                        />

                        <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                          <select
                            value={res.lang || 'UA'}
                            onChange={(e) => {
                              const updated = [...editorForm.resources];
                              updated[idx].lang = e.target.value;
                              setEditorForm({ ...editorForm, resources: updated });
                            }}
                            className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-white"
                          >
                            <option value="UA">UA</option>
                            <option value="EN">EN</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = editorForm.resources.filter((_, i) => i !== idx);
                              setEditorForm({ ...editorForm, resources: updated });
                            }}
                            className="p-1.5 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/25"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Прив'язка до вакансій (саме звідси автоматично рахуються відсотки попиту!) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div>
                    <span className="font-bold text-emerald-300 text-sm block">
                      💼 У яких вакансіях потрібен цей скіл? (Формує автоматичний % попиту по платформах)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Відмічай вакансії галочками — і система сама вирахує відсоток попиту загалом та для Djinni, DOU, Work.ua, Robota.ua!
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {vacanciesList.map((vac) => {
                      const isReq = editorForm.requiredInVacancies.includes(vac.id);
                      return (
                        <label
                          key={vac.id}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition ${
                            isReq
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isReq}
                            onChange={() => {
                              const next = isReq
                                ? editorForm.requiredInVacancies.filter((id) => id !== vac.id)
                                : [...editorForm.requiredInVacancies, vac.id];
                              setEditorForm({ ...editorForm, requiredInVacancies: next });
                            }}
                          />
                          <div className="truncate">
                            <span className="font-bold text-indigo-300">[{vac.platform}]</span>{' '}
                            <span className="font-medium">{vac.title}</span>
                            <span className="block text-[10px] text-slate-500">{vac.company}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {editorSavedMsg ? (
                    <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {editorSavedMsg}
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Усі зміни одразу оновлюють каталог, вакансії та порівнялку.
                    </span>
                  )}

                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition"
                  >
                    <Save className="w-4 h-4" />
                    Зберегти зміни скіла
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= ВКЛАДКА ПРОФІЛЮ КОРИСТУВАЧА + РІВНІ СКІЛІВ ================= */}
        {activeTab === 'profile' && currentUser && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                  </div>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded border font-medium ${
                        PROVIDER_BADGE[currentUser.authProvider]?.color || PROVIDER_BADGE.email.color
                      }`}
                    >
                      Вхід через: {PROVIDER_BADGE[currentUser.authProvider]?.label || 'Email'}
                    </span>
                    {isAdmin && (
                      <span className="text-[11px] px-2 py-0.5 rounded border bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold">
                        👑 Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Цільова позиція:</span>
                  <span className="font-semibold text-indigo-300">{currentUser.targetRole}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Рівень англійської:</span>
                  <span className="font-semibold text-emerald-300">{currentUser.englishLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Місто:</span>
                  <span className="font-semibold text-slate-200">{currentUser.city}</span>
                </div>
                {currentUser.githubUrl && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">GitHub:</span>
                    <a
                      href={currentUser.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 hover:underline truncate max-w-[180px]"
                    >
                      {currentUser.githubUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  Найкращі вакансії для твого профілю:
                </h4>
                {vacanciesList
                  .map((v) => ({ vac: v, match: getVacancyMatch(v) }))
                  .sort((a, b) => b.match.percent - a.match.percent)
                  .slice(0, 3)
                  .map(({ vac, match }) => (
                    <div
                      key={vac.id}
                      onClick={() => {
                        setSelectedVacancyId(vac.id);
                        setActiveTab('vacancies');
                      }}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{vac.title}</div>
                        <div className="text-[11px] text-slate-400">
                          {vac.platform} • {vac.company}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                        {match.percent}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/70 border border-indigo-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-400" />
                      Мої навички за рівнями (Базовий • Просунутий • Бог)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Обери свій поточний рівень для кожного вивченого скіла. У матчах по вакансіях враховується сам факт наявності скіла, а рівні відображаються у твоєму профілі та згодом перевірятимуться тестами!
                    </p>
                  </div>
                </div>

                {mySkills.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                    Ти ще не обрав жодного скіла. Клікни по своїх навичках у верхній панелі!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {mySkills.map((sId) => {
                      const sk = skillsMap[sId];
                      if (!sk) return null;
                      const availableLevels =
                        Array.isArray(sk.levels) && sk.levels.length > 0 ? sk.levels : DEFAULT_LEVELS;
                      const currentLvl = mySkillLevels[sId] || availableLevels[0];

                      return (
                        <div
                          key={sId}
                          className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-sm text-white">{sk.name}</span>
                              <span className="text-[11px] text-slate-500 block">{sk.category}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              Тест: Незабаром 🧪
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                            {availableLevels.map((lvl, idx) => {
                              const active = currentLvl === lvl;
                              return (
                                <button
                                  key={lvl}
                                  type="button"
                                  onClick={() => handleSetUserSkillLevel(sId, lvl)}
                                  className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition truncate ${
                                    active
                                      ? getLevelBadgeStyle(idx, availableLevels.length) + ' border'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {idx === availableLevels.length - 1 && availableLevels.length > 1 ? '⚡ ' : ''}
                                  {lvl}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Особисті дані профілю</h3>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Ім'я та Прізвище
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Цільова роль (кого шукаєш)
                      </label>
                      <input
                        type="text"
                        value={profileForm.targetRole}
                        onChange={(e) => setProfileForm({ ...profileForm, targetRole: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Рівень англійської мови
                      </label>
                      <select
                        value={profileForm.englishLevel}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, englishLevel: e.target.value })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="A1 (Elementary)">A1 (Elementary)</option>
                        <option value="A2 (Pre-Intermediate)">A2 (Pre-Intermediate)</option>
                        <option value="B1 (Intermediate)">B1 (Intermediate)</option>
                        <option value="B2 (Upper-Intermediate)">B2 (Upper-Intermediate)</option>
                        <option value="C1 (Advanced)">C1 (Advanced)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Місто / Формат роботи
                      </label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Посилання на GitHub / Портфоліо
                    </label>
                    <input
                      type="text"
                      value={profileForm.githubUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, githubUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Коротко про себе / прогрес навчання
                    </label>
                    <textarea
                      rows={3}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {profileSavedMsg ? (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {profileSavedMsg}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Усі зміни миттєво зберігаються у серверній базі даних.
                      </span>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                    >
                      <Save className="w-4 h-4" />
                      Зберегти профіль
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ================= АДМІН-ПАНЕЛЬ КОРИСТУВАЧІВ ================= */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    <h2 className="text-xl font-bold text-white">
                      Управління користувачами ({allUsers.length})
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Перегляд профілів, методів авторизації та обраних рівнів скілів кожного користувача. Для редагування скілів перейди у вкладку «Редактор скілів».
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('skill-editor')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Відкрити Редактор скілів
                  </button>
                  <button
                    onClick={handleAdminResetSeed}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Скинути базу до початкового стану
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3">Користувач</th>
                      <th className="py-3 px-3">Метод входу</th>
                      <th className="py-3 px-3">Цільова роль & English</th>
                      <th className="py-3 px-3">Скіли та їхні рівні в профілі</th>
                      <th className="py-3 px-3">Роль</th>
                      <th className="py-3 px-3 text-right">Дії адміна</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-xs">
                    {allUsers.map((u) => {
                      const prov = PROVIDER_BADGE[u.authProvider] || PROVIDER_BADGE.email;
                      return (
                        <tr key={u.id} className="hover:bg-slate-950/50 transition">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={u.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                              />
                              <div>
                                <div className="font-bold text-white">{u.name}</div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded border text-[11px] font-medium ${prov.color}`}>
                              {prov.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="text-slate-200 font-medium">{u.targetRole}</div>
                            <div className="text-[11px] text-slate-400">
                              {u.englishLevel} • {u.city}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-sm">
                              {u.skills.map((sId) => {
                                const lvl = u.skillLevels?.[sId] || 'Базовий';
                                return (
                                  <span
                                    key={sId}
                                    className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] border border-slate-700"
                                  >
                                    {skillsMap[sId]?.name || sId}:{' '}
                                    <strong className="text-indigo-300">{lvl}</strong>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <button
                              onClick={() => handleAdminToggleRole(u)}
                              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${
                                u.role === 'admin'
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                              }`}
                            >
                              {u.role}
                            </button>
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => quickSwitchUser(u.id)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 font-medium"
                              >
                                Увійти як він
                              </button>
                              {u.id !== currentUser.id && (
                                <button
                                  onClick={() => handleAdminDeleteUser(u.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20"
                                  title="Видалити користувача"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= РЕЖИМ 1: ВАКАНСІЯ -> СКІЛИ + КНИГИ/КУРСИ ================= */}
        {activeTab === 'vacancies' && selectedVacancy && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-400" />
                  Вакансії для Джунів ({displayedVacancies.length} з {filteredVacancies.length})
                </h3>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => setPlatformFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                      platformFilter === 'ALL'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    Всі
                  </button>
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatformFilter(p.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        platformFilter === p.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {displayedVacancies.map((vac) => {
                  const { percent, matched } = getVacancyMatch(vac);
                  const isActive = vac.id === selectedVacancy.id;
                  return (
                    <div
                      key={vac.id}
                      onClick={() => setSelectedVacancyId(vac.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-900/95 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/50'
                          : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span
                            className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border mb-1.5 ${getPlatformBadge(
                              vac.platform
                            )}`}
                          >
                            {vac.platform}
                          </span>
                          <h4 className="font-bold text-slate-100 text-base leading-snug">{vac.title}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3.5 h-3.5" />
                            {vac.company} • {vac.location}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${
                              percent >= 75
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : percent >= 40
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {percent}% збіг
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-1">
                            {matched.length} з {vac.requiredSkills.length} скілів
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-800/70">
                        {vac.requiredSkills.map((sId) => {
                          const hasSkill = mySkills.includes(sId);
                          return (
                            <span
                              key={sId}
                              className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                hasSkill
                                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-300/90 border border-rose-500/20'
                              }`}
                            >
                              {hasSkill ? '✓ ' : '+ '}
                              {skillsMap[sId]?.name || sId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* ЕЛЕМЕНТИ ЛІНИВОГО ЗАВАНТАЖЕННЯ (LAZY LOAD SENTINEL & CONTROLS) */}
                {visibleVacanciesCount < filteredVacancies.length ? (
                  <div className="pt-2 space-y-2">
                    {/* IntersectionObserver Sentinel для автоматичного підвантаження при скролі */}
                    <div ref={vacancySentinelRef} className="h-6 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                        <span>Автоматичне завантаження при скролі...</span>
                      </div>
                    </div>

                    {/* Панель ручного керування підвантаженням */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span>
                          Показано <strong className="text-white">{displayedVacancies.length}</strong> з{' '}
                          <strong className="text-white">{filteredVacancies.length}</strong> вакансій
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setVisibleVacanciesCount((prev) => Math.min(prev + 10, filteredVacancies.length))}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition flex items-center gap-1"
                        >
                          +10 вакансій
                        </button>
                        <button
                          onClick={() => setVisibleVacanciesCount(filteredVacancies.length)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
                        >
                          Показати всі ({filteredVacancies.length})
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  filteredVacancies.length > 0 && (
                    <div className="pt-3 pb-1 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5 bg-slate-950/40 py-2.5 rounded-xl border border-slate-800/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Всі {filteredVacancies.length} вакансій завантажено</span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6">
              {(() => {
                const { percent, matched, missing } = getVacancyMatch(selectedVacancy);
                return (
                  <>
                    <div className="border-b border-slate-800 pb-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded border ${getPlatformBadge(
                              selectedVacancy.platform
                            )}`}
                          >
                            Платформа: {selectedVacancy.platform}
                          </span>
                          <span className="text-xs text-slate-400">{selectedVacancy.postedAgo}</span>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                          <Wallet className="w-3.5 h-3.5" />
                          {selectedVacancy.salary}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold text-white">{selectedVacancy.title}</h2>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {selectedVacancy.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {selectedVacancy.location}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 mt-3 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                        {selectedVacancy.summary}
                      </p>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-semibold text-slate-200">
                            Готовність ({currentUser ? currentUser.name : 'Гість'}):
                          </span>
                          <span className="font-bold text-indigo-400">
                            {percent}% ({matched.length} з {selectedVacancy.requiredSkills.length} обов'язкових навичок)
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                          Тобі не вистачає ({missing.length}) — де швидко вивчити:
                        </h3>
                      </div>

                      {missing.length === 0 ? (
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                          <div>
                            <strong>Вітаємо!</strong> Ти знаєш усі обов'язкові скіли для цієї вакансії. Можеш сміливо подавати резюме!
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {missing.map((skillId) => {
                            const skill = skillsMap[skillId];
                            if (!skill) return null;
                            return (
                              <div
                                key={skill.id}
                                className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-3"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-bold text-white text-base">{skill.name}</h4>
                                      <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                        Зустрічається у {skill.overallDemand}% вакансій
                                      </span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {skill.timeToLearn}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{skill.description}</p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {isAdmin && (
                                      <button
                                        onClick={() => {
                                          setEditorSkillId(skill.id);
                                          setActiveTab('skill-editor');
                                        }}
                                        className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30"
                                      >
                                        ✎ Редагувати
                                      </button>
                                    )}
                                    <button
                                      onClick={() => toggleMySkill(skill.id)}
                                      className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition"
                                    >
                                      + Відмітити як вивчене
                                    </button>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800/80">
                                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                    Рекомендовані матеріали для вивчення {skill.name}:
                                  </div>
                                  <div className="grid grid-cols-1 gap-2">
                                    {skill.resources.map((res, idx) => {
                                      const meta = RESOURCE_ICONS[res.type] || RESOURCE_ICONS.book;
                                      const IconComponent = meta.icon;
                                      return (
                                        <a
                                          key={idx}
                                          href={res.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/50 transition group"
                                        >
                                          <div className="flex items-center gap-2.5 min-w-0">
                                            <span
                                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border shrink-0 ${meta.badgeColor}`}
                                            >
                                              <IconComponent className="w-3 h-3" />
                                              {meta.label}
                                            </span>
                                            <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                                              {res.title}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                              {res.lang}
                                            </span>
                                            <span
                                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                res.free
                                                  ? 'bg-emerald-500/15 text-emerald-300'
                                                  : 'bg-amber-500/15 text-amber-300'
                                              }`}
                                            >
                                              {res.free ? 'Free' : 'Paid'}
                                            </span>
                                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                                          </div>
                                        </a>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {matched.length > 0 && (
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          Вже є у твоєму арсеналі ({matched.length}):
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {matched.map((skillId) => {
                            const skill = skillsMap[skillId];
                            if (!skill) return null;
                            return (
                              <div
                                key={skill.id}
                                className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col justify-between gap-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-sm text-emerald-200">
                                    ✓ {skill.name}
                                  </span>
                                  <span className="text-[11px] text-emerald-400/80">
                                    Попит: {skill.overallDemand}%
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {skill.resources.slice(0, 2).map((res, i) => (
                                    <a
                                      key={i}
                                      href={res.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 underline underline-offset-2"
                                    >
                                      {res.title.slice(0, 28)}...
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* ================= РЕЖИМ 2: СКІЛ -> КУДИ ПІДХОДИТЬ ================= */}
        {activeTab === 'skills' && selectedSkill && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-sm font-bold text-slate-200">Каталог скілів ({skillsList.length}):</h3>
                {isAdmin && (
                  <button
                    onClick={() => setIsAddSkillOpen(true)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Додати
                  </button>
                )}
              </div>
              <div className="space-y-1.5">
                {skillsList.map((skill) => {
                  const active = skill.id === selectedSkill.id;
                  return (
                    <button
                      key={skill.id}
                      onClick={() => setSelectedSkillId(skill.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition ${
                        active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800/70 border border-slate-800/70'
                      }`}
                    >
                      <div>
                        <span>{skill.name}</span>
                        <span className="block text-[11px] opacity-75">{skill.category}</span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          active ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-indigo-300'
                        }`}
                      >
                        {skill.overallDemand}% вакансій
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold">
                      {selectedSkill.category}
                    </span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <h2 className="text-2xl font-bold text-white">{selectedSkill.name}</h2>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditorSkillId(selectedSkill.id);
                            setActiveTab('skill-editor');
                          }}
                          className="text-xs px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 font-semibold flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> Редагувати цей скіл
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 mt-2">{selectedSkill.description}</p>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-4 py-3 text-center">
                    <span className="text-2xl font-black text-indigo-300">
                      {selectedSkill.overallDemand}%
                    </span>
                    <span className="block text-[11px] text-slate-400">авто-попит з вакансій</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Частота згадувань у вакансіях по платформах (розраховано автоматично):
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PLATFORMS.map((p) => {
                      const val = selectedSkill.platformDemand?.[p.id] ?? 0;
                      return (
                        <div
                          key={p.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-slate-300">{p.name}</span>
                            <span className="font-bold text-indigo-400">{val}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${val}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Де вивчити {selectedSkill.name} (Книги, Курси, Тренажери):
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedSkill.resources.map((res, idx) => {
                      const meta = RESOURCE_ICONS[res.type] || RESOURCE_ICONS.book;
                      const IconComponent = meta.icon;
                      return (
                        <a
                          key={idx}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded border ${meta.badgeColor}`}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                              {meta.label}
                            </span>
                            <span className="text-sm font-medium text-slate-200">{res.title}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">
                  Вакансії, де потрібен {selectedSkill.name}:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vacanciesList
                    .filter(
                      (v) =>
                        v.requiredSkills.includes(selectedSkill.id) ||
                        v.optionalSkills.includes(selectedSkill.id)
                    )
                    .map((vac) => {
                      const isRequired = vac.requiredSkills.includes(selectedSkill.id);
                      const { percent } = getVacancyMatch(vac);
                      return (
                        <div
                          key={vac.id}
                          onClick={() => {
                            setSelectedVacancyId(vac.id);
                            setActiveTab('vacancies');
                          }}
                          className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex flex-col justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getPlatformBadge(
                                  vac.platform
                                )}`}
                              >
                                {vac.platform}
                              </span>
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded font-medium ${
                                  isRequired
                                    ? 'bg-indigo-500/20 text-indigo-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {isRequired ? "Обов'язковий скіл" : 'Буде плюсом'}
                              </span>
                            </div>
                            <h4 className="font-bold text-white text-base">{vac.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {vac.company} • {vac.salary}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                            <span className="text-emerald-400 font-medium">
                              Твій збіг: {percent}%
                            </span>
                            <span className="text-indigo-400 flex items-center gap-1 font-medium">
                              Розбір вакансії <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= РЕЖИМ 3: МУЛЬТИ-ПОРІВНЯЛКА СКІЛІВ ОДНІЄЇ КАТЕГОРІЇ ================= */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Порівнялка попиту на скіли у вакансіях (за категоріями)
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Обери категорію (властивість скіла: <strong>Бази даних</strong>, <strong>Мова програмування</strong>, <strong>Фреймворк</strong>, <strong>Мова розмітки</strong> тощо) та порівнюй одразу <strong>скільки завгодно скілів</strong> між собою! Відсотки розраховуються автоматично на основі вакансій у базі.
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  1. Обери категорію (тип / властивість навичок):
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => {
                    const count = skillsList.filter((s) => s.category === cat).length;
                    const active = compareCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => handleSelectCompareCategory(cat)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                          active
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/25'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${
                            active ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                    2. Відміть скіли з категорії «{compareCategory}» для порівняння (обрано:{' '}
                    {compareSkillIds.filter((id) => categorySkills.some((s) => s.id === id)).length} з{' '}
                    {categorySkills.length}):
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCompareSkillIds(categorySkills.map((s) => s.id))}
                      className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800"
                    >
                      Обрати всі ({categorySkills.length})
                    </button>
                    {categorySkills.length >= 2 && (
                      <button
                        type="button"
                        onClick={() => setCompareSkillIds(categorySkills.slice(0, 2).map((s) => s.id))}
                        className="text-[11px] px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800"
                      >
                        Залишити топ-2
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((sk, idx) => {
                    const isChecked = compareSkillIds.includes(sk.id);
                    const palette = COMPARE_PALETTE[idx % COMPARE_PALETTE.length];
                    return (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => toggleCompareSkill(sk.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                          isChecked
                            ? palette.badge
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isChecked ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 shrink-0 opacity-50" />
                        )}
                        <span>{sk.name}</span>
                        <span className="text-[11px] opacity-80">({sk.overallDemand}%)</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const selectedCompareSkills = categorySkills
                  .filter((s) => compareSkillIds.includes(s.id))
                  .sort((a, b) => b.overallDemand - a.overallDemand);

                if (selectedCompareSkills.length === 0) {
                  return (
                    <div className="p-4 rounded-xl bg-slate-950 text-slate-400 text-sm">
                      Обери хоча б один скіл вище для порівняння.
                    </div>
                  );
                }

                const leader = selectedCompareSkills[0];

                return (
                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-cyan-950/60 border border-indigo-500/30 space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                        Аналітичний вердикт у категорії «{compareCategory}»:
                      </div>
                      <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                        По запитах у вакансіях:{' '}
                        {selectedCompareSkills.map((sk, i) => {
                          const palette = COMPARE_PALETTE[i % COMPARE_PALETTE.length];
                          return (
                            <span key={sk.id}>
                              {i > 0 && (i === selectedCompareSkills.length - 1 ? ' та ' : ', ')}
                              «{sk.name}» потрібен у{' '}
                              <span className={`${palette.text} underline`}>{sk.overallDemand}%</span> випадків
                            </span>
                          );
                        })}
                        .
                      </p>
                      <p className="text-xs sm:text-sm text-slate-300">
                        💡 <strong>Рекомендований порядок вивчення у категорії «{compareCategory}»:</strong>{' '}
                        {selectedCompareSkills.map((s, idx) => `${idx + 1}. ${s.name} (${s.overallDemand}%)`).join(' ➔ ')}.{' '}
                        Лідер категорії — <strong>{leader.name}</strong> ({leader.timeToLearn}).
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                      <h4 className="text-sm font-bold text-white">
                        Загальний попит у вакансіях ({selectedCompareSkills.length} обраних з категорії «{compareCategory}»):
                      </h4>
                      <div className="space-y-3">
                        {selectedCompareSkills.map((sk, idx) => {
                          const palette = COMPARE_PALETTE[idx % COMPARE_PALETTE.length];
                          return (
                            <div key={sk.id} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-white flex items-center gap-2">
                                  <span className="text-slate-500">#{idx + 1}</span>
                                  {sk.name}
                                  <span className="text-[11px] font-normal text-slate-400">
                                    ({sk.timeToLearn})
                                  </span>
                                </span>
                                <span className={`font-black text-sm ${palette.text}`}>
                                  {sk.overallDemand}% вакансій
                                </span>
                              </div>
                              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full ${palette.bar} rounded-full transition-all duration-300`}
                                  style={{ width: `${sk.overallDemand}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <h4 className="text-sm font-bold text-white">
                          Порівняння по платформах (Djinni, DOU, Work.ua, Robota.ua)
                        </h4>

                        <div className="space-y-5">
                          {PLATFORMS.map((p) => (
                            <div key={p.id} className="space-y-2 pb-3 border-b border-slate-900 last:border-none">
                              <div className="text-xs font-bold text-slate-200 flex items-center justify-between">
                                <span>Платформа: {p.name}</span>
                              </div>
                              <div className="space-y-1.5">
                                {selectedCompareSkills.map((sk, idx) => {
                                  const val = sk.platformDemand?.[p.id] ?? 0;
                                  const palette = COMPARE_PALETTE[idx % COMPARE_PALETTE.length];
                                  return (
                                    <div key={sk.id} className="grid grid-cols-12 items-center gap-2 text-xs">
                                      <span className="col-span-4 truncate text-slate-300 font-medium">
                                        {sk.name}
                                      </span>
                                      <div className="col-span-6 h-2 bg-slate-900 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${palette.bar} rounded-full transition-all duration-300`}
                                          style={{ width: `${val}%` }}
                                        />
                                      </div>
                                      <span className={`col-span-2 text-right font-bold ${palette.text}`}>
                                        {val}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                        <h4 className="text-sm font-bold text-white">
                          Де вчити обрані скіли ({selectedCompareSkills.length})
                        </h4>

                        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                          {selectedCompareSkills.map((sk, idx) => {
                            const palette = COMPARE_PALETTE[idx % COMPARE_PALETTE.length];
                            return (
                              <div
                                key={sk.id}
                                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`font-bold text-sm ${palette.text}`}>
                                    {sk.name} ({sk.overallDemand}%)
                                  </span>
                                  <span className="text-xs text-slate-400">Час: {sk.timeToLearn}</span>
                                </div>
                                <div className="space-y-1.5">
                                  {sk.resources.map((r, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={r.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center justify-between text-xs text-slate-300 hover:text-white bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800/80 hover:border-slate-700 transition"
                                    >
                                      <span className="truncate">{r.title}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-500 shrink-0 ml-2" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ================= РЕЖИМ 4: ДЕРЕВО НАВИЧОК ТА РОАДМАПИ (SKILL TREE / ROADMAPS) ================= */}
        {activeTab === 'tree' && (
          <SkillRoadmapTree mySkills={mySkills} />
        )}
      </main>

      {/* ================= МОДАЛЬНЕ ВІКНО ДОДАВАННЯ НОВОГО СКІЛА (БЕЗ РУЧНИХ ВІДСОТКІВ!) ================= */}
      {isAddSkillOpen && isAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-amber-400" />
                👑 Додати новий скіл у базу (Тільки Адмін)
              </h3>
              <button
                onClick={() => setIsAddSkillOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {addSkillError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {addSkillError}
              </div>
            )}

            <form onSubmit={handleCreateSkill} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Назва скіла * (напр. Redis, Java, Angular)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Напр. Java"
                    value={newSkillForm.name}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Категорія (властивість скіла для порівнялки)
                  </label>
                  <select
                    value={newSkillForm.category}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-1.5">
                <label className="block text-amber-300 font-semibold">
                  ⚡ Рівні володіння цим скілом (через кому — відображаються у Профілі):
                </label>
                <input
                  type="text"
                  value={newSkillForm.levelsText}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, levelsText: e.target.value })}
                  placeholder="Базовий, Просунутий, Бог"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Орієнтовний час вивчення
                  </label>
                  <input
                    type="text"
                    placeholder="Напр. 2–3 тижні"
                    value={newSkillForm.timeToLearn}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, timeToLearn: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Короткий опис для джуна
                  </label>
                  <input
                    type="text"
                    placeholder="Для чого використовується..."
                    value={newSkillForm.description}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="font-semibold text-indigo-300">
                  📚 Додати навчальний ресурс (Книга, Курс або Тренажер):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newSkillForm.resType}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, resType: e.target.value })}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option value="course">Курс / Відео</option>
                    <option value="book">Книга / Документація</option>
                    <option value="practice">Тренажер / Практика</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Назва курсу або книги"
                    value={newSkillForm.resTitle}
                    onChange={(e) => setNewSkillForm({ ...newSkillForm, resTitle: e.target.value })}
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <input
                  type="url"
                  placeholder="Посилання (https://...)"
                  value={newSkillForm.resUrl}
                  onChange={(e) => setNewSkillForm({ ...newSkillForm, resUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-emerald-300 font-semibold">
                    У яких вакансіях потрібен цей скіл? (Автоматично порахує % попиту!)
                  </label>
                  <span className="text-[11px] text-indigo-300 font-bold">
                    Авто-попит:{' '}
                    {vacanciesList.length > 0
                      ? Math.round((newSkillForm.attachToVacancies.length / vacanciesList.length) * 100)
                      : 0}
                    % ({newSkillForm.attachToVacancies.length} з {vacanciesList.length} вакансій)
                  </span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  {vacanciesList.map((vac) => {
                    const checked = newSkillForm.attachToVacancies.includes(vac.id);
                    return (
                      <label
                        key={vac.id}
                        className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-white py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? newSkillForm.attachToVacancies.filter((id) => id !== vac.id)
                              : [...newSkillForm.attachToVacancies, vac.id];
                            setNewSkillForm({ ...newSkillForm, attachToVacancies: next });
                          }}
                        />
                        <span>
                          <strong className="text-indigo-300">[{vac.platform}]</strong> {vac.title} ({vac.company})
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSkillOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Зберегти скіл у базу
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= МОДАЛЬНЕ ВІКНО АВТОРИЗАЦІЇ ================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {authMode === 'register' ? 'Реєстрація в NubHub' : 'Вхід у профіль NubHub'}
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition shadow"
              >
                <Globe className="w-4 h-4 text-red-500" />
                <span>Продовжити через Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('github')}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-sm transition"
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Продовжити через GitHub</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-500 uppercase">або через пошту</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === 'register' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Твоє Ім'я</label>
                  <input
                    type="text"
                    required
                    placeholder="Напр. Ігор Мельник"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1">Електронна пошта (Email)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="admin@nubhub.ua або anna.qa@ukr.net"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Пароль</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Пароль (admin123 або user123)"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
              >
                {authMode === 'register' ? 'Створити акаунт' : 'Увійти за поштою'}
              </button>
            </form>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Тестові доступи поштою:</div>
              <div>
                👑 Адмін: <code className="text-amber-300">admin@nubhub.ua</code> / пароль:{' '}
                <code className="text-amber-300">admin123</code>
              </div>
              <div>
                👤 Юзери (10 шт): напр. <code className="text-indigo-300">anna.qa@ukr.net</code> / пароль:{' '}
                <code className="text-indigo-300">user123</code>
              </div>
            </div>

            <div className="text-center text-xs text-slate-400">
              {authMode === 'register' ? (
                <>
                  Вже є акаунт?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    Увійти
                  </button>
                </>
              ) : (
                <>
                  Немає акаунту?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-indigo-400 hover:underline font-semibold"
                  >
                    Зареєструватися
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
