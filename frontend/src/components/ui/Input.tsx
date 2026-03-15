interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id?: string;
  /** When set, shows "length / max" inside the input at the right (small). */
  showCharCount?: number;
}

export function Input({ label, id, showCharCount, value = "", ...rest }: InputProps) {
  const inputId = id ?? label.replace(/\s+/g, "-").toLowerCase();
  const len = typeof value === "string" ? value.length : 0;
  const hasCount = showCharCount != null;
  return (
    <div className="form-group">
      <label htmlFor={inputId}>{label}</label>
      {hasCount ? (
        <div className="input-with-count">
          <input id={inputId} value={value} {...rest} className={`${rest.className ?? ""} input-has-count`.trim()} />
          <span className="input-char-count" aria-live="polite">{len}/{showCharCount}</span>
        </div>
      ) : (
        <input id={inputId} value={value} {...rest} />
      )}
    </div>
  );
}
