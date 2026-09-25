import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, PackageCheck, Tag } from 'lucide-react';
import Logo from '../components/ui/Logo';

const POINTS = [
  { icon: PackageCheck, title: 'Track every order', text: 'Follow each purchase from pending to delivered.' },
  { icon: Tag, title: 'Clear pricing and stock', text: 'See what is available before you add it to your cart.' },
  { icon: ShieldCheck, title: 'Secure sign in', text: 'Your account is protected with encrypted credentials.' },
];

export default function AuthLayout() {
  return (
    <div className="auth">
      <aside className="auth__aside blueprint">
        <Logo />
        <div className="auth__pitch">
          <h2>Everything you need to buy tech with confidence.</h2>
          <ul>
            {POINTS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="auth__point-icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="auth__main">
        <div className="auth__mobile-logo">
          <Logo />
        </div>
        <div className="auth__card">
          <Outlet />
        </div>
        <Link to="/" className="auth__back">
          Back to the store
        </Link>
      </main>
    </div>
  );
}
