interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={rest.type ?? "button"}
      className={`btn btn-${variant} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
