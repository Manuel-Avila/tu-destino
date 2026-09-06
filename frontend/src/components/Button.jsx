import { Link } from 'react-router-dom';
import './shared.css';

export default function Button({ children, to, href, variant = 'primary', className = '', ...props }) {
  const classes = `app-button app-button--${variant} ${className}`.trim();

  if (to) {
    return <Link className={classes} to={to} {...props}>{children}</Link>;
  }

  if (href) {
    return <a className={classes} href={href} {...props}>{children}</a>;
  }

  return <button className={classes} type="button" {...props}>{children}</button>;
}
