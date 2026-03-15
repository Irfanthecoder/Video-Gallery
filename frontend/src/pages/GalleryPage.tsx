/**
 * Gallery: list videos, filter by title (debounced) and tag, pagination.
 * useVideos fetches and writes to store; tag options derived from current list.
 */
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useVideos } from "../hooks";
import { useVideoStore } from "../store";
import { PageTitle, VideoCard, TagFilterCombobox } from "../components";
import { DEBOUNCE_MS_SEARCH, GALLERY_PAGE_SIZE } from "../constants";
import { debounce } from "../utils";

export function GalleryPage() {
  const [page, setPage] = useState(1);
  const { videos, total, loading, error } = useVideos(page, GALLERY_PAGE_SIZE);
  const { filters, setFilters } = useVideoStore();
  const [titleInput, setTitleInput] = useState(filters.titleSearch);

  const totalPages = Math.max(1, Math.ceil(total / GALLERY_PAGE_SIZE));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  /** Page numbers to show: e.g. [1, 2, 3, 4, 5] or [1, "...", 4, 5, 6, "...", 10] */
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (page > 3) pages.push("ellipsis");
    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);
    for (let p = start; p <= end; p++) {
      if (p !== 1 && p !== totalPages) pages.push(p);
    }
    if (page < totalPages - 2) pages.push("ellipsis");
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  }, [totalPages, page]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  const setTitleSearch = useMemo(
    () =>
      debounce((value: string) => {
        setFilters({ titleSearch: value });
      }, DEBOUNCE_MS_SEARCH),
    [setFilters]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTitleInput(v);
    setTitleSearch(v);
    setPage(1);
  };

  const handleTagChange = (value: string) => {
    setFilters({ tagFilter: value });
    setPage(1);
  };

  return (
    <motion.div
      className="gallery-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageTitle>Gallery</PageTitle>

      <div className="gallery-filters">
        <input
          type="search"
          placeholder="Search by title"
          value={titleInput}
          onChange={handleTitleChange}
          className="filter-input"
          aria-label="Search by title"
        />
        <TagFilterCombobox
          value={filters.tagFilter}
          onChange={handleTagChange}
          aria-label="Filter by tag (type to search)"
        />
      </div>

      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : videos.length === 0 ? (
        <p className="muted">No videos found.</p>
      ) : (
        <>
          <motion.ul
            className="gallery-grid"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </motion.ul>
          <nav className="pagination" aria-label="Gallery pagination">
              <span className="pagination-info">
                <span className="pagination-count">
                  {videos.length} video{videos.length !== 1 ? "s" : ""}
                </span>
              </span>
              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrev || loading}
                  aria-label="Previous page"
                >
                  ‹
                </button>
                <div className="pagination-numbers">
                  {pageNumbers.map((n, i) =>
                    n === "ellipsis" ? (
                      <span key={`e-${i}`} className="pagination-ellipsis" aria-hidden>…</span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        className={`pagination-num ${n === page ? "current" : ""}`}
                        onClick={() => setPage(n)}
                        disabled={loading}
                        aria-label={n === page ? `Current page, page ${n}` : `Go to page ${n}`}
                        aria-current={n === page ? "page" : undefined}
                      >
                        {n}
                      </button>
                    )
                  )}
                </div>
                <button
                  type="button"
                  className="pagination-arrow"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!hasNext || loading}
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            </nav>
        </>
      )}
    </motion.div>
  );
}
