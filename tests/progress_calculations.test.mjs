import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Validação dos Cálculos de Progresso e Percentuais', () => {
  const jsonPath = path.resolve('data', 'study_structure.json');
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const { subjects } = JSON.parse(raw);

  // Implementação espelho da lógica de computeStats
  function computeStats(subjects, progressMap) {
    let totalModules = 0;
    let totalCompletedModules = 0;
    let totalItems = 0;
    let totalCompletedItems = 0;

    const subjectsStats = subjects.map(s => {
      let sCompletedModules = 0;
      let sTotalItems = 0;
      let sCompletedItems = 0;

      for (const m of s.modules) {
        totalModules++;
        const p = progressMap[m.id];
        const isCompleted = Boolean(p?.completed);
        if (isCompleted) {
          sCompletedModules++;
          totalCompletedModules++;
        }

        sTotalItems += m.items.length;
        totalItems += m.items.length;

        const cItems = p?.completedItems ? p.completedItems.length : (isCompleted ? m.items.length : 0);
        sCompletedItems += cItems;
        totalCompletedItems += cItems;
      }

      const sTotalModules = s.modules.length;
      const sPendingModules = sTotalModules - sCompletedModules;
      const sPercentage = sTotalModules > 0 ? Number(((sCompletedModules / sTotalModules) * 100).toFixed(1)) : 0;

      return {
        id: s.id,
        name: s.name,
        totalModules: sTotalModules,
        completedModules: sCompletedModules,
        pendingModules: sPendingModules,
        percentage: sPercentage,
        totalItems: sTotalItems,
        completedItems: sCompletedItems,
      };
    });

    const pendingModules = totalModules - totalCompletedModules;
    const percentage = totalModules > 0 ? Number(((totalCompletedModules / totalModules) * 100).toFixed(1)) : 0;

    return {
      totalSubjects: subjects.length,
      totalModules,
      completedModules: totalCompletedModules,
      pendingModules,
      percentage,
      totalItems,
      completedItems: totalCompletedItems,
      subjects: subjectsStats,
    };
  }

  test('Estado inicial sem progresso deve ser exatamente 0%', () => {
    const stats = computeStats(subjects, {});
    assert.equal(stats.completedModules, 0);
    assert.equal(stats.pendingModules, 76);
    assert.equal(stats.percentage, 0);
    assert.equal(stats.completedItems, 0);

    for (const s of stats.subjects) {
      assert.equal(s.completedModules, 0);
      assert.equal(s.percentage, 0);
    }
  });

  test('Conclusão de 1 módulo em Química (20 módulos) deve resultar em 5.0%', () => {
    const progressMap = {
      'quimica_quimica-basica': { completed: true, completedItems: [] }
    };

    const stats = computeStats(subjects, progressMap);
    const quimica = stats.subjects.find(s => s.id === 'quimica');

    assert.equal(quimica.completedModules, 1);
    assert.equal(quimica.pendingModules, 19);
    assert.equal(quimica.percentage, 5.0);

    // Progresso geral: 1 / 76 = ~1.3%
    assert.equal(stats.completedModules, 1);
    assert.equal(stats.percentage, 1.3);
  });

  test('Conclusão de 10 módulos em Química deve resultar em 50.0%', () => {
    const progressMap = {};
    const quimicaSubj = subjects.find(s => s.id === 'quimica');
    for (let i = 0; i < 10; i++) {
      progressMap[quimicaSubj.modules[i].id] = { completed: true, completedItems: [] };
    }

    const stats = computeStats(subjects, progressMap);
    const quimica = stats.subjects.find(s => s.id === 'quimica');

    assert.equal(quimica.completedModules, 10);
    assert.equal(quimica.pendingModules, 10);
    assert.equal(quimica.percentage, 50.0);
  });

  test('Conclusão de todos os 76 módulos deve resultar em 100.0%', () => {
    const progressMap = {};
    for (const s of subjects) {
      for (const m of s.modules) {
        progressMap[m.id] = { completed: true, completedItems: m.items.map(it => it.id) };
      }
    }

    const stats = computeStats(subjects, progressMap);
    assert.equal(stats.completedModules, 76);
    assert.equal(stats.pendingModules, 0);
    assert.equal(stats.percentage, 100.0);
    assert.equal(stats.completedItems, 1525);

    for (const s of stats.subjects) {
      assert.equal(s.percentage, 100.0);
      assert.equal(s.pendingModules, 0);
    }
  });

  test('Não deve ocorrer divisão por zero se matérias forem vazias', () => {
    const stats = computeStats([], {});
    assert.equal(stats.totalModules, 0);
    assert.equal(stats.percentage, 0);
  });
});
