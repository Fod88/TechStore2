import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  useDocumentTitle('Sign in');
  const { login } = useAuth();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(values.email.trim())) next.email = 'Enter a valid email address.';
    if (!values.password) next.password = 'Enter your password.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      // On success AuthContext stores the session and <GuestRoute> redirects to the right page.
      await login({ email: values.email.trim().toLowerCase(), password: values.password });
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Incorrect email or password.'));
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Sign in</h1>
      <p className="auth__lead">{location.state?.from ? 'Sign in to continue.' : 'Welcome back. Enter your details to continue.'}</p>

      {submitError && (
        <div className="alert alert--error" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="form">
        <Input label="Email" type="email" autoComplete="email" value={values.email} onChange={setField('email')} error={errors.email} placeholder="you@example.com" autoFocus />
        <PasswordInput label="Password" autoComplete="current-password" value={values.password} onChange={setField('password')} error={errors.password} />
        <Button type="submit" size="lg" block loading={loading}>
          Sign in
        </Button>
      </form>

      <p className="auth__switch">
        New to TechStore? <Link to="/register" state={location.state}>Create an account</Link>
      </p>
    </>
  );
}
