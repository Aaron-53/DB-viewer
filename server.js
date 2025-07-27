import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Global MongoDB client
let mongoClient = null;
let currentDb = null;

// Connect to MongoDB
app.post("/api/connect", async (req, res) => {
  const { connectionString } = req.body;

  if (!connectionString) {
    return res.status(400).json({ error: "Connection string is required" });
  }

  try {
    // Close existing connection if any
    if (mongoClient) {
      await mongoClient.close();
    }

    // Create new connection
    mongoClient = new MongoClient(connectionString);
    await mongoClient.connect();

    // Test connection by listing databases
    const adminDb = mongoClient.db().admin();
    await adminDb.listDatabases();

    res.json({ success: true, message: "Connected successfully" });
  } catch (error) {
    console.error("Connection error:", error);
    res.status(500).json({
      error: `Failed to connect: ${error.message}`,
      success: false,
    });
  }
});

// Get list of databases
app.get("/api/databases", async (req, res) => {
  if (!mongoClient) {
    return res.status(400).json({ error: "Not connected to MongoDB" });
  }

  try {
    const adminDb = mongoClient.db().admin();
    const result = await adminDb.listDatabases();

    res.json({
      databases: result.databases.map((db) => ({
        name: db.name,
        sizeOnDisk: db.sizeOnDisk,
        empty: db.empty,
      })),
    });
  } catch (error) {
    console.error("Error listing databases:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get collections for a database
app.get("/api/collections/:dbName", async (req, res) => {
  const { dbName } = req.params;

  if (!mongoClient) {
    return res.status(400).json({ error: "Not connected to MongoDB" });
  }

  try {
    const db = mongoClient.db(dbName);
    const collections = await db.listCollections().toArray();

    res.json({
      collections: collections.map((col) => ({
        name: col.name,
        type: col.type,
      })),
    });
  } catch (error) {
    console.error("Error listing collections:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get documents from a collection
app.get("/api/documents/:dbName/:collectionName", async (req, res) => {
  const { dbName, collectionName } = req.params;
  const limit = parseInt(req.query.limit) || 50;

  if (!mongoClient) {
    return res.status(400).json({ error: "Not connected to MongoDB" });
  }

  try {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const documents = await collection.find({}).limit(limit).toArray();
    const count = await collection.countDocuments();

    res.json({
      documents,
      totalCount: count,
      returnedCount: documents.length,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get collection stats
app.get("/api/stats/:dbName/:collectionName", async (req, res) => {
  const { dbName, collectionName } = req.params;

  if (!mongoClient) {
    return res.status(400).json({ error: "Not connected to MongoDB" });
  }

  try {
    const db = mongoClient.db(dbName);
    const collection = db.collection(collectionName);

    const stats = await db.command({ collStats: collectionName });
    const count = await collection.countDocuments();

    res.json({
      documentCount: count,
      averageDocumentSize: stats.avgObjSize,
      collectionSize: stats.size,
      storageSize: stats.storageSize,
      indexCount: stats.nindexes,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: error.message });
  }
});

// Disconnect from MongoDB
app.post("/api/disconnect", async (req, res) => {
  try {
    if (mongoClient) {
      await mongoClient.close();
      mongoClient = null;
    }
    res.json({ success: true, message: "Disconnected successfully" });
  } catch (error) {
    console.error("Error disconnecting:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    connected: !!mongoClient,
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 MongoDB Viewer Backend running on http://localhost:${port}`);
  console.log(`📋 Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  if (mongoClient) {
    await mongoClient.close();
    console.log("📤 MongoDB connection closed");
  }
  process.exit(0);
});
