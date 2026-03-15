
-- -----------------------------------------------------------------------------
-- Videos: metadata and file reference
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS videos (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  file_path   TEXT NOT NULL,
  tags        TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Thumbnails: one or more per video, one marked primary
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS thumbnails (
  id         SERIAL PRIMARY KEY,
  video_id   INTEGER NOT NULL REFERENCES videos (id) ON DELETE CASCADE,
  file_path  TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_thumbnails_video_id ON thumbnails (video_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN (tags);
