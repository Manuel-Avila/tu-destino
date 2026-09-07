import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Brand from './Brand';
import Button from './Button';
import './shared.css';

export default function DashboardHeader({ links = [], className = '' }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const firstName = user?.fullName?.trim().split(' ')[0];

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className={`dashboard-header ${className}`.trim()}>
      <Brand className="dashboard-header__brand" />

      <nav className="dashboard-header__links" aria-label="Navegacin principal">
        {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
      </nav>

      <div className="dashboard-header__account">
        {user ? (
          <>
            {firstName && <span className="dashboard-header__welcome">Hola, {firstName}</span>}
            <Button variant="ghost" onClick={handleLogout}>Cerrar sesin</Button>
          </>
        ) : (
          <Button variant="ghost" to="/login">Iniciar sesin</Button>
        )}
      </div>
    </header>
  );
}
