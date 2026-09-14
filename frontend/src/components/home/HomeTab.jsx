import Button from '../Button';
import SectionHeading from '../SectionHeading';
import balandraImage from '../../assets/balandra-playa.jpg';
import caboImage from '../../assets/cabo-pulmo.jpg';
import './HomeTab.css';

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

export default function HomeTab({ onSelectTab }) {
  return (
    <div className="tab-view tab-view--inicio">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <h1 id="home-title">
            Descubre Baja California Sur.<br />
            Protege lo que amas.
          </h1>
          <p>
            Únete a nuestra comunidad de viajeros conscientes y guardianes del océano.<br />
            Explora destinos increíbles mientras contribuyes a la conservación marina.
          </p>
          <div className="home-hero__actions">
            <Button
              href="#destinos"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab?.('destinos');
              }}
            >
              Explorar destinos <span>→</span>
            </Button>
            <Button
              href="#reportes"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab?.('reportes');
              }}
            >
              Realizar un reporte 
            </Button>
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
    </div>
  );
}
