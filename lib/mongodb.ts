import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'monitoramento_estudos';

interface MongoGlobal {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: typeof globalThis & MongoGlobal;

let clientPromise: Promise<MongoClient> | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(uri && uri.trim().length > 0 && !uri.includes('<usuario>') && !uri.includes('<cluster>'));
}

export function getMongoClientPromise(): Promise<MongoClient> {
  if (!isDatabaseConfigured()) {
    throw new Error('MONGODB_URI não está configurada ou possui valores de exemplo. Configure a variável no ambiente ou arquivo .env.');
  }

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      });
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }

  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db(dbName);
}
