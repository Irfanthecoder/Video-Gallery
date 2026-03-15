/**
 * Tag input: chips (pill + remove) + text input to add, optional suggestions from API.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { videoService } from "../../services";
import { TAGS_MAX_COUNT, TAG_MIN_LENGTH, TAG_MAX_LENGTH } from "../../constants";
import { parseTags } from "../../utils";

function tagsToValue(tags: string[]): string {
  return tags.join(", ");
}

interface TagInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function TagInput({ value, onChange, disabled, placeholder = "Add tags…" }: TagInputProps) {
  const tags = parseTags(value);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tagError, setTagError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (tag: string) => {
      setTagError(null);
      const t = tag.trim().slice(0, TAG_MAX_LENGTH);
      if (!t) return;
      if (t.length < TAG_MIN_LENGTH) {
        setTagError(`Each tag must be at least ${TAG_MIN_LENGTH} characters.`);
        return;
      }
      if (t.length > TAG_MAX_LENGTH) {
        setTagError(`Each tag must be at most ${TAG_MAX_LENGTH} characters.`);
        return;
      }
      if (tags.includes(t)) {
        setTagError("That tag is already added.");
        return;
      }
      if (tags.length >= TAGS_MAX_COUNT) {
        setTagError(`At most ${TAGS_MAX_COUNT} tags allowed.`);
        return;
      }
      const next = [...tags, t];
      onChange(tagsToValue(next));
      setInputValue("");
    },
    [tags, onChange]
  );

  const removeTag = useCallback(
    (index: number) => {
      const next = tags.filter((_, i) => i !== index);
      onChange(tagsToValue(next));
    },
    [tags, onChange]
  );

  useEffect(() => {
    videoService.getTags({ top: 10 }).then((res) => setSuggestions(res.tags || [])).catch(() => {});
  }, []);

  const availableSuggestions = suggestions.filter((s) => !tags.includes(s)).slice(0, 10);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="tag-input-wrap">
      <label className="tag-input-label">Tags</label>
      <div
        className={`tag-input-inner ${disabled ? "disabled" : ""}`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag, i) => (
          <span key={`${tag}-${i}`} className="tag-chip">
            <span className="tag-chip-text" title={tag}>{tag}</span>
            {!disabled && (
              <button
                type="button"
                className="tag-chip-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(i);
                }}
                aria-label={`Remove ${tag}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
        {tags.length < TAGS_MAX_COUNT && (
          <input
            ref={inputRef}
            type="text"
            className="tag-input-field"
            value={inputValue}
            maxLength={TAG_MAX_LENGTH}
            onChange={(e) => {
              const v = e.target.value.slice(0, TAG_MAX_LENGTH);
              setInputValue(v);
              if (v.length >= TAG_MAX_LENGTH) {
                setTagError(`Each tag must be at most ${TAG_MAX_LENGTH} characters.`);
              } else if (tagError) {
                setTagError(null);
              }
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={tags.length === 0 ? placeholder : ""}
            aria-label="Add tag"
          />
        )}
      </div>
      {tagError && <p className="form-error tag-input-error" role="alert">{tagError}</p>}
      {availableSuggestions.length > 0 && !disabled && (
        <div className="tag-suggestions">
          <span className="tag-suggestions-label">Most used tags:</span>
          {availableSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="tag-suggestion-btn"
              onClick={() => addTag(s)}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
