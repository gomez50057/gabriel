export default function ScoreBadge({ label, value, styles }) {
  return (
    <div className={styles.scoreBadge}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
