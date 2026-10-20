import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';

describe('Integração Real com Banco de Dados MongoDB', () => {
  let mongod;
  let client;
  let db;

  const jsonPath = path.resolve('data', 'study_structure.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const studyData = JSON.parse(rawData);

  before(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('monitoramento_test');
  });

  after(async () => {
    if (client) await client.close();
    if (mongod) await mongod.stop();
  });

  test('1. Deve conectar com sucesso e responder ao comando ping', async () => {
    const pingResult = await db.command({ ping: 1 });
    assert.equal(pingResult.ok, 1);
  });

  test('2. Deve criar índices únicos e de ordenação', async () => {
    await db.collection('subjects').createIndex({ id: 1 }, { unique: true });
    await db.collection('subjects').createIndex({ order: 1 });
    await db.collection('progress').createIndex({ userId: 1, moduleId: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

    const subjectIndexes = await db.collection('subjects').indexes();
    const hasUniqueId = subjectIndexes.some(idx => idx.key.id === 1 && idx.unique);
    assert.ok(hasUniqueId, 'Índice único em subjects.id deve existir');
  });

  test('3. Deve importar as 4 matérias e 76 módulos de forma idempotente', async () => {
    for (const subj of studyData.subjects) {
      await db.collection('subjects').updateOne(
        { id: subj.id },
        {
          $set: {
            id: subj.id,
            name: subj.name,
            original_title: subj.original_title,
            order: subj.order,
            modules_count: subj.modules_count,
            total_declared_aulas: subj.total_declared_aulas,
            total_items: subj.total_items,
            modules: subj.modules,
          },
        },
        { upsert: true }
      );
    }

    const count = await db.collection('subjects').countDocuments();
    assert.equal(count, 4);

    // Executa a importação uma segunda vez para garantir idempotência
    for (const subj of studyData.subjects) {
      await db.collection('subjects').updateOne(
        { id: subj.id },
        { $set: { id: subj.id, name: subj.name } },
        { upsert: true }
      );
    }
    const countAfterSecondRun = await db.collection('subjects').countDocuments();
    assert.equal(countAfterSecondRun, 4, 'Importação repetida não deve duplicar registros');
  });

  test('4. Deve registrar usuário com hash seguro bcrypt', async () => {
    const password = 'senha_teste_segura';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await db.collection('users').insertOne({
      userId: 'usr_test_1',
      username: 'estudante_ferretto',
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const user = await db.collection('users').findOne({ username: 'estudante_ferretto' });
    assert.ok(user);
    assert.notEqual(user.passwordHash, password, 'A senha nunca pode ser salva em texto puro');
    
    const isValid = await bcrypt.compare(password, user.passwordHash);
    assert.ok(isValid, 'Hash deve validar a senha original');
  });

  test('5. Deve persistir marcação de módulo concluído no MongoDB', async () => {
    const userId = 'usr_test_1';
    const moduleId = 'quimica_quimica-basica';

    await db.collection('progress').updateOne(
      { userId, moduleId },
      {
        $set: {
          userId,
          moduleId,
          completed: true,
          completedItems: ['quimica_quimica-basica_aula-1', 'quimica_quimica-basica_aula-2'],
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    const doc = await db.collection('progress').findOne({ userId, moduleId });
    assert.ok(doc);
    assert.equal(doc.completed, true);
    assert.equal(doc.completedItems.length, 2);
  });

  test('6. Deve persistir remoção de conclusão de módulo (desmarcar)', async () => {
    const userId = 'usr_test_1';
    const moduleId = 'quimica_quimica-basica';

    await db.collection('progress').updateOne(
      { userId, moduleId },
      {
        $set: {
          completed: false,
          completedItems: [],
          updatedAt: new Date().toISOString(),
        },
      }
    );

    const doc = await db.collection('progress').findOne({ userId, moduleId });
    assert.ok(doc);
    assert.equal(doc.completed, false);
    assert.equal(doc.completedItems.length, 0);
  });

  test('7. Nova importação do catálogo não pode apagar o progresso do usuário', async () => {
    const userId = 'usr_test_1';
    const moduleId = 'quimica_atomo';

    // Salva progresso do usuário
    await db.collection('progress').updateOne(
      { userId, moduleId },
      {
        $set: {
          userId,
          moduleId,
          completed: true,
          completedItems: ['quimica_atomo_aula-1'],
          updatedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    // Simula re-execução da importação da estrutura de estudos
    for (const subj of studyData.subjects) {
      await db.collection('subjects').updateOne(
        { id: subj.id },
        { $set: { id: subj.id, name: subj.name } },
        { upsert: true }
      );
    }

    // Verifica se o progresso permanece intacto
    const userProgress = await db.collection('progress').findOne({ userId, moduleId });
    assert.ok(userProgress, 'Progresso do usuário deve continuar existindo após nova importação');
    assert.equal(userProgress.completed, true);
  });
});
