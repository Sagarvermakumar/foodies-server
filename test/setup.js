import dotenv from 'dotenv'
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// Load .env.test (if present). Keep secrets harmless for tests.
dotenv.config({ path: ".env" });

let mongo = null;

beforeAll(async () => {
  // Spin up in‑memory Mongo
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // Connect mongoose
  await mongoose.connect(uri, {
    dbName: "jestdb"
  });
});

afterEach(async () => {
  // Clean all collections between tests
  const { collections } = mongoose.connection;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Close DB & stop server
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});
