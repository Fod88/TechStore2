import { Loader2 } from 'lucide-react';

// variant: primary | secondary | ghost | danger    size: sm | md | lg
// Pass `as={Link} to="..."` to render a router link with button styling.
export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  block = false,
  className = '',
  children,
  disabled,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', className].filter(Boolean).join(' ');
  const buttonProps = Tag === 'button' ? { type: 'button', disabled: disabled || loading } : {};

  return (
    <Tag className={classes} aria-busy={loading || undefined} {...buttonProps} {...rest}>
      {loading ? <Loader2 size={16} className="spin" aria-hidden="true" /> : Icon ? <Icon size={16} aria-hidden="true" /> : null}
      {children}
    </Tag>
  );
}
