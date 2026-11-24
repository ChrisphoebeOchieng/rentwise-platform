import { ArrowRight, Building2, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import TopNavigation from "../components/TopNavigation";
import "../App.css";

const features = [
  {
    icon: Building2,
    number: "01",
    title: "Property management",
    description: "Keep property details, listings and availability organised in one place.",
  },
  {
    icon: KeyRound,
    number: "02",
    title: "Tenancy management",
    description: "Manage applications, tenant records and tenancy information with ease.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Transparent payments",
    description: "Keep track of rent records, payment status and outstanding balances.",
  },
];

function App() {
  return (
    <div className="app-shell">
      <TopNavigation />

      <main>
        <section className="welcome-section" id="overview">
          <div className="welcome-section__content">
            <span className="eyebrow">
              <Sparkles size={14} />
              A smarter way to manage rentals
            </span>

            <h1>
              Property management,
              <br />
              <em>thoughtfully simplified.</em>
            </h1>

            <p className="welcome-section__description">
              A considered approach to rental living in Kenya.
              Bringing property owners, managers and tenants
              together through one seamless platform.
            </p>

            <div className="welcome-section__actions">
              <Link to="/register" className="button button--primary button--medium">
                Explore RentWise <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="button button--text">Sign in to your account</Link>
            </div>

            <div className="welcome-section__note">
              <span className="welcome-section__note-line" />
              Designed for the Kenyan rental market
            </div>
          </div>

          <div className="welcome-artwork" aria-label="RentWise brand illustration">
            <div className="artwork-orbit artwork-orbit--outer" />
            <div className="artwork-orbit artwork-orbit--inner" />
            <div className="artwork-card">
              <span className="artwork-card__overline">THE RENTWISE EXPERIENCE</span>
              <div className="artwork-card__symbol">
                <Building2 size={58} strokeWidth={1} />
              </div>
              <span className="artwork-card__title">A place to belong.</span>
              <span className="artwork-card__subtitle">A better way to manage.</span>
              <span className="artwork-card__footer">EST. 2026 · KENYA</span>
            </div>
            <span className="artwork-decoration artwork-decoration--one" />
            <span className="artwork-decoration artwork-decoration--two" />
          </div>
        </section>

        <section className="features-section" id="about">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE PLATFORM</span>
              <h2>Everything in its <em>right place.</em></h2>
            </div>
            <p>
              Thoughtful tools for every part of the rental
              journey, from the first application to ongoing
              property management.
            </p>
          </div>

          <div className="features-grid" id="properties">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="feature-card" key={feature.number}>
                  <div className="feature-card__top">
                    <span className="feature-card__icon">
                      <Icon size={21} strokeWidth={1.5} />
                    </span>
                    <span className="feature-card__number">{feature.number}</span>
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="feature-card__line" />
                </article>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span>rentwise<span className="footer-period">.</span></span>
        <span>Thoughtfully managing the places we call home.</span>
        <span>KENYA · 2026</span>
      </footer>
    </div>
  );
}

export default App;
