CREATE TABLE IF NOT EXISTS climbs (
  id TEXT PRIMARY KEY,
  grade TEXT NOT NULL,
  date TEXT NOT NULL,
  gym TEXT NOT NULL,
  location TEXT,
  attempts INTEGER,
  video_key TEXT NOT NULL,
  poster_key TEXT,
  duration REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_climbs_grade ON climbs (grade);
CREATE INDEX IF NOT EXISTS idx_climbs_date ON climbs (date DESC);
