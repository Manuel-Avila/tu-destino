import './home.css';
import Button from '../components/Button';
import DashboardHeader from '../components/DashboardHeader';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import balandraImage from '../assets/balandra-playa.jpg';
import caboImage from '../assets/cabo-pulmo.jpg';

const destinations = [
  {
    name: 'Playa Balandra',
    label: 'Área Protegida',
    description: 'Reconocida como una de las playas más hermosas de México, su ecosistema frágil de manglares necesita tu cuidado constante.',
    className: 'destination-card--balandra',
    image: balandraImage,
  },
  {
    name: 'Cabo Pulmo',
    label: 'Área Natural Protegida',
    description: 'El arrecife de coral más exitoso en recuperación del mundo.',
    className: 'destination-card--pulmo',
    image: caboImage,
  },
];

export default function HomePage() {
  return (
    <main className="home-page" id="inicio">
      <DashboardHeader
        className="home-header"
        links={[
          { href: '#inicio', label: 'Inicio' },
          { href: '#destinos', label: 'Destinos' },
          { href: '#educacion', label: 'Educación ambiental' },
          { href: '#acerca-de', label: 'Acerca de' },
          { href: '#reportes', label: 'Reportes' },
        ]}
      />

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <h1 id="home-title">Descubre Baja California Sur.<br />Protege lo que amas.</h1>
          <p>
            Únete a nuestra comunidad de viajeros conscientes y guardianes del océano.<br />
            Explora destinos increíbles mientras contribuyes a la conservación marina.
          </p>
          <div className="home-hero__actions">
            <Button href="#destinos">Explorar destinos <span>→</span></Button>
            <Button href="#reportes" variant="outline">Realizar un reporte <span>ⓘ</span></Button>
          </div>
        </div>
      </section>

      <section className="home-destinations" id="destinos" aria-label="Destinos destacados">
        <SectionHeading eyebrow={null} title="Destinos Destacados" className="home-destinations__heading" />
        <p className="home-destinations__intro">Lugares impresionantes que requieren nuestra protección y respeto.</p>

        <div className="home-destination-grid">
          {destinations.map((destination) => (
            <article
              className={`destination-card ${destination.className}`}
              key={destination.name}
              style={{ backgroundImage: `url(${destination.image})` }}
            >
              <div className="destination-card__content">
                <span className="destination-card__label">{destination.label}</span>
                <h3>{destination.name}</h3>
                <p>{destination.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer
        className="home-footer"
        description=""
        links={[
          { label: 'Privacy Policy', href: '/public/Politica_de_Privacidad_Tu_Destino.pdf'},
          { label: 'Terms of Service', href: '/public/Terminos_de_Servicio_Tu_Destino.pdf'},
          { label: 'Scientific Data', href: '#destinos' },
          { label: 'Contact Us', href: '#acerca-de' },
        ]}
        legal="© 2026 TuDestino. Protegiendo Baja California Sur."
      />
    </main>
  );
}
