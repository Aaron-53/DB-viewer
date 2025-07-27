import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [connectionString, setConnectionString] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Backend API base URL (will be our Express server)
  const API_BASE = "http://localhost:3001/api";

  const connectToMongoDB = async () => {
    if (!connectionString.trim()) {
      setError("Please provide a MongoDB connection string");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Connect to MongoDB via our backend
      const response = await axios.post(`${API_BASE}/connect`, {
        connectionString: connectionString.trim(),
      });

      if (response.data.success) {
        // Fetch databases after successful connection
        const dbResponse = await axios.get(`${API_BASE}/databases`);
        setDatabases(dbResponse.data.databases || []);
        setIsConnected(true);
      } else {
        setError(response.data.error || "Connection failed");
      }
    } catch (err) {
      setError(
        `Connection failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async (dbName) => {
    if (!dbName) return;

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/collections/${dbName}`);
      setCollections(response.data.collections || []);
      setSelectedDatabase(dbName);
      setSelectedCollection("");
      setDocuments([]);
    } catch (err) {
      setError(
        `Failed to fetch collections: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (collectionName) => {
    if (!collectionName || !selectedDatabase) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/documents/${selectedDatabase}/${collectionName}?limit=50`
      );
      setDocuments(response.data.documents || []);
      setSelectedCollection(collectionName);
    } catch (err) {
      setError(
        `Failed to fetch documents: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setDatabases([]);
    setCollections([]);
    setDocuments([]);
    setSelectedDatabase("");
    setSelectedCollection("");
    setError("");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍃 MongoDB Viewer</h1>
        <p>Connect to your MongoDB Atlas database and explore your data</p>
      </header>

      {!isConnected ? (
        <div className="connection-form">
          <h2>Connect to MongoDB</h2>
          <div className="form-group">
            <label>MongoDB Connection String:</label>
            <input
              type="text"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              placeholder="mongodb://localhost:27017/mydb or mongodb+srv://..."
            />
          </div>
          <button
            onClick={connectToMongoDB}
            disabled={loading || !connectionString.trim()}
            className="connect-btn"
          >
            {loading ? "Connecting..." : "Connect"}
          </button>
          {error && <div className="error">{error}</div>}

          <div className="info-box">
            <h3>Connection String Examples:</h3>
            <ul>
              <li>
                <strong>Local MongoDB:</strong>{" "}
                <code>mongodb://localhost:27017</code>
              </li>
              <li>
                <strong>MongoDB Atlas:</strong>{" "}
                <code>
                  mongodb+srv://username:password@cluster.mongodb.net/
                </code>
              </li>
              <li>
                <strong>With Auth:</strong>{" "}
                <code>mongodb://username:password@host:port/database</code>
              </li>
            </ul>
            <p>Make sure your MongoDB instance is accessible and running!</p>
          </div>
        </div>
      ) : (
        <div className="mongodb-viewer">
          <div className="connection-status">
            <span className="connected">✅ Connected to MongoDB</span>
            <button onClick={disconnect} className="disconnect-btn">
              Disconnect
            </button>
          </div>

          <div className="data-explorer">
            <div className="sidebar">
              <div className="databases-section">
                <h3>Databases ({databases.length})</h3>
                <ul className="databases-list">
                  {databases.map((db) => (
                    <li
                      key={db.name}
                      className={selectedDatabase === db.name ? "active" : ""}
                      onClick={() => fetchCollections(db.name)}
                    >
                      🗄️ {db.name}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedDatabase && (
                <div className="collections-section">
                  <h3>Collections in {selectedDatabase}</h3>
                  <ul className="collections-list">
                    {collections.map((collection) => (
                      <li
                        key={collection.name}
                        className={
                          selectedCollection === collection.name ? "active" : ""
                        }
                        onClick={() => fetchDocuments(collection.name)}
                      >
                        📋 {collection.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="main-content">
              {loading && <div className="loading">Loading...</div>}

              {selectedCollection && documents.length > 0 && (
                <div className="documents-section">
                  <h3>Documents in {selectedCollection} (showing first 50)</h3>
                  <div className="documents-grid">
                    {documents.map((doc, index) => (
                      <div key={index} className="document-card">
                        <pre>{JSON.stringify(doc, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedCollection && documents.length === 0 && !loading && (
                <div className="empty-state">
                  <p>No documents found in this collection</p>
                </div>
              )}

              {!selectedDatabase && !loading && (
                <div className="welcome-state">
                  <h2>👈 Select a database to get started</h2>
                  <p>
                    Choose a database from the sidebar to view its collections
                    and documents.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && <div className="error">{error}</div>}
        </div>
      )}
    </div>
  );
}

export default App;
