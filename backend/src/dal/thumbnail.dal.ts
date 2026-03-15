import type { Thumbnail, ThumbnailInsert } from "../interfaces/index.js";
import { parseDate } from "../utils/index.js";
import {
  findAll,
  createOne,
  postgresHelper,
  TABLE_THUMBNAILS,
  COLS_THUMBNAILS,
} from "../db/index.js";

/** Maps DB row to Thumbnail */
function mapRow(row: Record<string, unknown>): Thumbnail {
  return {
    id: Number(row.id),
    video_id: Number(row.video_id),
    file_path: row.file_path as string,
    is_primary: row.is_primary as boolean,
    created_at: parseDate(row.created_at),
  };
}

/** Creates a new thumbnail */
export async function createThumbnail(row: ThumbnailInsert): Promise<Thumbnail> {
  const created = await createOne(TABLE_THUMBNAILS, {
    video_id: row.video_id,
    file_path: row.file_path,
    is_primary: row.is_primary,
  });
  if (!created) throw new Error("Failed to create thumbnail");
  return mapRow(created as Record<string, unknown>);
}

/** Creates a batch of thumbnails */
export async function createThumbnailsBatch(rows: ThumbnailInsert[]): Promise<Thumbnail[]> {
  const out: Thumbnail[] = [];
  for (let i = 0; i < rows.length; i++) {
    const thumb = await createThumbnail({ ...rows[i], is_primary: i === 0 });
    out.push(thumb);
  }
  return out;
}

/** Finds thumbnails by video ID */
export async function findThumbnailsByVideoId(videoId: number): Promise<Thumbnail[]> {
  const rows = await findAll(
    TABLE_THUMBNAILS,
    COLS_THUMBNAILS,
    { video_id: videoId },
    "is_primary DESC, created_at ASC"
  );
  return (rows as Record<string, unknown>[]).map(mapRow);
}

/** Sets the primary thumbnail for a video */
export async function setPrimaryThumbnail(
  videoId: number,
  thumbnailId: number
): Promise<Thumbnail | null> {
  const rows = await postgresHelper.withTransaction(async (client) => {
    await postgresHelper.updateWithClient(
      client,
      TABLE_THUMBNAILS,
      { is_primary: false },
      { video_id: videoId }
    );
    return postgresHelper.updateReturningWithClient(
      client,
      TABLE_THUMBNAILS,
      { is_primary: true },
      { id: thumbnailId, video_id: videoId }
    );
  });
  if (!rows?.length) return null;
  return mapRow(rows[0] as Record<string, unknown>);
}
