import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Validação da Integridade dos Dados Extraídos do PDF', () => {
  const jsonPath = path.resolve('data', 'study_structure.json');
  assert.ok(fs.existsSync(jsonPath), 'Arquivo data/study_structure.json deve existir');

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);

  test('Deve conter as 4 matérias oficiais', () => {
    assert.equal(data.subjects.length, 4);
    const names = data.subjects.map(s => s.name);
    assert.deepEqual(names, ['Química', 'Física', 'Matemática', 'Biologia']);
  });

  test('Deve conter exatamente 76 módulos identificados', () => {
    const totalModules = data.subjects.reduce((acc, s) => acc + s.modules.length, 0);
    assert.equal(totalModules, 76);
  });

  test('Deve conter exatamente 1.525 itens/aulas identificados', () => {
    const totalItems = data.subjects.reduce((acc, s) => acc + s.total_items, 0);
    assert.equal(totalItems, 1525);
  });

  test('Matéria Química deve ter 20 módulos e 205 aulas', () => {
    const quimica = data.subjects.find(s => s.id === 'quimica');
    assert.ok(quimica);
    assert.equal(quimica.modules.length, 20);
    assert.equal(quimica.total_declared_aulas, 205);
    assert.equal(quimica.total_items, 205);
  });

  test('Matéria Física deve ter 17 módulos e 247 aulas', () => {
    const fisica = data.subjects.find(s => s.id === 'fisica');
    assert.ok(fisica);
    assert.equal(fisica.modules.length, 17);
    assert.equal(fisica.total_declared_aulas, 247);
    assert.equal(fisica.total_items, 247);
  });

  test('Matéria Matemática deve ter 20 módulos e 340 aulas', () => {
    const mat = data.subjects.find(s => s.id === 'matematica');
    assert.ok(mat);
    assert.equal(mat.modules.length, 20);
    assert.equal(mat.total_declared_aulas, 340);
    assert.equal(mat.total_items, 340);
  });

  test('Matéria Biologia deve preservar os 19 módulos, incluindo os 2 blocos de Ecologia', () => {
    const bio = data.subjects.find(s => s.id === 'biologia');
    assert.ok(bio);
    assert.equal(bio.modules.length, 19);

    const ecologiaCurto = bio.modules.find(m => m.name.includes('bloco curto'));
    const ecologiaExtenso = bio.modules.find(m => m.name.includes('módulo extenso'));
    assert.ok(ecologiaCurto, 'Deve conter Ecologia (bloco curto)');
    assert.ok(ecologiaExtenso, 'Deve conter Ecologia (módulo extenso)');
    assert.equal(ecologiaCurto.declared_aulas, 3);
    assert.equal(ecologiaExtenso.declared_aulas, 74);
  });

  test('Todos os IDs de módulos e itens devem ser únicos e estáveis', () => {
    const modIds = new Set();
    const itemIds = new Set();

    for (const subj of data.subjects) {
      for (const mod of subj.modules) {
        assert.ok(!modIds.has(mod.id), `ID duplicado de módulo: ${mod.id}`);
        modIds.add(mod.id);

        for (const it of mod.items) {
          assert.ok(!itemIds.has(it.id), `ID duplicado de item: ${it.id}`);
          itemIds.add(it.id);
        }
      }
    }

    assert.equal(modIds.size, 76);
    assert.equal(itemIds.size, 1525);
  });
});
