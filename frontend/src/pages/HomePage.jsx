import { useState, useEffect } from 'react';
import './home.css';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';

import HomeTab from '../components/home/HomeTab';
import DestinationsTab from '../components/home/DestinationsTab';
import EducationTab from '../components/home/EducationTab';
import AboutTab from '../components/home/AboutTab';
import ReportsTab from '../components/home/ReportsTab';

export default function HomePage() {
  // Pestaña activa ('inicio', 'destinos', 'educacion', 'acerca-de', 'reportes')
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['inicio', 'destinos', 'educacion', 'acerca-de', 'reportes'].includes(hash)
      ? hash
      : 'inicio';
  });

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['inicio', 'destinos', 'educacion', 'acerca-de', 'reportes'].includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="home-page" id="inicio">
      <DashboardHeader
        className="home-header"
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        links={[
          { href: '#inicio', label: 'Inicio' },
          { href: '#destinos', label: 'Destinos' },
          { href: '#educacion', label: 'Educación ambiental' },
          { href: '#acerca-de', label: 'Acerca de' },
          { href: '#reportes', label: 'Reportes' },
        ]}
      />

      {activeTab === 'inicio' && <HomeTab onSelectTab={handleSelectTab} />}
      {activeTab === 'destinos' && <DestinationsTab />}
      {activeTab === 'educacion' && <EducationTab />}
      {activeTab === 'acerca-de' && <AboutTab />}
      {activeTab === 'reportes' && <ReportsTab />}

      <Footer
        className="home-footer"
        description=""
        links={[
          { label: 'Privacy Policy', href: '/Politica_de_Privacidad_Tu_Destino.pdf' },
          { label: 'Terms of Service', href: '/Terminos_de_Servicio_Tu_Destino.pdf' },
          { label: 'Scientific Data', href: '#destinos' },
          { label: 'Contact Us', href: '#acerca-de' },
        ]}
        legal="© 2026 TuDestino. Protegiendo Baja California Sur."
      />
    </main>
  );
}
