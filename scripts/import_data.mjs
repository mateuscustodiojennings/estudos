#!/usr/bin/env node
/**
 * Script de importação segura e idempotente para o MongoDB Atlas.
 * Lê a estrutura oficial de data/study_structure.json e insere ou atualiza
 * as matérias e módulos sem apagar o progresso existente dos usuários.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega variáveis do arquivo .env ou .env.local se existirem
const envPath = path.resolve(__dirname, '..', '.env');
const envLocalPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'monitoramento_estudos';

if (!uri || uri.includes('<usuario>') || uri.includes('<cluster>')) {
  console.error('\n[ERRO] Variável MONGODB_URI não configurada no ambiente ou no arquivo .env.');
  console.error('Por favor, configure sua conexão do MongoDB Atlas antes de executar a importação.');
  console.error('Exemplo em .env: MONGODB_URI="mongodb+srv://admin:senha@meu-cluster.mongodb.net/?retryWrites=true&w=majority"\n');
  process.exit(1);
}

const jsonPath = path.resolve(__dirname, '..', 'data', 'study_structure.json');
if (!fs.existsSync(jsonPath)) {
  console.error(`[ERRO] Arquivo de dados '${jsonPath}' não encontrado.`);
  console.error('Execute primeiro: npm run extract:pdf');
  process.exit(1);
}

const rawData = fs.readFileSync(jsonPath, 'utf-8');
const studyData = JSON.parse(rawData);

async function main() {
  console.log(`Conectando ao MongoDB Atlas (banco: ${dbName})...`);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

  try {
    await client.connect();
    console.log('Conexão estabelecida com sucesso!');
    const db = client.db(dbName);

    // 1. Criar coleções e índices essenciais
    console.log('Criando índices de segurança e performance...');
    await db.collection('subjects').createIndex({ id: 1 }, { unique: true });
    await db.collection('subjects').createIndex({ order: 1 });
    await db.collection('progress').createIndex({ userId: 1, moduleId: 1 }, { unique: true });
    await db.collection('progress').createIndex({ userId: 1 });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

    // 2. Importação idempotente de matérias e módulos
    console.log(`Importando ${studyData.subjects.length} matérias e seus módulos de forma idempotente...`);
    let subjectsUpdated = 0;
    let totalModules = 0;
    let totalItems = 0;

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
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      );
      subjectsUpdated++;
      totalModules += subj.modules_count;
      totalItems += subj.total_items;
    }

    console.log('\n======================================================');
    console.log('       IMPORTAÇÃO CONCLUÍDA COM SUCESSO!              ');
    console.log('======================================================');
    console.log(`- Matérias atualizadas/inseridas: ${subjectsUpdated}`);
    console.log(`- Módulos organizados: ${totalModules}`);
    console.log(`- Itens/aulas indexados: ${totalItems}`);
    console.log('- O progresso existente dos usuários foi PRESERVADO integralmente.');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n[ERRO NA IMPORTAÇÃO]', error.message);
    if (error.message.includes('not allowed to do action')) {
      console.error('\n-------------------------------------------------------------');
      console.error('[COMO RESOLVER NO MONGODB ATLAS]:');
      console.error('O usuário de banco configurado na MONGODB_URI não tem permissão de escrita.');
      console.error('1. Acesse o painel do MongoDB Atlas: https://cloud.mongodb.com');
      console.error('2. No menu à esquerda, clique em "Database Access" (dentro de Security).');
      console.error('3. Localize seu usuário de banco de dados e clique em "Edit".');
      console.error('4. Em "Built-in Role", selecione: "Read and write to any database".');
      console.error('5. Clique em "Update User" no final da página.');
      console.error('6. Execute novamente: npm run import:pdf');
      console.error('-------------------------------------------------------------\n');
    }
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
