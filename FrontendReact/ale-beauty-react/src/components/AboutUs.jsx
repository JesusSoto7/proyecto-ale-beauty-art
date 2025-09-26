// src/components/AboutUs.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../assets/stylesheets/AboutUs.css';

// Importar imágenes (asegúrate de tener estas imágenes en tu proyecto)
import heroBg from '../assets/images/about-hero.jpg';
import storeImage from '../assets/images/store-front.jpg';
import makeupCategory from '../assets/images/makeup-category.jpg';
import hairCategory from '../assets/images/hair-category.jpg';
import skincareCategory from '../assets/images/skincare-category.jpg';
import teamImage from '../assets/images/team.jpg';

const AboutUs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleExploreProducts = () => {
    const currentPath = window.location.pathname;
    const lang = currentPath.split('/')[1];
    navigate(`/${lang}/productos`);
  };

  return (
    <div className="about-us-alebeauty">
      {/* Hero Banner con imagen real */}
      <section className="hero-banner">
        <div className="hero-background">
          <img src={heroBg} alt={t('about.heroAlt')} />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="container">
            <h1>{t('about.companyName')}</h1>
            <p className="hero-subtitle">{t('about.heroSubtitle')}</p>
          </div>
        </div>
      </section>

      {/* Nuestra Historia */}
      <section className="section-history">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-1 order-2">
              <div className="history-content">
                <h2>{t('about.historyTitle')}</h2>
                <p>{t('about.historyText1')}</p>
                <p>{t('about.historyText2')}</p>
              </div>
            </div>
            <div className="col-lg-6 order-lg-2 order-1">
              <div className="history-image">
                <img src={teamImage} alt={t('about.teamAlt')} className="img-fluid" />
                <div className="image-badge">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="section-mission">
        <div className="container">
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="mission-card">
                <div className="mission-icon">
                  <i className="bi bi-bullseye"></i>
                </div>
                <h3>{t('about.missionTitle')}</h3>
                <p>{t('about.missionText')}</p>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="mission-card">
                <div className="mission-icon">
                  <i className="bi bi-eye"></i>
                </div>
                <h3>{t('about.visionTitle')}</h3>
                <p>{t('about.visionText')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías de Productos */}
      <section className="section-categories">
        <div className="container">
          <h2 className="section-title">{t('about.specialtiesTitle')}</h2>
          <div className="row g-4">
            <div className="col-xl-4 col-md-6">
              <div className="category-card makeup">
                <div className="category-image">
                  <img src={makeupCategory} alt={t('about.makeupAlt')} />
                </div>
                <div className="category-content">
                  <h3>{t('about.makeupTitle')}</h3>
                  <p>{t('about.makeupDescription')}</p>
                  <ul>
                    <li>{t('about.makeupFeature1')}</li>
                    <li>{t('about.makeupFeature2')}</li>
                    <li>{t('about.makeupFeature3')}</li>
                    <li>{t('about.makeupFeature4')}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6">
              <div className="category-card hair">
                <div className="category-image">
                  <img src={hairCategory} alt={t('about.hairAlt')} />
                </div>
                <div className="category-content">
                  <h3>{t('about.hairTitle')}</h3>
                  <p>{t('about.hairDescription')}</p>
                  <ul>
                    <li>{t('about.hairFeature1')}</li>
                    <li>{t('about.hairFeature2')}</li>
                    <li>{t('about.hairFeature3')}</li>
                    <li>{t('about.hairFeature4')}</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="col-xl-4 col-md-6">
              <div className="category-card skincare">
                <div className="category-image">
                  <img src={skincareCategory} alt={t('about.skincareAlt')} />
                </div>
                <div className="category-content">
                  <h3>{t('about.skincareTitle')}</h3>
                  <p>{t('about.skincareDescription')}</p>
                  <ul>
                    <li>{t('about.skincareFeature1')}</li>
                    <li>{t('about.skincareFeature2')}</li>
                    <li>{t('about.skincareFeature3')}</li>
                    <li>{t('about.skincareFeature4')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="section-values">
        <div className="container">
          <h2 className="section-title">{t('about.valuesTitle')}</h2>
          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="value-item">
                <div className="value-icon">
                  <i className="bi bi-gem"></i>
                </div>
                <h4>{t('about.qualityTitle')}</h4>
                <p>{t('about.qualityText')}</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="value-item">
                <div className="value-icon">
                  <i className="bi bi-patch-check"></i>
                </div>
                <h4>{t('about.authenticityTitle')}</h4>
                <p>{t('about.authenticityText')}</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="value-item">
                <div className="value-icon">
                  <i className="bi bi-lightbulb"></i>
                </div>
                <h4>{t('about.innovationTitle')}</h4>
                <p>{t('about.innovationText')}</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="value-item">
                <div className="value-icon">
                  <i className="bi bi-people"></i>
                </div>
                <h4>{t('about.communityTitle')}</h4>
                <p>{t('about.communityText')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Punto Físico */}
      <section className="section-store">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="store-image">
                <img src={storeImage} alt={t('about.storeAlt')} className="img-fluid" />
                <div className="store-badge">
                  <i className="bi bi-geo-alt-fill"></i>
                  <span>{t('about.visitUs')}</span>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="store-info">
                <h2>{t('about.storeTitle')}</h2>
                <p>{t('about.storeDescription')}</p>
                <div className="store-features">
                  <div className="feature">
                    <i className="bi bi-person-check"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-cta">
        <div className="container">
          <div className="cta-content">
            <h2>{t('about.ctaTitle')}</h2>
            <p>{t('about.ctaDescription')}</p>
            <button className="btn btn-primary btn-lg" onClick={handleExploreProducts}>
              {t('about.exploreButton')}
              <i className="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;