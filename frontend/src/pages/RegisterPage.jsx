import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Check, Circle } from 'lucide-react';
import Button from '../components/ui/Button';
import { Input, PasswordInput } from '../components/ui/Field';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'letter', label: 'One letter', test: (p) => /[A-Za-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const setField = (field) => (event) => {
    setValues((v) => ({ ...v, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Enter your full name.';
    if (!values.email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_PATTERN.test(values.email.trim())) next.email = 'Enter a valid email address.';
    if (!RULES.every((rule) => rule.test(values.password))) next.password = 'Your password does not meet all the requirements.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const signedIn = await register({ name: values.name.trim(), email: values.email.trim().toLowerCase(), password: values.password });
      if (!signedIn) {
        toast.success('Account created. Please sign in.');
        navigate('/login', { replace: true, state: location.state });
      } else {
        toast.success('Welcome to TechStore. Your account is ready.');
      }
    } catch (error) {
      setSubmitError(getErrorMessage(error, "We couldn't create your account."));
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Create your account</h1>
      <p className="auth__lead">Save your details and track every order in one place.</p>

      {submitError && (
        <div className="alert alert--error" role="alert">
          {submitError}
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="form">
        <Input label="Full name" autoComplete="name" value={values.name} onChange={setField('name')} error={errors.name} autoFocus />
        <Input label="Email" type="email" autoComplete="email" value={values.email} onChange={setField('email')} error={errors.email} placeholder="you@example.com" />
        <div>
          <PasswordInput label="Password" autoComplete="new-password" value={values.password} onChange={setField('password')} error={errors.password} />
          <ul className="rules" aria-label="Password requirements">
            {RULES.map((rule) => {
              const met = rule.test(values.password);
              return (
                <li key={rule.id} className={met ? 'is-met' : ''}>
                  {met ? <Check size={14} aria-hidden="true" /> : <Circle size={14} aria-hidden="true" />}
                  {rule.label}
                  <span className="sr-only">{met ? ' (met)' : ' (not met)'}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <Button type="submit" size="lg" block loading={loading}>
          Create account
        </Button>
      </form>

      <p className="auth__switch">
        Already have an account? <Link to="/login" state={location.state}>Sign in</Link>
      </p>
    </>
  );
}
