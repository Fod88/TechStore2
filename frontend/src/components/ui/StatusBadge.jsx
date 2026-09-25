import { STATUS_LABELS } from '../../utils/constants';

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" aria-hidden="true" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
