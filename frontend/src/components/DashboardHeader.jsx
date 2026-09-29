import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Brand from './Brand';
import Button from './Button';
import Icon from './events/EventIcons';
import './shared.css';

/**
 * Header compartido. Recibe los enlaces como rutas reales de react-router:
 *   links = [{ to: '/app/destinos', label: 'Destinos', end?: boolean }]
 * `brandTo` es a donde lleva el logo + "TuDestino" (el Inicio).
 */
export default function DashboardHeader({ links = [], brandTo = '/', className = '' }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const firstName = user?.fullName?.trim().split(' ')[0];

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className={`dashboard-header ${className}`.trim()}>
      <Brand className="dashboard-header__brand" to={brandTo} />

      <nav className="dashboard-header__links" aria-label="Navegación principal">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `dashboard-header__link ${isActive ? 'is-active' : ''}`.trim()}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="dashboard-header__account">
        {user ? (
          <>
            {firstName && (
              <Link to="/app/perfil" className="dashboard-header__welcome" title="Ir a mi perfil">
                <Icon name="user" size={18} />
                <span className="dashboard-header__welcome-text">Hola, {firstName}</span>
              </Link>
            )}
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
