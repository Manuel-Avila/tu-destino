import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Antes de iniciar sesión (solo informativas)
import PublicHomePage from './pages/public/PublicHomePage';
import PublicDestinationsPage from './pages/public/PublicDestinationsPage';
import PublicEventsPage from './pages/public/PublicEventsPage';
import PublicEducationPage from './pages/public/PublicEducationPage';
import PublicReportsPage from './pages/public/PublicReportsPage';
import PublicAboutPage from './pages/public/PublicAboutPage';

// Con sesión iniciada
import AppHomePage from './pages/app/AppHomePage';
import AppDestinationsPage from './pages/app/AppDestinationsPage';
import AppEventsPage from './pages/app/AppEventsPage';
import AppEducationPage from './pages/app/AppEducationPage';
import AppAboutPage from './pages/app/AppAboutPage';
import AppReportsPage from './pages/app/AppReportsPage';
import ProfilePage from './pages/app/ProfilePage';
import DestinationDetailPage from './pages/DestinationDetailPage';
import EventDetailPage from './pages/EventDetailPage';

function App() {
  const loadCurrentUser = useAuthStore((state) => state.loadCurrentUser);
  const { pathname } = useLocation();

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  // Al cambiar de pantalla, regresa al inicio de la página.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <Routes>
      {/* Público */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<PublicHomePage />} />
        <Route path="/destinos" element={<PublicDestinationsPage />} />
        <Route path="/eventos" element={<PublicEventsPage />} />
        <Route path="/educacion" element={<PublicEducationPage />} />
        <Route path="/reportes" element={<PublicReportsPage />} />
        <Route path="/acerca-de" element={<PublicAboutPage />} />
      </Route>

      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Con sesión */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AppHomePage />} />
        <Route path="destinos" element={<AppDestinationsPage />} />
        <Route path="destinos/:id" element={<DestinationDetailPage />} />
        <Route path="eventos" element={<AppEventsPage />} />
        <Route path="eventos/:id" element={<EventDetailPage />} />
        <Route path="educacion" element={<AppEducationPage />} />
        <Route path="acerca-de" element={<AppAboutPage />} />
        <Route path="reportes" element={<AppReportsPage />} />
        <Route path="perfil" element={<ProfilePage />} />
      </Route>

      {/* Rutas viejas */}
      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
