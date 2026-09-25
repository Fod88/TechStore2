export default function StatCard({ icon: Icon, label, value, hint, tone = 'accent' }) {
  return (
    <div className="stat-card">
      <span className={`stat-card__icon stat-card__icon--${tone}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {hint && <p className="stat-card__hint">{hint}</p>}
      </div>
    </div>
  );
}
