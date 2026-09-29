import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import '../pages/home.css';

const LINKS = [
  { to: '/destinos', label: 'Destinos' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/educacion', label: 'Educación' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/acerca-de', label: 'Acerca de' },
];

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/Politica_de_Privacidad_Tu_Destino.pdf' },
  { label: 'Terms of Service', href: '/Terminos_de_Servicio_Tu_Destino.pdf' },
];

/**
 * Pantallas de antes de iniciar sesión (solo informativas).
 * Si ya hay sesión, se manda a la misma sección dentro de /app.
 */
export default function PublicLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const loading = useAuthStore((state) => state.loading);
  const { pathname } = useLocation();

  if (loading) return <div className="auth-loading">Cargando...</div>;
  if (isAuthenticated) {
    return <Navigate to={pathname === '/' ? '/app' : `/app${pathname}`} replace />;
  }

  return (
    <main className="home-page">
      <DashboardHeader className="home-header" links={LINKS} brandTo="/" />
      <Outlet />
      <Footer
        className="home-footer"
        description=""
        links={FOOTER_LINKS}
        legal="© 2026 TuDestino. Protegiendo Baja California Sur."
      />
    </main>
  );
}
