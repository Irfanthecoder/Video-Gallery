import type { Video, VideoInsert, FindVideosFilter, AndOrQuery } from "../interfaces/index.js";
import { parseDate } from "../utils/index.js";
import { findOne, createOne, findWithFilter, countWithFilter, TABLE_VIDEOS, COLS_VIDEOS, postgresHelper } from "../db/index.js";

/** Maps DB row to Video */
function mapRow(row: Record<string, unknown>): Video {
  return {
    id: Number(row.id),
    title: row.title as string,
    description: row.description as string | null,
    file_path: row.file_path as string,
    tags: row.tags as string[],
    created_at: parseDate(row.created_at),
  };
}

/** Creates a new video */
export async function createVideo(row: VideoInsert): Promise<Video> {
  const created = await createOne(TABLE_VIDEOS, {
    title: row.title,
    description: row.description ?? null,
    file_path: row.file_path,
    tags: row.tags,
  });
  if (!created) throw new Error("Failed to create video");
  return mapRow(created as Record<string, unknown>);
}

/** Finds a video by ID */
export async function findVideoById(id: number): Promise<Video | null> {
  const row = await findOne(TABLE_VIDEOS, COLS_VIDEOS, { id });
  if (!row) return null;
  return mapRow(row as Record<string, unknown>);
}

/** Finds videos with optional title and tag filters, paginated */
export async function findVideos(
  filter: FindVideosFilter,
  limit: number,
  offset: number
): Promise<{ videos: Video[]; total: number }> {
  const and: AndOrQuery["and"] = [];
  const titleSearch = filter.titleSearch?.trim();
  if (titleSearch) {
    and.push({ field: "title", op: "ilike", value: `%${titleSearch}%` });
  }
  const tagFilter = filter.tagFilter?.trim();
  if (tagFilter) {
    and.push({ field: "tags", op: "any", value: tagFilter });
  }

  const whereData: AndOrQuery = { and };
  const [rows, total] = await Promise.all([
    findWithFilter(TABLE_VIDEOS, COLS_VIDEOS, whereData, {
      orderBy: "created_at DESC",
      limit,
      offset,
    }),
    countWithFilter(TABLE_VIDEOS, whereData),
  ]);
  return {
    videos: (rows as Record<string, unknown>[]).map(mapRow),
    total,
  };
}

/** All distinct tag values from all videos (for suggestions). No separate tags table. */
export async function findDistinctTags(): Promise<string[]> {
  return postgresHelper.getDistinctFromArrayColumn(TABLE_VIDEOS, "tags", "tag");
}

/** Top N most-used tags (by video count), for gallery filter. */
export async function findTopTags(limit: number): Promise<string[]> {
  return postgresHelper.getTopFromArrayColumn(TABLE_VIDEOS, "tags", limit, "tag");
}
