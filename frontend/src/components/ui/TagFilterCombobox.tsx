/**
 * Gallery tag filter: input + dropdown with top 10 most-used tags, filterable by text.
 */
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { videoService } from "../../services";

const TOP_TAGS_LIMIT = 10;

interface TagFilterComboboxProps {
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
  disabled?: boolean;
}

export function TagFilterCombobox({
  value,
  onChange,
  "aria-label": ariaLabel,
  disabled,
}: TagFilterComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [topTags, setTopTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    videoService.getTags({ top: TOP_TAGS_LIMIT }).then((res) => setTopTags(res.tags || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        const applied = inputValue.trim();
        onChange(applied);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, inputValue, onChange]);

  const query = inputValue.trim().toLowerCase();
  const options = useMemo(() => {
    const all: string[] = [""];
    topTags.forEach((t) => {
      if (!query || t.toLowerCase().includes(query)) all.push(t);
    });
    return all;
  }, [topTags, query]);

  const handleSelect = (tag: string) => {
    onChange(tag);
    setInputValue(tag);
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      setInputValue(value);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const firstMatch = options.find((o) => o !== "");
      if (options.length > 1 && firstMatch !== undefined) {
        handleSelect(firstMatch);
      } else if (inputValue.trim()) {
        onChange(inputValue.trim());
        setInputValue(inputValue.trim());
        setOpen(false);
      } else {
        handleSelect("");
      }
      return;
    }
  };

  const displayPlaceholder = !value ? "All tags" : "";
  const showDropdown = open && !disabled;

  return (
    <div className="tag-filter-combobox custom-select" ref={ref}>
      <input
        ref={inputRef}
        type="text"
        className={`custom-select-trigger tag-filter-input ${open ? "open" : ""}`}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={displayPlaceholder}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="tag-filter-list"
        id="tag-filter-input"
      />
      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            id="tag-filter-list"
            className="custom-select-dropdown"
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {options.length === 0 ? (
              <li className="custom-select-option muted">Type to filter or press Enter</li>
            ) : (
              options.map((tag) => (
                <motion.li
                  key={tag || "__all__"}
                  role="option"
                  aria-selected={tag === value}
                  className={`custom-select-option ${tag === value ? "selected" : ""}`}
                  onClick={() => handleSelect(tag)}
                  whileHover={{ backgroundColor: "var(--bg-elevated)" }}
                >
                  {tag || "All tags"}
                </motion.li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
