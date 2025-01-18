export const createChapterTableQuery = `
    CREATE TABLE IF NOT EXISTS Chapter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novelId INTEGER NOT NULL,
        path TEXT NOT NULL,
        name TEXT NOT NULL,
        releaseTime TEXT,
        bookmark INTEGER DEFAULT 0, 
        unread INTEGER DEFAULT 1,
        readTime TEXT,
        isDownloaded INTEGER DEFAULT 0,
        updatedTime TEXT,
        chapterNumber REAL NULL,
        page TEXT DEFAULT "1",
        position INTEGER DEFAULT 0,
        progress INTEGER,
        hidden INTEGER DEFAULT 0,
        UNIQUE(path, novelId),
        FOREIGN KEY (novelId) REFERENCES Novel(id) ON DELETE CASCADE
    )
`;

export const addHiddenColumnQuery = `
    ALTER TABLE Chapter ADD COLUMN hidden INTEGER DEFAULT 0
`;

export const createChapterNovelIdIndexQuery = `
    CREATE INDEX
    IF NOT EXISTS
    chapterNovelIdIndex ON Chapter(novelId)
`;
