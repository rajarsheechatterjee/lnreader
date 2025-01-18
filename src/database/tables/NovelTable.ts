export const createNovelTableQuery = `
  CREATE TABLE IF NOT EXISTS Novel (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL,
    pluginId TEXT NOT NULL,
    name TEXT NOT NULL,
    cover TEXT, 
    summary TEXT, 
    author TEXT, 
    artist TEXT, 
    status TEXT Default 'Unknown', 
    genres TEXT,
    rating REAL,
    inLibrary INTEGER DEFAULT 0,
    isLocal INTEGER DEFAULT 0,
    totalPages INTEGER DEFAULT 0,
    UNIQUE(path, pluginId)
  );
`;
