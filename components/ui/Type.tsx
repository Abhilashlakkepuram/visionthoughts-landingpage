import type { ReactNode } from "react";

type LinesProps = {
  /** One entry per visual line — masked and revealed in sequence. */
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  lineClassName?: string;
  /** Skip the global scroll reveal (the hero drives its own timeline). */
  manual?: boolean;
  id?: string;
};

/**
 * A heading split into masked lines. The text stays real, selectable and
 * readable to assistive tech — only the inner spans move.
 */
export function MaskedLines({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  manual = false,
  id,
}: LinesProps) {
  const content = lines.map((line, i) => (
    <span key={i} className={`line-mask ${lineClassName}`}>
      <span className="line-inner">{line}</span>
    </span>
  ));

  const props = {
    id,
    className,
    ...(manual ? {} : { "data-lines": "" }),
  };

  if (Tag === "h1") return <h1 {...props}>{content}</h1>;
  if (Tag === "h3") return <h3 {...props}>{content}</h3>;
  if (Tag === "p") return <p {...props}>{content}</p>;
  if (Tag === "div") return <div {...props}>{content}</div>;
  return <h2 {...props}>{content}</h2>;
}

/** Small mono eyebrow with a rule, used to open every section. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`label flex items-center gap-3 ${className}`} data-reveal="">
      <span aria-hidden="true" className="h-px w-8 bg-ember" />
      {children}
    </p>
  );
}
