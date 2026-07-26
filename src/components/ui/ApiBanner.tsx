export function ApiBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="section-max section-pad pt-6">
      <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
        {message}
      </div>
    </div>
  );
}
