type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p className="muted" style={{ marginBottom: 0 }}>
        {description}
      </p>
    </div>
  );
}

