import { AlertTriangle, Loader2 } from 'lucide-react';
import Button from './Button';

export const Spinner = ({ size = 20 }) => <Loader2 className="spin" size={size} aria-hidden="true" />;

export const Skeleton = ({ height = 16, width = '100%', radius, className = '' }) => (
  <span className={`skeleton ${className}`} style={{ height, width, borderRadius: radius }} aria-hidden="true" />
);

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader" role="status">
      <Spinner size={22} />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="state">
      {Icon && (
        <span className="state__icon">
          <Icon size={26} aria-hidden="true" />
        </span>
      )}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something didn't load", message, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon">
        <AlertTriangle size={26} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {onRetry && (
        <div className="state__action">
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
