import { Link } from 'react-router-dom';

export function LogoMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" style={{ fill: 'var(--accent)' }} />
      <path d="M9 11h14M16 11v11" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M5 13v6M27 13v6" stroke="#fff" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo({ to = '/', suffix }) {
  return (
    <Link to={to} className="logo" aria-label="TechStore home">
      <LogoMark />
      <span className="logo__word">TechStore</span>
      {suffix && <span className="logo__suffix">{suffix}</span>}
    </Link>
  );
}
