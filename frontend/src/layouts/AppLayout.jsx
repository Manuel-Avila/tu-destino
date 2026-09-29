import { Outlet } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import '../pages/home.css';

// El "Inicio" (logo) y el "Perfil" (clic en "Hola, nombre") no van en el menú: se llega dando clic al logo / "TuDestino".
const LINKS = [
  { to: '/app/destinos', label: 'Destinos' },
  { to: '/app/eventos', label: 'Eventos' },
  { to: '/app/educacion', label: 'Educación' },
  { to: '/app/reportes', label: 'Reportes' },
  { to: '/app/acerca-de', label: 'Acerca de' },
];

const FOOTER_LINKS = [
  { label: 'Privacy Policy', href: '/Politica_de_Privacidad_Tu_Destino.pdf' },
  { label: 'Terms of Service', href: '/Terminos_de_Servicio_Tu_Destino.pdf' },
  { label: 'Scientific Data', href: '/app/destinos' },
  { label: 'Contact Us', href: '/app/acerca-de' },
];

/** Pantallas con sesión iniciada. Se protege desde App.jsx con <ProtectedRoute>. */
export default function AppLayout() {
  return (
    <main className="home-page">
      <DashboardHeader className="home-header" links={LINKS} brandTo="/app" />
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
