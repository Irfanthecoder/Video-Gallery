interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id?: string;
  /** When set, shows "length / max" inside the textarea at the right (small). */
  showCharCount?: number;
}

export function Textarea({ label, id, showCharCount, value = "", ...rest }: TextareaProps) {
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  const len = typeof value === "string" ? value.length : 0;
  const hasCount = showCharCount != null;
  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      {hasCount ? (
        <div className="textarea-with-count">
          <textarea id={inputId} value={value} {...rest} className={`${rest.className ?? ""} textarea-has-count`.trim()} />
          <span className="textarea-char-count" aria-live="polite">{len}/{showCharCount}</span>
        </div>
      ) : (
        <textarea id={inputId} value={value} {...rest} />
      )}
    </div>
  );
}
