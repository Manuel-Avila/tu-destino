import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Brand from './Brand';
import Button from './Button';
import './shared.css';

export default function DashboardHeader({ links = [], activeTab = '', onSelectTab, className = '' }) {
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

      <nav className="dashboard-header__links" aria-label="Navegación principal">
        {links.map((link) => {
          const tabId = link.id || link.href?.replace('#', '');
          const isActive = activeTab ? activeTab === tabId : false;
          return (
            <a
              key={link.href}
              href={link.href}
              className={`dashboard-header__link ${isActive ? 'is-active' : ''}`.trim()}
              onClick={(e) => {
                if (onSelectTab) {
                  e.preventDefault();
                  onSelectTab(tabId);
                }
              }}
            >
              {link.label}
            </a>
          );
        })}
      </nav>

      <div className="dashboard-header__account">
        {user ? (
          <>
            {firstName && <span className="dashboard-header__welcome">Hola, {firstName}</span>}
            <Button variant="ghost" onClick={handleLogout}>Cerrar sesión</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" to="/login">Iniciar sesión</Button>
            <Button variant="outline" to="/register" className="dashboard-header__btn-reg">Registrarse</Button>
          </>
        )}
      </div>
    </header>
  );
}
