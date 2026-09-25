import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1>We can't find that page</h1>
      <p>The link may be broken, or the page may have moved.</p>
      <div className="not-found__actions">
        <Button as={Link} to="/">
          Go to the homepage
        </Button>
        <Button as={Link} to="/products" variant="secondary">
          Browse products
        </Button>
      </div>
    </div>
  );
}
