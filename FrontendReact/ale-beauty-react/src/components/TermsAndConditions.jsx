import React from "react";
import { useTranslation } from "react-i18next";

function TermsAndConditions() {
  const { t } = useTranslation();
  
  return (
    <div className="terms-container">
      <div className="terms-content">
        <h1 className="terms-title">
          {t("terms.title")}
        </h1>

        <p className="terms-intro">
          {t("terms.intro.part1")} <strong>Ale Beauty Art</strong>.{" "}
          {t("terms.intro.part2")}
        </p>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section1.title")}
          </h2>
          <p className="terms-text">{t("terms.section1.text")}</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section2.title")}
          </h2>
          <p className="terms-text">{t("terms.section2.text")}</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section3.title")}
          </h2>
          <p className="terms-text">{t("terms.section3.text")}</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section4.title")}
          </h2>
          <p className="terms-text">{t("terms.section4.text")}</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section5.title")}
          </h2>
          <p className="terms-text">{t("terms.section5.text")}</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section6.title")}
          </h2>
          <p className="terms-text">
            {t("terms.section6.text")} <strong>Ale Beauty Art</strong>{" "}
            {t("terms.section6.text2")}
          </p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section7.title")}
          </h2>
          <p className="terms-text">{t("terms.section7.text")}</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section8.title")}
          </h2>
          <p className="terms-text">{t("terms.section8.text")}</p>
        </section>

        <section className="terms-section">
          <h2 className="terms-subtitle">
            {t("terms.section9.title")}
          </h2>
          <p className="terms-text">
            {t("terms.section9.text")}{" "}
            <a
              href="mailto:contacto@tienda.com"
              className="terms-link"
            >
              contacto@tienda.com
            </a>
            .
          </p>
        </section>

        <footer className="terms-footer">
          <p className="terms-update">
            {t("terms.lastUpdate")} Septiembre 2025
          </p>
        </footer>
      </div>

      <style jsx>{`
        .terms-container {
          min-height: auto;
          background: linear-gradient(135deg, #fff0f5 0%, #fff5f7 50%, #fff0f5 100%);
          padding: 40px 20px;
          display: flex;
          justify-content: center;
        }

        .terms-content {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(255, 182, 193, 0.2);
          padding: 50px;
          margin: 0;
          position: relative;
          overflow: hidden;
          border: 2px solid #ffe4e9;
        }

        .terms-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #ff69b4, #ffb6c1, #ff69b4);
        }

        .terms-title {
          font-size: 2.8rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2.5rem;
          color: #ff69b4;
          line-height: 1.2;
          letter-spacing: -0.5px;
          text-shadow: 0 4px 8px rgba(255, 105, 180, 0.15);
        }

        .terms-intro {
          font-size: 1.2rem;
          line-height: 1.7;
          margin-bottom: 3rem;
          color: #ff69b4;
          text-align: center;
          padding: 0 2rem;
          font-weight: 400;
          background: #fffafb;
          padding: 1.5rem;
          border-radius: 16px;
          border: 2px solid #ffe4e9;
        }

        .terms-intro strong {
          color: #ff1493;
          font-weight: 600;
        }

        .terms-section {
          margin-bottom: 2.5rem;
          padding: 2rem;
          background: #fffafb;
          border-radius: 16px;
          border: 2px solid #ffe4e9;
          transition: all 0.3s ease;
          position: relative;
        }

        .terms-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: -2px;
          height: 100%;
          width: 4px;
          background: linear-gradient(to bottom, #ff69b4, #ffb6c1);
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .terms-section:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(255, 182, 193, 0.25);
          border-color: #ffb6c1;
        }

        .terms-section:hover::before {
          opacity: 1;
        }

        .terms-subtitle {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 1.2rem;
          color: #ff1493;
          display: flex;
          align-items: center;
          position: relative;
        }

        .terms-subtitle::before {
          content: '🌸';
          color: #ff69b4;
          margin-right: 1rem;
          font-size: 1.4rem;
          filter: drop-shadow(0 2px 2px rgba(255, 105, 180, 0.2));
        }

        .terms-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #ff69b4;
          margin: 0;
          font-weight: 400;
        }

        .terms-text strong {
          color: #ff1493;
          font-weight: 600;
        }

        .terms-link {
          color: #ff1493;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
          padding-bottom: 1px;
        }

        .terms-link:hover {
          color: #ff69b4;
          border-bottom-color: #ff69b4;
        }

        .terms-footer {
          margin-top: 4rem;
          padding-top: 2.5rem;
          border-top: 2px solid #ffe4e9;
          text-align: center;
          background: #fffafb;
          padding: 2rem;
          border-radius: 16px;
        }

        .terms-update {
          font-size: 1rem;
          color: #ff69b4;
          margin: 0;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .terms-container {
            padding: 30px 15px;
            background: linear-gradient(135deg, #fff0f5 0%, #fff5f7 100%);
          }

          .terms-content {
            padding: 40px 30px;
            margin: 0;
            border-radius: 20px;
          }

          .terms-title {
            font-size: 2.2rem;
            margin-bottom: 2rem;
          }

          .terms-intro {
            font-size: 1.1rem;
            padding: 1.25rem;
            margin-bottom: 2.5rem;
            color: #ff69b4;
          }

          .terms-section {
            padding: 1.75rem;
            margin-bottom: 2rem;
          }

          .terms-subtitle {
            font-size: 1.25rem;
            color: #ff1493;
          }

          .terms-text {
            font-size: 1rem;
            color: #ff69b4;
          }
        }

        @media (max-width: 480px) {
          .terms-content {
            padding: 30px 20px;
            border-radius: 18px;
            border-width: 2px;
          }

          .terms-container {
            padding: 20px 10px;
          }

          .terms-title {
            font-size: 1.9rem;
          }

          .terms-section {
            padding: 1.5rem;
            margin-bottom: 1.75rem;
          }

          .terms-subtitle {
            font-size: 1.15rem;
          }

          .terms-subtitle::before {
            margin-right: 0.75rem;
            font-size: 1.2rem;
          }

          .terms-text {
            font-size: 0.95rem;
            line-height: 1.6;
          }

          .terms-intro {
            font-size: 1rem;
            padding: 1rem;
            margin-bottom: 2rem;
          }

          .terms-footer {
            padding: 1.5rem;
            margin-top: 3rem;
          }
        }

        @media (max-width: 360px) {
          .terms-content {
            padding: 25px 15px;
          }

          .terms-title {
            font-size: 1.7rem;
          }

          .terms-subtitle {
            font-size: 1.1rem;
          }

          .terms-section {
            padding: 1.25rem;
          }
        }

        /* Dark mode replacement - Usando tonos rosas más oscuros en lugar de negro */
        @media (prefers-color-scheme: dark) {
          .terms-container {
            background: linear-gradient(135deg, #ffd7e0 0%, #ffe4e9 50%, #ffd7e0 100%);
          }

          .terms-content {
            background: #fff0f5;
            border-color: #ffd7e0;
          }

          .terms-text, .terms-intro {
            color: #ff1493;
          }

          .terms-subtitle {
            color: #ff1493;
          }

          .terms-section {
            background: #fff5f7;
            border-color: #ffd7e0;
          }

          .terms-intro {
            background: #fff5f7;
            border-color: #ffd7e0;
          }

          .terms-footer {
            background: #fff5f7;
            border-top-color: #ffd7e0;
          }

          .terms-update {
            color: #ff69b4;
          }

          .terms-intro strong,
          .terms-text strong {
            color: #ff1493;
          }

          .terms-link {
            color: #ff1493;
          }

          .terms-link:hover {
            color: #ff69b4;
          }

          .terms-content::before {
            background: linear-gradient(90deg, #ff69b4, #ffb6c1, #ff69b4);
          }
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Print styles */
        @media print {
          .terms-container {
            background: white;
            padding: 0;
          }

          .terms-content {
            box-shadow: none;
            margin: 0;
            border-radius: 0;
            border: 2px solid #ffb6c1;
            padding: 2rem;
          }

          .terms-section:hover {
            transform: none;
            box-shadow: none;
          }

          .terms-content::before {
            display: none;
          }

          .terms-title {
            color: #ff69b4;
          }

          .terms-text {
            color: #ff69b4;
          }
        }

        /* Animation for page load */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .terms-content {
          animation: fadeInUp 0.8s ease-out;
        }

        .terms-section {
          animation: fadeInUp 0.8s ease-out;
          animation-fill-mode: both;
        }

        /* Stagger animation for sections */
        .terms-section:nth-child(1) { animation-delay: 0.1s; }
        .terms-section:nth-child(2) { animation-delay: 0.2s; }
        .terms-section:nth-child(3) { animation-delay: 0.3s; }
        .terms-section:nth-child(4) { animation-delay: 0.4s; }
        .terms-section:nth-child(5) { animation-delay: 0.5s; }
        .terms-section:nth-child(6) { animation-delay: 0.6s; }
        .terms-section:nth-child(7) { animation-delay: 0.7s; }
        .terms-section:nth-child(8) { animation-delay: 0.8s; }
        .terms-section:nth-child(9) { animation-delay: 0.9s; }
      `}</style>
    </div>
  );
}

export default TermsAndConditions;