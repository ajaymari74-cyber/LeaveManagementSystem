const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'leave_audit';
const COLLECTION_NAME = 'audit_logs';

app.use(cors());
app.use(express.json());

const storageFile = path.join(__dirname, 'audit_logs.json');
let mongoCollection = null;
let isMongoConnected = false;

// Initialize MongoDB client with reconnection attempt
async function initMongo() {
  try {
    const client = new MongoClient(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    await client.connect();
    const db = client.db(DB_NAME);
    mongoCollection = db.collection(COLLECTION_NAME);
    isMongoConnected = true;
    console.log(`Connected to MongoDB: ${DB_NAME}.${COLLECTION_NAME}`);
  } catch (err) {
    console.warn(`MongoDB not connected (${err.message}). Using local JSON fallback storage.`);
    isMongoConnected = false;
  }
}

initMongo();

function readLocalLogs() {
  try {
    if (!fs.existsSync(storageFile)) return [];
    const raw = fs.readFileSync(storageFile, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeLocalLog(entry) {
  try {
    const logs = readLocalLogs();
    logs.unshift(entry);
    fs.writeFileSync(storageFile, JSON.stringify(logs, null, 2));
  } catch (e) {
    console.error('Failed to write local audit log:', e.message);
  }
}

// Root info endpoint
app.get(['/', '/audit', '/api/audit'], (req, res) => {
  res.json({
    service: 'Leave Management Audit Microservice',
    status: 'UP',
    mongoConnected: isMongoConnected,
    timestamp: new Date()
  });
});

// POST /log & /audit/log — Primary audit logging endpoint
app.post(['/log', '/audit/log', '/api/audit/log', '/api/log'], async (req, res) => {
  const { userId, action, leaveId, timestamp, details } = req.body;

  if (!userId || !action || !leaveId) {
    return res.status(400).json({ error: 'Missing required audit log fields' });
  }

  const logEntry = {
    userId: Number(userId),
    action: String(action),
    leaveId: Number(leaveId),
    timestamp: timestamp ? new Date(timestamp) : new Date(),
    details: details || ''
  };

  try {
    if (isMongoConnected && mongoCollection) {
      const result = await mongoCollection.insertOne({ ...logEntry });
      logEntry._id = result.insertedId;
    }
  } catch (err) {
    console.warn('MongoDB insert failed, using fallback:', err.message);
  }

  // Always keep local sync copy for inspection and fault-tolerance
  writeLocalLog(logEntry);

  console.log(`[AUDIT] Action: ${action} | LeaveId: ${leaveId} | User: ${userId}`);
  return res.status(201).json({ success: true, log: logEntry });
});

// GET /logs & /audit/logs — Retrieve all audit logs
app.get(['/logs', '/audit/logs', '/api/audit/logs', '/api/logs'], async (req, res) => {
  try {
    if (isMongoConnected && mongoCollection) {
      const logs = await mongoCollection.find().sort({ timestamp: -1 }).toArray();
      return res.json(logs);
    }
  } catch (e) {
    console.warn('Mongo fetch failed, reading fallback:', e.message);
  }
  return res.json(readLocalLogs());
});

// GET /logs/:leaveId & /audit/logs/:leaveId — Filter logs by leave ID
app.get(['/logs/:leaveId', '/audit/logs/:leaveId', '/api/audit/logs/:leaveId', '/api/logs/:leaveId'], async (req, res) => {
  const leaveId = Number(req.params.leaveId);
  try {
    if (isMongoConnected && mongoCollection) {
      const logs = await mongoCollection.find({ leaveId }).sort({ timestamp: -1 }).toArray();
      return res.json(logs);
    }
  } catch (e) {
    console.warn('Mongo fetch failed, reading fallback:', e.message);
  }
  const filtered = readLocalLogs().filter(item => item.leaveId === leaveId);
  return res.json(filtered);
});

// GET /health & /audit/health
app.get(['/health', '/audit/health', '/api/audit/health', '/api/health'], (req, res) => {
  res.json({
    status: 'UP',
    mongoConnected: isMongoConnected,
    timestamp: new Date()
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Audit log service running on http://localhost:${PORT}`);
  });
}

module.exports = app;
