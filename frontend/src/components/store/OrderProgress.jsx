import { Ban, Check } from 'lucide-react';
import { ORDER_PROGRESS } from '../../utils/constants';

const STEP_LABELS = { pending: 'Order placed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };

export default function OrderProgress({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="alert alert--error progress-cancelled" role="status">
        <Ban size={18} aria-hidden="true" /> This order was cancelled.
      </div>
    );
  }
  const current = Math.max(0, ORDER_PROGRESS.indexOf(status));
  return (
    <ol className="progress" aria-label="Order progress">
      {ORDER_PROGRESS.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'current' : 'todo';
        return (
          <li key={step} className={`progress__step progress__step--${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="progress__dot">{state === 'done' || (state === 'current' && step === 'delivered') ? <Check size={14} /> : null}</span>
            <span className="progress__label">{STEP_LABELS[step]}</span>
          </li>
        );
      })}
    </ol>
  );
}
