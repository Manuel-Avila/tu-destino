import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';
import Button from './Button';
import './shared.css';

export default function DashboardHeader({ links = [], className = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.fullName?.trim().split(' ')[0];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className={`dashboard-header ${className}`.trim()}>
      <Brand className="dashboard-header__brand" />

      <nav className="dashboard-header__links" aria-label="Navegación principal">
        {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>

      <div className="dashboard-header__account">
        {user ? (
          <>
            {firstName && <span className="dashboard-header__welcome">Hola, {firstName}</span>}
            <Button variant="ghost" onClick={handleLogout}>Cerrar sesión</Button>
          </>
        ) : (
          <Button variant="ghost" to="/login">Iniciar sesión</Button>
        )}
      </div>
    </header>
  );
}
