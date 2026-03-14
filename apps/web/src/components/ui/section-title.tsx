type SectionTitleProps = {
  title: string;
  description: string;
};

export function SectionTitle({ title, description }: SectionTitleProps) {
  return (
    <div className="section-stack">
      <div className="eyebrow">Feature-first</div>
      <div>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.8rem" }}>{title}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

