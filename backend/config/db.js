import mongoose from 'mongoose';
import { Resolver } from 'dns/promises';

// ─────────────────────────────────────────────────────────────────────────────
// We bypass Node's system DNS (which blocks SRV queries on this machine) by
// using an explicit Google DNS resolver to look up the Atlas SRV + TXT records,
// then building a standard (non-SRV) connection URI from the resolved shard hosts.
// ─────────────────────────────────────────────────────────────────────────────

const ATLAS_HOST   = 'cluster0.jr88j52.mongodb.net';
const DB_USER      = 'tusharjeetrout2003_db_user';
const DB_PASS      = 'Raja2003';
const DB_NAME      = 'acadtrack';

const buildDirectURI = async () => {
  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8:53', '8.8.4.4:53', '1.1.1.1:53']); // Google + Cloudflare DNS

  // Resolve SRV → list of shard hosts + ports
  const srvRecords = await resolver.resolveSrv(`_mongodb._tcp.${ATLAS_HOST}`);
  const hosts = srvRecords.map((r) => `${r.name}:${r.port}`).join(',');

  // Resolve TXT → authSource & replicaSet options
  const txtRecords  = await resolver.resolveTxt(ATLAS_HOST);
  const txtOptions  = txtRecords.flat().join('&'); // e.g. authSource=admin&replicaSet=atlas-xxx-shard-0

  const user = encodeURIComponent(DB_USER);
  const pass = encodeURIComponent(DB_PASS);

  return `mongodb://${user}:${pass}@${hosts}/${DB_NAME}?${txtOptions}&tls=true&retryWrites=true&w=majority`;
};

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS:          45000,
    connectTimeoutMS:         15000,
    maxPoolSize:              10,
    tls:                      true,
  };

  let retries = 5;

  while (retries > 0) {
    try {
      console.log('Resolving Atlas shard hosts via Google DNS...');
      const uri  = await buildDirectURI();
      const conn = await mongoose.connect(uri, options);
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed: ${error.message}`);
      if (retries === 0) {
        console.error('All connection retries exhausted. Exiting...');
        process.exit(1);
      }
      console.log(`⏳ Retrying in 3s... (${retries} attempts left)`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

export default connectDB;
