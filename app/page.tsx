'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { StudySubject, StudyModule, GlobalStats } from '@/types';

export default function HomePage() {
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [progressMap, setProgressMap] = useState<
    Record<string, { completed: boolean; completedItems: string[] }>
  >({});
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [isDbConfigured, setIsDbConfigured] = useState(true);
  const [loading, setLoading] = useState(true);

  // Estados de Filtros e Busca
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Estados de Expansão (Acordeão)
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Toast / Notificações
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Carrega dados iniciais da API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subjects');
      if (!res.ok) throw new Error('Falha ao obter estrutura de estudos.');
      const data = await res.json();

      setSubjects(data.subjects || []);
      setProgressMap(data.progressMap || {});
      setStats(data.stats || null);
      setUser(data.user || null);
      setIsGuest(Boolean(data.isGuest));
      setIsDbConfigured(Boolean(data.isDatabaseConfigured));

      // Por padrão, expande a primeira matéria no primeiro carregamento
      if (data.subjects && data.subjects.length > 0) {
        setExpandedSubjects({ [data.subjects[0].id]: true });
      }
    } catch (err: any) {
      showToast('Erro ao carregar dados do servidor.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsGuest(true);
      await loadData();
      showToast('Sessão encerrada com sucesso.');
    } catch {
      showToast('Erro ao sair da conta.', 'error');
    }
  };

  // Alternar checkbox de módulo
  const handleToggleModule = async (moduleId: string, currentCompleted: boolean) => {
    const nextCompleted = !currentCompleted;

    // Atualização otimista na interface
    const prevModuleProgress = progressMap[moduleId];
    const targetModule = subjects.flatMap(s => s.modules).find(m => m.id === moduleId);
    const updatedItems = nextCompleted && targetModule ? targetModule.items.map(i => i.id) : [];

    setProgressMap(prev => ({
      ...prev,
      [moduleId]: {
        completed: nextCompleted,
        completedItems: updatedItems,
      },
    }));

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'module',
          moduleId,
          completed: nextCompleted,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar alteração.');
      }

      // Atualiza com dados confirmados do servidor
      setProgressMap(prev => ({
        ...prev,
        [moduleId]: data.progress,
      }));
      if (data.stats) {
        setStats(data.stats);
      }
      showToast(nextCompleted ? 'Módulo concluído!' : 'Módulo desmarcado.');
    } catch (err: any) {
      // Reversão em caso de falha de conexão
      setProgressMap(prev => ({
        ...prev,
        [moduleId]: prevModuleProgress || { completed: false, completedItems: [] },
      }));
      showToast(err.message || 'Falha ao salvar no banco de dados.', 'error');
    }
  };

  // Alternar checkbox de item/aula individual
  const handleToggleItem = async (
    moduleId: string,
    itemId: string,
    currentCompleted: boolean
  ) => {
    const nextCompleted = !currentCompleted;

    // Atualização otimista
    const prevModuleProgress = progressMap[moduleId] || { completed: false, completedItems: [] };
    const prevItems = prevModuleProgress.completedItems || [];
    const newItems = nextCompleted
      ? [...prevItems, itemId]
      : prevItems.filter(id => id !== itemId);

    const targetModule = subjects.flatMap(s => s.modules).find(m => m.id === moduleId);
    const totalModuleItems = targetModule?.items.length || 0;
    const isModuleComplete = totalModuleItems > 0 && newItems.length >= totalModuleItems;

    setProgressMap(prev => ({
      ...prev,
      [moduleId]: {
        completed: isModuleComplete,
        completedItems: newItems,
      },
    }));

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'item',
          moduleId,
          itemId,
          completed: nextCompleted,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar alteração.');
      }

      setProgressMap(prev => ({
        ...prev,
        [moduleId]: data.progress,
      }));
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err: any) {
      // Reversão
      setProgressMap(prev => ({
        ...prev,
        [moduleId]: prevModuleProgress,
      }));
      showToast(err.message || 'Falha ao salvar aula.', 'error');
    }
  };

  // Expandir / Recolher Matéria
  const toggleSubjectExpand = (subjectId: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId],
    }));
  };

  // Expandir / Recolher Módulo
  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Expandir tudo / Recolher tudo
  const handleExpandAll = () => {
    const allSubj: Record<string, boolean> = {};
    const allMods: Record<string, boolean> = {};
    subjects.forEach(s => {
      allSubj[s.id] = true;
      s.modules.forEach(m => {
        allMods[m.id] = true;
      });
    });
    setExpandedSubjects(allSubj);
    setExpandedModules(allMods);
  };

  const handleCollapseAll = () => {
    setExpandedSubjects({});
    setExpandedModules({});
  };

  // Filtragem de matérias, módulos e itens
  const filteredSubjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return subjects
      .map(subject => {
        // Filtra módulos
        const matchingModules = subject.modules.filter(mod => {
          const modCompleted = Boolean(progressMap[mod.id]?.completed);

          // Filtro de status do módulo
          if (moduleFilter === 'completed' && !modCompleted) return false;
          if (moduleFilter === 'pending' && modCompleted) return false;

          // Se não há busca textual, atende o filtro
          if (!q) return true;

          // Busca no nome da matéria, no nome do módulo ou nos títulos dos itens
          const matchSubj = subject.name.toLowerCase().includes(q);
          const matchMod = mod.name.toLowerCase().includes(q);
          const matchItems = mod.items.some(it => it.title.toLowerCase().includes(q));

          return matchSubj || matchMod || matchItems;
        });

        const subjectProgress = stats?.subjects.find(s => s.id === subject.id);
        const hasPending = subjectProgress ? subjectProgress.pendingModules > 0 : true;

        if (filterPendingOnly && !hasPending) {
          return null;
        }

        if (q && matchingModules.length === 0 && !subject.name.toLowerCase().includes(q)) {
          return null;
        }

        return {
          ...subject,
          modules: matchingModules,
        };
      })
      .filter((s): s is StudySubject => s !== null);
  }, [subjects, progressMap, stats, searchQuery, filterPendingOnly, moduleFilter]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Carregando estudos...</span>
        </div>
        <p className="text-muted">Carregando estrutura de estudos e progresso...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de Navegação Superior */}
      <nav className="navbar-app sticky-top">
        <div className="container-xl d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-title">
              Estudos<span className="brand-dot">.</span>
            </span>
            <span className="badge badge-neutral d-none d-sm-inline-block small">
              Ciências da Natureza & Matemática
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                <span className="small text-secondary d-none d-sm-inline">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.username}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-sm btn-minimal py-1 px-2 small"
                  title="Sair da conta"
                >
                  <i className="bi bi-box-arrow-right me-1"></i>
                  <span className="d-none d-sm-inline">Sair</span>
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <span className="badge badge-baby-blue d-none d-md-inline small">
                  Modo Convidado (Local)
                </span>
                <Link href="/login" className="btn btn-sm btn-baby-primary py-1 px-3">
                  <i className="bi bi-person-fill me-1"></i>
                  Entrar / Salvar na Nuvem
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container-xl py-4">
        {/* Alerta caso MongoDB não esteja configurado */}
        {!isDbConfigured && (
          <div className="alert alert-warning py-3 px-3 mb-4 rounded-3 d-flex align-items-start gap-3 small">
            <i className="bi bi-exclamation-triangle-fill fs-5 text-warning"></i>
            <div>
              <strong>Atenção: MongoDB Atlas não configurado no ambiente.</strong>
              <div className="mt-1">
                A aplicação está exibindo a estrutura extraída do PDF, porém o progresso não
                será salvo permanentemente no banco até que a variável <code>MONGODB_URI</code> seja
                definida no arquivo <code>.env</code>.
              </div>
            </div>
          </div>
        )}

        {/* 7.1 Dashboard Inicial com Estatísticas */}
        <section className="mb-4">
          <div className="row g-3">
            {/* Card Geral */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="minimal-card p-3 h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small text-muted fw-semibold text-uppercase">Progresso Geral</span>
                  <span className="badge badge-baby-blue fs-6">
                    {stats?.percentage ?? 0}%
                  </span>
                </div>
                <div className="progress-container mb-2">
                  <div
                    className="progress-bar-baby"
                    style={{ width: `${stats?.percentage ?? 0}%` }}
                  ></div>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>{stats?.completedModules ?? 0} de {stats?.totalModules ?? 0} módulos</span>
                  <span>{stats?.completedItems ?? 0} aulas</span>
                </div>
              </div>
            </div>

            {/* Total de Matérias */}
            <div className="col-6 col-md-3 col-lg-3">
              <div className="minimal-card p-3 h-100">
                <span className="small text-muted fw-semibold text-uppercase">Matérias</span>
                <div className="fs-3 fw-bold mt-1 text-dark">
                  {stats?.totalSubjects ?? subjects.length}
                </div>
                <div className="text-muted small mt-1">Química, Física, Mat. e Bio.</div>
              </div>
            </div>

            {/* Módulos Concluídos */}
            <div className="col-6 col-md-3 col-lg-3">
              <div className="minimal-card p-3 h-100">
                <span className="small text-muted fw-semibold text-uppercase">Concluídos</span>
                <div className="fs-3 fw-bold mt-1 text-success">
                  {stats?.completedModules ?? 0}
                </div>
                <div className="text-muted small mt-1">Módulos finalizados</div>
              </div>
            </div>

            {/* Módulos Pendentes */}
            <div className="col-12 col-md-6 col-lg-3">
              <div className="minimal-card p-3 h-100">
                <span className="small text-muted fw-semibold text-uppercase">Pendentes</span>
                <div className="fs-3 fw-bold mt-1 text-secondary">
                  {stats?.pendingModules ?? 0}
                </div>
                <div className="text-muted small mt-1">Módulos a concluir</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7.6 Barra de Filtros e Busca */}
        <section className="minimal-card p-3 mb-4">
          <div className="row g-2 align-items-center">
            {/* Campo de Busca */}
            <div className="col-12 col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Buscar matéria, módulo ou assunto de aula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="btn btn-outline-secondary border-start-0"
                    type="button"
                    onClick={() => setSearchQuery('')}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Filtros de Módulo (Todos / Pendentes / Concluídos) */}
            <div className="col-12 col-md-4">
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn btn-sm btn-minimal ${moduleFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setModuleFilter('all')}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-minimal ${moduleFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setModuleFilter('pending')}
                >
                  Pendentes
                </button>
                <button
                  type="button"
                  className={`btn btn-sm btn-minimal ${moduleFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setModuleFilter('completed')}
                >
                  Concluídos
                </button>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="col-12 col-md-3 d-flex gap-2 justify-content-md-end">
              <button
                type="button"
                className={`btn btn-sm btn-minimal flex-grow-1 flex-md-grow-0 ${
                  filterPendingOnly ? 'active' : ''
                }`}
                onClick={() => setFilterPendingOnly(!filterPendingOnly)}
                title="Mostrar apenas matérias com pendências"
              >
                <i className="bi bi-funnel me-1"></i>
                Pendências
              </button>
              <button
                type="button"
                className="btn btn-sm btn-minimal"
                onClick={handleExpandAll}
                title="Expandir todas as matérias e módulos"
              >
                <i className="bi bi-arrows-expand"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-minimal"
                onClick={handleCollapseAll}
                title="Recolher todas as matérias e módulos"
              >
                <i className="bi bi-arrows-collapse"></i>
              </button>
            </div>
          </div>
        </section>

        {/* 7.2 & 7.3 Lista de Matérias e Módulos */}
        <section>
          {filteredSubjects.length === 0 ? (
            <div className="minimal-card p-5 text-center">
              <i className="bi bi-search fs-1 text-muted"></i>
              <h5 className="mt-3 text-secondary">Nenhum conteúdo encontrado</h5>
              <p className="text-muted small">
                {searchQuery
                  ? `Não encontramos resultados para "${searchQuery}". Tente outros termos.`
                  : 'Nenhuma matéria atende aos filtros selecionados.'}
              </p>
              {searchQuery && (
                <button
                  className="btn btn-sm btn-baby-primary mt-2"
                  onClick={() => {
                    setSearchQuery('');
                    setModuleFilter('all');
                    setFilterPendingOnly(false);
                  }}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            filteredSubjects.map(subject => {
              const subjectStat = stats?.subjects.find(s => s.id === subject.id);
              const isSubjExpanded = Boolean(expandedSubjects[subject.id]);
              const percent = subjectStat?.percentage ?? 0;

              return (
                <div key={subject.id} className="minimal-card mb-3 overflow-hidden">
                  {/* Cabeçalho da Matéria */}
                  <div
                    className="p-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 cursor-pointer bg-white"
                    onClick={() => toggleSubjectExpand(subject.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <span className="text-muted">
                        <i
                          className={`bi bi-chevron-${isSubjExpanded ? 'down' : 'right'} fs-5`}
                        ></i>
                      </span>
                      <div>
                        <h2 className="fs-5 fw-bold mb-0 text-dark">
                          {subject.name}
                        </h2>
                        <span className="text-muted small">
                          {subject.modules.length} {subject.modules.length === 1 ? 'módulo' : 'módulos'} exibidos
                          {' • '}
                          {subjectStat?.completedModules ?? 0}/{subject.modules_count} concluídos
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progresso da Matéria */}
                    <div
                      className="d-flex align-items-center gap-3"
                      style={{ minWidth: '220px' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="small text-muted fw-semibold">{percent}%</span>
                          <span className="small text-muted">
                            {subjectStat?.pendingModules ?? 0} pendentes
                          </span>
                        </div>
                        <div className="progress-container">
                          <div
                            className={percent === 100 ? 'progress-bar-success' : 'progress-bar-baby'}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo Expansível: Módulos */}
                  {isSubjExpanded && (
                    <div className="border-top bg-light p-2 p-md-3">
                      {subject.modules.map(module => {
                        const modProg = progressMap[module.id];
                        const isModCompleted = Boolean(modProg?.completed);
                        const isModExpanded = Boolean(expandedModules[module.id]);
                        const completedItemsCount = modProg?.completedItems?.length || 0;
                        const totalItems = module.items.length;

                        return (
                          <div
                            key={module.id}
                            className={`minimal-card mb-2 bg-white ${
                              isModCompleted ? 'completed-module' : ''
                            }`}
                          >
                            <div className="module-header d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-3 flex-grow-1">
                                {/* Checkbox do Módulo */}
                                <input
                                  type="checkbox"
                                  className="form-check-input touch-checkbox"
                                  checked={isModCompleted}
                                  onChange={() => handleToggleModule(module.id, isModCompleted)}
                                  title={isModCompleted ? 'Marcar como pendente' : 'Marcar módulo como concluído'}
                                  aria-label={`Concluir módulo ${module.name}`}
                                />

                                <div
                                  className="flex-grow-1"
                                  onClick={() => toggleModuleExpand(module.id)}
                                >
                                  <div className="d-flex flex-wrap align-items-center gap-2">
                                    <span
                                      className={`fw-semibold ${
                                        isModCompleted ? 'text-muted text-decoration-line-through' : 'text-dark'
                                      }`}
                                    >
                                      {module.name}
                                    </span>

                                    {/* Indicador de Aulas */}
                                    <span className="badge badge-neutral small">
                                      {module.declared_aulas} aulas
                                      {module.items_count !== module.declared_aulas && (
                                        <span className="ms-1 text-muted">
                                          ({module.items_count} {module.items_type === 'aula' ? 'aulas' : 'tópicos'})
                                        </span>
                                      )}
                                    </span>

                                    {completedItemsCount > 0 && (
                                      <span className="badge badge-baby-blue small">
                                        {completedItemsCount}/{totalItems}
                                      </span>
                                    )}
                                  </div>

                                  {module.notes && (
                                    <div className="small text-muted mt-1 fst-italic">
                                      <i className="bi bi-info-circle me-1"></i>
                                      {module.notes}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Botão de Expandir Itens do Módulo */}
                              {totalItems > 0 && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-secondary text-decoration-none p-1"
                                  onClick={() => toggleModuleExpand(module.id)}
                                  title="Ver aulas e subdivisões"
                                >
                                  <i
                                    className={`bi bi-chevron-${isModExpanded ? 'up' : 'down'} fs-6`}
                                  ></i>
                                </button>
                              )}
                            </div>

                            {/* Subdivisões do Módulo (Aulas ou Tópicos) */}
                            {isModExpanded && totalItems > 0 && (
                              <div className="border-top px-3 py-2 bg-light">
                                <div className="d-flex justify-content-between align-items-center py-1 mb-2 border-bottom">
                                  <span className="small text-muted fw-semibold">
                                    {module.items_type === 'aula' ? 'Distribuição de Aulas' : 'Tópicos de Conteúdo'}:
                                  </span>
                                  <span className="small text-muted">
                                    {completedItemsCount} de {totalItems} concluídos
                                  </span>
                                </div>

                                <div className="study-items-list">
                                  {module.items.map(item => {
                                    const isItemCompleted = Boolean(
                                      modProg?.completedItems?.includes(item.id) || isModCompleted
                                    );

                                    return (
                                      <div
                                        key={item.id}
                                        className={`study-item-row d-flex align-items-start gap-2 ${
                                          isItemCompleted ? 'completed' : ''
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          className="form-check-input touch-checkbox mt-1"
                                          checked={isItemCompleted}
                                          onChange={() =>
                                            handleToggleItem(module.id, item.id, isItemCompleted)
                                          }
                                          aria-label={`Concluir ${item.type} ${item.number}`}
                                        />
                                        <div className="flex-grow-1 item-text small">
                                          <span className="fw-semibold text-secondary me-1">
                                            {item.type === 'aula' ? `Aula ${item.number}:` : `•`}
                                          </span>
                                          {item.title}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>

        {/* Rodapé Informativo */}
        <footer className="mt-5 pt-4 border-top text-center text-muted small">
          <p className="mb-1">
            Sistema Web de Acompanhamento de Estudos • Baseado no catálogo de Ciências da Natureza e Matemática do Professor Ferretto
          </p>
          <p className="text-secondary mb-0">
            Fonte: <code>Mapa Ferretto CN e Matematica.pdf</code> • 76 módulos • 1.525 conteúdos indexados
          </p>
        </footer>
      </div>

      {/* Toast de Feedback */}
      {toastMessage && (
        <div
          className={`toast-notice alert ${
            toastMessage.type === 'success' ? 'alert-success' : 'alert-danger'
          } d-flex align-items-center gap-2 py-2 px-3 fade-in`}
        >
          <i
            className={`bi ${
              toastMessage.type === 'success'
                ? 'bi-check-circle-fill text-success'
                : 'bi-exclamation-circle-fill text-danger'
            }`}
          ></i>
          <span className="small">{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
