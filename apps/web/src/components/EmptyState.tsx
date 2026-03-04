type Props = {
  title: string;
  description: string;
  icon?: string;
};

export default function EmptyState({ title, description, icon = "🗂️" }: Props) {
  return (
    <section className="empty-state" role="status" aria-live="polite">
      <div className="empty-state-icon" aria-hidden>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </section>
  );
}
