import React, { useState, useMemo, useEffect } from 'react';
import {
  GitBranch,
  BookOpen,
  GraduationCap,
  Code2,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Zap,
  Target,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Brain,
  RotateCcw,
  Check,
  Search,
  Filter,
  Layers,
  ArrowDown
} from 'lucide-react';
import { SKILL_TRACKS } from '../data/skillTrees';

const PRIORITY_BADGES = {
  must: {
    label: '⚡ Must-Have (Критично)',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-950/40',
  },
  high: {
    label: '🔥 Високий пріоритет',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-950/40',
  },
  bonus: {
    label: '⭐ Плюс до оферу (Junior+)',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm shadow-purple-950/40',
  },
};

const RESOURCE_TYPES = {
  book: { icon: BookOpen, label: 'Книга', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  course: { icon: GraduationCap, label: 'Курс', color: 'bg-purple-500/15 text-purple-300 border-purple-500/30' },
  practice: { icon: Code2, label: 'Практика', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
};

export default function SkillRoadmapTree({ mySkills = [], tracks: externalTracks = null }) {
  const [tracks, setTracks] = useState(externalTracks && externalTracks.length > 0 ? externalTracks : SKILL_TRACKS);
  const [selectedTrackId, setSelectedTrackId] = useState('data-science');

  useEffect(() => {
    if (externalTracks && externalTracks.length > 0) {
      setTracks(externalTracks);
      return;
    }
    fetch('/api/roadmaps')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.roadmaps) && data.roadmaps.length > 0) {
          setTracks(data.roadmaps);
        }
      })
      .catch(() => {});
  }, [externalTracks]);
  const [expandedNodes, setExpandedNodes] = useState({
    'ds-math': true,
    'ds-python': true,
    'ds-sql': true,
    'fe-html-css': true,
    'fe-js': true,
    'be-net': true,
    'be-lang': true,
  });

  // Локальний стан завершених чекпоінтів
  const [completedCheckpoints, setCompletedCheckpoints] = useState(() => {
    try {
      const saved = localStorage.getItem('nubhub_roadmap_checkpoints');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Фільтри та пошук чекпоінтів
  const [resourceFilter, setResourceFilter] = useState('all'); // all, book, course, practice, free
  const [searchQuery, setSearchQuery] = useState('');

  // Збереження в localStorage
  useEffect(() => {
    try {
      localStorage.setItem('nubhub_roadmap_checkpoints', JSON.stringify(completedCheckpoints));
    } catch (e) {
      console.error('Failed to save checkpoints:', e);
    }
  }, [completedCheckpoints]);

  const currentTrack = useMemo(() => {
    return SKILL_TRACKS.find((t) => t.id === selectedTrackId) || SKILL_TRACKS[0];
  }, [selectedTrackId]);

  // Підрахунок загальної статистики прогресу
  const trackStats = useMemo(() => {
    const allCheckpoints = currentTrack.nodes.flatMap((n) => n.checkpoints);
    const totalCount = allCheckpoints.length;
    const completedCount = allCheckpoints.filter((cp) => !!completedCheckpoints[cp.id]).length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      totalCount,
      completedCount,
      percentage,
      nodesCount: currentTrack.nodes.length,
    };
  }, [currentTrack, completedCheckpoints]);

  const toggleCheckpoint = (checkpointId) => {
    setCompletedCheckpoints((prev) => ({
      ...prev,
      [checkpointId]: !prev[checkpointId],
    }));
  };

  const toggleNodeExpand = (nodeId) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const expandAllNodes = () => {
    const next = {};
    currentTrack.nodes.forEach((n) => {
      next[n.id] = true;
    });
    setExpandedNodes(next);
  };

  const collapseAllNodes = () => {
    setExpandedNodes({});
  };

  const handleResetProgress = () => {
    if (window.confirm('Скинути всі відмічені чекпоінти для цього треку?')) {
      const next = { ...completedCheckpoints };
      currentTrack.nodes.flatMap((n) => n.checkpoints).forEach((cp) => {
        delete next[cp.id];
      });
      setCompletedCheckpoints(next);
    }
  };

  const handleCompleteAll = () => {
    const next = { ...completedCheckpoints };
    currentTrack.nodes.flatMap((n) => n.checkpoints).forEach((cp) => {
      next[cp.id] = true;
    });
    setCompletedCheckpoints(next);
  };

  return (
    <div className="space-y-6">
      {/* ПЕРЕМИКАЧ НАПРЯМКІВ (TRACKS) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <GitBranch className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">Дерево навичок & Роадмапи (Skill Trees)</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Покроковий план дисциплін від математики та синтаксису до працевлаштування з термінами, годинами та чекпоінтами.
            </p>
          </div>

          {/* Кнопки перемикання треків */}
          <div className="flex flex-wrap gap-2">
            {SKILL_TRACKS.map((track) => {
              const active = track.id === selectedTrackId;
              return (
                <button
                  key={track.id}
                  onClick={() => setSelectedTrackId(track.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-md shadow-indigo-950/60'
                      : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <Brain className={`w-4 h-4 ${active ? 'text-indigo-200' : 'text-slate-500'}`} />
                  <span>{track.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ШАПКА ОБРАНОГО ТРЕКУ: ОПИС, МЕТРИКИ ТА ПРОГРЕС */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/30 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                {currentTrack.badge}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950/60 px-2.5 py-0.5 rounded-md border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                Термін: <strong className="text-white">{currentTrack.estimatedTotalTime}</strong>
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-950/60 px-2.5 py-0.5 rounded-md border border-slate-800">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Практика: <strong className="text-emerald-300">{currentTrack.estimatedTotalHours}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {currentTrack.name}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {currentTrack.description}
            </p>
          </div>

          {/* Цільові ролі */}
          <div className="shrink-0 space-y-1.5 bg-slate-950/60 border border-slate-800/80 p-3.5 rounded-xl">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Цільові вакансії після освоєння:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentTrack.primaryRoles.map((role) => (
                <span
                  key={role}
                  className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ПРОГРЕС БАР ОСВОЄННЯ ТРЕКУ */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">Твій прогрес у цьому треку:</span>
              <span className="text-sm font-extrabold text-indigo-400">
                {trackStats.completedCount} з {trackStats.totalCount} чекпоінтів ({trackStats.percentage}%)
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleCompleteAll}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 border border-slate-700"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Всі пройдені
              </button>
              <button
                onClick={handleResetProgress}
                className="px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition flex items-center gap-1 border border-slate-800"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Скинути
              </button>
              <button
                onClick={expandAllNodes}
                className="px-2 py-1 rounded bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition"
              >
                Розгорнути всі
              </button>
              <button
                onClick={collapseAllNodes}
                className="px-2 py-1 rounded bg-slate-800/60 text-slate-300 hover:bg-slate-800 transition"
              >
                Згорнути
              </button>
            </div>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${trackStats.percentage}%` }}
            />
          </div>
        </div>

        {/* ФІЛЬТРИ ТА ПОШУК ЧЕКПОІНТІВ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Матеріали:
            </span>
            {[
              { id: 'all', label: 'Всі чекпоінти' },
              { id: 'book', label: '📚 Книги' },
              { id: 'course', label: '🎓 Курси / Відео' },
              { id: 'practice', label: '🛠 Практика' },
              { id: 'free', label: '🎁 Безкоштовні' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setResourceFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  resourceFilter === f.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук книги чи курсу..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* ДЕРЕВОПОДІБНА СХЕМА НАВИЧОК (TREE VISUALIZATION) */}
      <div className="relative space-y-6">
        {currentTrack.nodes.map((node, nodeIdx) => {
          const isExpanded = !!expandedNodes[node.id];
          const hasInProfile = node.skillMapping ? mySkills.includes(node.skillMapping) : false;

          // Статистика чекпоінтів для цієї ноди
          const nodeTotalCheckpoints = node.checkpoints.length;
          const nodeCompletedCheckpoints = node.checkpoints.filter((cp) => !!completedCheckpoints[cp.id]).length;
          const isNodeDone = nodeTotalCheckpoints > 0 && nodeCompletedCheckpoints === nodeTotalCheckpoints;

          // Фільтрація чекпоінтів за категорією та пошуком
          const filteredCheckpoints = node.checkpoints.filter((cp) => {
            if (resourceFilter === 'book' && cp.type !== 'book') return false;
            if (resourceFilter === 'course' && cp.type !== 'course') return false;
            if (resourceFilter === 'practice' && cp.type !== 'practice') return false;
            if (resourceFilter === 'free' && !cp.free) return false;
            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase();
              const matchTitle = cp.title.toLowerCase().includes(q);
              const matchAuthor = cp.authorOrPlatform.toLowerCase().includes(q);
              const matchChapters = cp.chapters.toLowerCase().includes(q);
              return matchTitle || matchAuthor || matchChapters;
            }
            return true;
          });

          const priorityConfig = PRIORITY_BADGES[node.priorityLevel] || PRIORITY_BADGES.must;

          return (
            <div key={node.id} className="relative">
              {/* ВЕРТИКАЛЬНА ЛІНІЯ ЗВ'ЯЗКУ МІЖ ВУЗЛАМИ ДЕРЕВА */}
              {nodeIdx < currentTrack.nodes.length - 1 && (
                <div className="absolute left-6 sm:left-8 top-16 bottom-[-28px] w-0.5 bg-gradient-to-b from-indigo-500 via-indigo-500/50 to-slate-800 z-0 pointer-events-none hidden sm:block">
                  <div className="absolute bottom-0 -left-[3px] text-indigo-400">
                    <ArrowDown className="w-2.5 h-2.5 animate-bounce" />
                  </div>
                </div>
              )}

              {/* КАРТКА ВУЗЛА (DISCIPLINE CARD) */}
              <div
                className={`relative z-10 rounded-2xl border transition-all ${
                  isNodeDone
                    ? 'bg-slate-900/90 border-emerald-500/60 shadow-lg shadow-emerald-950/20'
                    : isExpanded
                    ? 'bg-slate-900/80 border-indigo-500/60 shadow-xl shadow-indigo-950/30'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* ЗАГОЛОВОК ВУЗЛА */}
                <div
                  onClick={() => toggleNodeExpand(node.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    {/* Номер кроку / Маркер виконання */}
                    <div
                      className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-extrabold text-base shrink-0 border transition-all ${
                        isNodeDone
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/30'
                          : 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-400 shadow-md shadow-indigo-950/50'
                      }`}
                    >
                      {isNodeDone ? <Check className="w-5 h-5 text-emerald-400 stroke-[3]" /> : node.stepNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Етап {node.stepNumber} • {node.category}
                        </span>

                        {/* Пріоритет дисципліни */}
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${priorityConfig.color}`}>
                          {priorityConfig.label}
                        </span>

                        {/* Чи є скіл у профілі користувача */}
                        {hasInProfile && (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Є у твоєму стеку
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition">
                        {node.title}
                      </h3>

                      {/* Терміни та години */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          Термін: <strong className="text-white">{node.duration}</strong>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          Практика: <strong className="text-white">{node.hours}</strong>
                        </span>
                        {node.parentStep && (
                          <>
                            <span>•</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <GitBranch className="w-3 h-3 text-indigo-400" />
                              Базується на попередньому етапі
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Права частина: Чекпоінти лічильник та кнопка розгортання */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-left md:text-right">
                      <div className="text-xs font-semibold text-slate-300">
                        Чекпоінти: <span className="text-indigo-400 font-bold">{nodeCompletedCheckpoints}</span> / {nodeTotalCheckpoints}
                      </div>
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all"
                          style={{
                            width: `${nodeTotalCheckpoints > 0 ? (nodeCompletedCheckpoints / nodeTotalCheckpoints) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <button
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* РОЗГОРНУТА ЧАСТИНА: ОПИС, РЕЗУЛЬТАТИ ТА КАРТКИ ЧЕКПОІНТІВ З КНИГ/КУРСІВ */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 border-t border-slate-800/80 bg-slate-950/40 space-y-5 rounded-b-2xl">
                    {/* Чому це важливо */}
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Чому ця дисципліна критична для джуна:
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {node.description}
                      </p>
                    </div>

                    {/* Що ти вмітимеш (Outcomes) */}
                    {node.outcomes && node.outcomes.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Практичні навички після освоєння цього етапу:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {node.outcomes.map((outcome, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-slate-300 flex items-start gap-2 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{outcome}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* СПИСОК ЧЕКПОІНТІВ (КНИГИ ТА КУРСИ) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          Чекпоінти для освоєння: книги, курси та практика ({filteredCheckpoints.length})
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          Клікай на чекбокс, щоб зберігати прогрес
                        </span>
                      </div>

                      {filteredCheckpoints.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800">
                          Немає чекпоінтів під обраний фільтр або пошуковий запит
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {filteredCheckpoints.map((cp) => {
                            const isDone = !!completedCheckpoints[cp.id];
                            const typeMeta = RESOURCE_TYPES[cp.type] || RESOURCE_TYPES.course;
                            const TypeIcon = typeMeta.icon;

                            return (
                              <div
                                key={cp.id}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  isDone
                                    ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                                    : 'bg-slate-900/70 border-slate-800/90 hover:border-slate-700'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Чекбокс виконання */}
                                  <button
                                    onClick={() => toggleCheckpoint(cp.id)}
                                    className="mt-0.5 text-slate-400 hover:text-white transition shrink-0"
                                    title={isDone ? 'Позначити як не пройдене' : 'Позначити як пройдене'}
                                  >
                                    {isDone ? (
                                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                      <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                                    )}
                                  </button>

                                  {/* Інформація про чекпоінт */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                      {/* Бейдж типу (Книга / Курс / Практика) */}
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${typeMeta.color}`}
                                      >
                                        <TypeIcon className="w-3 h-3" />
                                        {typeMeta.label}
                                      </span>

                                      {/* Автор або платформа */}
                                      <span className="text-[11px] font-semibold text-slate-300">
                                        {cp.authorOrPlatform}
                                      </span>

                                      {/* Мова та ціна */}
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                        {cp.lang}
                                      </span>
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                          cp.free
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-slate-800 text-amber-300'
                                        }`}
                                      >
                                        {cp.free ? 'Безкоштовно' : 'Книга / Дока'}
                                      </span>
                                    </div>

                                    {/* Назва книги/курсу */}
                                    <h5
                                      className={`text-sm font-bold leading-snug ${
                                        isDone ? 'text-emerald-200 line-through opacity-80' : 'text-slate-100'
                                      }`}
                                    >
                                      {cp.title}
                                    </h5>

                                    {/* Точні розділи / глави з книги */}
                                    <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                                      <strong className="text-slate-300 shrink-0">Освоїти:</strong>
                                      <span>{cp.chapters}</span>
                                    </p>
                                  </div>

                                  {/* Кнопка переходу */}
                                  {cp.url && (
                                    <a
                                      href={cp.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="shrink-0 p-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-slate-400 hover:text-white transition"
                                      title="Відкрити матеріал"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
