import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firstName = user?.fullName?.trim().split(' ')[0];

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handleEscape(event) {
      if (event.key === 'Escape') setIsMenuOpen(false);
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className={`dashboard-header ${className}`.trim()}>
      <Brand className="dashboard-header__brand" to={brandTo} />

      <button
        type="button"
        className={`dashboard-header__menu-toggle ${isMenuOpen ? 'is-open' : ''}`.trim()}
        aria-expanded={isMenuOpen}
        aria-controls="primary-navigation"
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        id="primary-navigation"
        className={`dashboard-header__links ${isMenuOpen ? 'is-open' : ''}`.trim()}
        aria-label="Navegación principal"
      >
        <button
          type="button"
          className="dashboard-header__menu-close"
          aria-label="Cerrar menú"
          onClick={() => setIsMenuOpen(false)}
        >
          <span />
          <span />
        </button>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `dashboard-header__link ${isActive ? 'is-active' : ''}`.trim()}
            onClick={() => setIsMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <div className="dashboard-header__menu-account">
          {user ? (
            <>
              <Link to="/app/perfil" onClick={() => setIsMenuOpen(false)}>
                Mi perfil
              </Link>
              <button type="button" onClick={handleLogout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                Iniciar sesión
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="dashboard-header__account">
        {user ? (
          <>
            {firstName && (
              <Link to="/app/perfil" className="dashboard-header__welcome" title="Ir a mi perfil" aria-label={`Ir a mi perfil, ${firstName}`}>
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
