import { Link } from 'react-router-dom';
import mark from '../assets/logo.png';
import './shared.css';

export default function Brand({ to = '/dashboard', className = '', label = 'TuDestino' }) {
  return (
    <Link className={`app-brand ${className}`.trim()} to={to} aria-label={`${label}, inicio`}>
      <img src={mark} alt="" />
      <span>{label}</span>
    </Link>
  );
}
