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

        <div className="table-of-contents">
          <h2>{t("terms.toc.title")}</h2>
          <ol>
            {[...Array(27)].map((_, index) => (
              <li key={index}>
                <a href={`#section${index + 1}`}>
                  {t(`terms.toc.section${index + 1}`)}
                </a>
              </li>
            ))}
          </ol>
        </div>

        <p className="terms-intro">
          {t("terms.intro.part1")} <strong>Ale Beauty Art</strong>.{" "}
          {t("terms.intro.part2")}
        </p>

        {/* Secciones expandidas */}
        <section id="section1" className="terms-section">
          <h2 className="terms-subtitle">1. {t("terms.section1.title")}</h2>
          <p className="terms-text">{t("terms.section1.text")}</p>
        </section>

        <section id="section2" className="terms-section">
          <h2 className="terms-subtitle">2. {t("terms.section2.title")}</h2>
          <p className="terms-text">{t("terms.section2.text")}</p>
          <p className="terms-text">{t("terms.section2.text2")}</p>
        </section>

        <section id="section3" className="terms-section">
          <h2 className="terms-subtitle">3. {t("terms.section3.title")}</h2>
          <p className="terms-text">{t("terms.section3.text")}</p>
        </section>

        <section id="section4" className="terms-section">
          <h2 className="terms-subtitle">4. {t("terms.section4.title")}</h2>
          <p className="terms-text">{t("terms.section4.text")}</p>
        </section>

        <section id="section5" className="terms-section">
          <h2 className="terms-subtitle">5. {t("terms.section5.title")}</h2>
          <p className="terms-text">{t("terms.section5.text")}</p>
        </section>

        <section id="section6" className="terms-section">
          <h2 className="terms-subtitle">6. {t("terms.section6.title")}</h2>
          <p className="terms-text">
            {t("terms.section6.text")} <strong>Ale Beauty Art</strong>{" "}
            {t("terms.section6.text2")}
          </p>
        </section>

        <section id="section7" className="terms-section">
          <h2 className="terms-subtitle">7. {t("terms.section7.title")}</h2>
          <p className="terms-text">{t("terms.section7.text")}</p>
        </section>

        <section id="section8" className="terms-section">
          <h2 className="terms-subtitle">8. {t("terms.section8.title")}</h2>
          <p className="terms-text">{t("terms.section8.text")}</p>
        </section>

        <section id="section9" className="terms-section">
          <h2 className="terms-subtitle">9. {t("terms.section9.title")}</h2>
          <p className="terms-text">{t("terms.section9.text")}</p>
        </section>

        <section id="section10" className="terms-section">
          <h2 className="terms-subtitle">10. {t("terms.section10.title")}</h2>
          <p className="terms-text">{t("terms.section10.text")}</p>
        </section>

        <section id="section11" className="terms-section">
          <h2 className="terms-subtitle">11. {t("terms.section11.title")}</h2>
          <p className="terms-text">{t("terms.section11.text")}</p>
        </section>

        <section id="section12" className="terms-section">
          <h2 className="terms-subtitle">12. {t("terms.section12.title")}</h2>
          <p className="terms-text">{t("terms.section12.text")}</p>
        </section>

        <section id="section13" className="terms-section">
          <h2 className="terms-subtitle">13. {t("terms.section13.title")}</h2>
          <p className="terms-text">{t("terms.section13.text")}</p>
        </section>

        <section id="section14" className="terms-section">
          <h2 className="terms-subtitle">14. {t("terms.section14.title")}</h2>
          <p className="terms-text">{t("terms.section14.text")}</p>
        </section>

        <section id="section15" className="terms-section">
          <h2 className="terms-subtitle">15. {t("terms.section15.title")}</h2>
          <p className="terms-text">{t("terms.section15.text")}</p>
        </section>

        <section id="section16" className="terms-section">
          <h2 className="terms-subtitle">16. {t("terms.section16.title")}</h2>
          <p className="terms-text">{t("terms.section16.text")}</p>
        </section>

        <section id="section17" className="terms-section">
          <h2 className="terms-subtitle">17. {t("terms.section17.title")}</h2>
          <p className="terms-text">{t("terms.section17.text")}</p>
        </section>

        <section id="section18" className="terms-section">
          <h2 className="terms-subtitle">18. {t("terms.section18.title")}</h2>
          <p className="terms-text">{t("terms.section18.text")}</p>
        </section>

        <section id="section19" className="terms-section">
          <h2 className="terms-subtitle">19. {t("terms.section19.title")}</h2>
          <p className="terms-text">{t("terms.section19.text")}</p>
        </section>

        <section id="section20" className="terms-section">
          <h2 className="terms-subtitle">20. {t("terms.section20.title")}</h2>
          <p className="terms-text">{t("terms.section20.text")}</p>
        </section>

        <section id="section21" className="terms-section">
          <h2 className="terms-subtitle">21. {t("terms.section21.title")}</h2>
          <p className="terms-text">{t("terms.section21.text")}</p>
        </section>

        <section id="section22" className="terms-section">
          <h2 className="terms-subtitle">22. {t("terms.section22.title")}</h2>
          <p className="terms-text">{t("terms.section22.text")}</p>
        </section>

        <section id="section23" className="terms-section">
          <h2 className="terms-subtitle">23. {t("terms.section23.title")}</h2>
          <p className="terms-text">{t("terms.section23.text")}</p>
        </section>

        <section id="section24" className="terms-section">
          <h2 className="terms-subtitle">24. {t("terms.section24.title")}</h2>
          <p className="terms-text">{t("terms.section24.text")}</p>
        </section>

        <section id="section25" className="terms-section">
          <h2 className="terms-subtitle">25. {t("terms.section25.title")}</h2>
          <p className="terms-text">{t("terms.section25.text")}</p>
        </section>

        <section id="section26" className="terms-section">
          <h2 className="terms-subtitle">26. {t("terms.section26.title")}</h2>
          <p className="terms-text">{t("terms.section26.text")}</p>
        </section>

        <section id="section27" className="terms-section">
          <h2 className="terms-subtitle">27. {t("terms.section27.title")}</h2>
          <p className="terms-text">
            {t("terms.section27.text")}{" "}
            <a
              href="mailto:contacto@alebeautyart.com"
              className="terms-link"
            >
              contacto@alebeautyart.com
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
          background: white;
          padding: 40px 20px;
          display: flex;
          justify-content: center;
        }

        .terms-content {
          max-width: 900px;
          width: 100%;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.34);
          padding: 50px;
          margin: 0;
          position: relative;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .terms-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: #ff69b4;
        }

        .terms-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 2.5rem;
          color: #ff69b4;
          line-height: 1.2;
          letter-spacing: -0.5px;
        }

        .table-of-contents {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          margin-bottom: 3rem;
        }

        .table-of-contents h2 {
          color: #ff69b4;
          margin-bottom: 1rem;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .table-of-contents ol {
          columns: 2;
          column-gap: 2rem;
        }

        .table-of-contents li {
          margin-bottom: 0.5rem;
          break-inside: avoid;
          color: #333;
        }

        .table-of-contents a {
          color: #ff69b4;
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 500;
        }

        .table-of-contents a:hover {
          color: #ff1493;
          text-decoration: underline;
        }

        .terms-intro {
          font-size: 1.2rem;
          line-height: 1.7;
          margin-bottom: 3rem;
          color: #333;
          text-align: center;
          padding: 0 2rem;
          font-weight: 400;
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .terms-intro strong {
          color: #ff69b4;
          font-weight: 600;
        }

        .terms-section {
          margin-bottom: 2.5rem;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
          transition: all 0.3s ease;
          position: relative;
          scroll-margin-top: 20px;
        }

        .terms-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: -1px;
          height: 100%;
          width: 3px;
          background: #ff69b4;
          border-radius: 1px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .terms-section:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          border-color: #ffb6c1;
        }

        .terms-section:hover::before {
          opacity: 1;
        }

        .terms-subtitle {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 1.2rem;
          color: #ff69b4;
          display: flex;
          align-items: center;
          position: relative;
        }

        .terms-subtitle::before {
          content: '•';
          color: #ff69b4;
          margin-right: 1rem;
          font-size: 1.8rem;
          font-weight: bold;
        }

        .terms-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #333;
          margin: 0;
          font-weight: 400;
        }

        .terms-text strong {
          color: #ff69b4;
          font-weight: 600;
        }

        .terms-link {
          color: #ff69b4;
          text-decoration: underline;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .terms-link:hover {
          color: #ff1493;
          text-decoration: none;
        }

        .terms-footer {
          margin-top: 4rem;
          padding-top: 2.5rem;
          border-top: 1px solid #ff69b4;
          text-align: center;
          background: white;
          padding: 2rem;
          border-radius: 8px;
        }

        .terms-update {
          font-size: 1rem;
          color: #666;
          margin: 0;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .terms-container {
            padding: 30px 15px;
          }

          .terms-content {
            padding: 40px 30px;
          }

          .terms-title {
            font-size: 2.2rem;
          }

          .table-of-contents ol {
            columns: 1;
          }

          .terms-section {
            padding: 1.75rem;
          }

          .terms-intro {
            font-size: 1.1rem;
            padding: 1.25rem;
          }
        }

        @media (max-width: 480px) {
          .terms-content {
            padding: 30px 20px;
          }

          .terms-title {
            font-size: 1.9rem;
          }

          .terms-section {
            padding: 1.5rem;
          }

          .terms-subtitle {
            font-size: 1.2rem;
          }

          .terms-text {
            font-size: 1rem;
          }

          .terms-intro {
            font-size: 1rem;
            padding: 1rem;
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
            border: 1px solid #000;
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
            color: #000;
          }

          .terms-text {
            color: #000;
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
        .terms-section:nth-child(10) { animation-delay: 1.0s; }
        .terms-section:nth-child(11) { animation-delay: 1.1s; }
        .terms-section:nth-child(12) { animation-delay: 1.2s; }
        .terms-section:nth-child(13) { animation-delay: 1.3s; }
        .terms-section:nth-child(14) { animation-delay: 1.4s; }
        .terms-section:nth-child(15) { animation-delay: 1.5s; }
        .terms-section:nth-child(16) { animation-delay: 1.6s; }
        .terms-section:nth-child(17) { animation-delay: 1.7s; }
        .terms-section:nth-child(18) { animation-delay: 1.8s; }
        .terms-section:nth-child(19) { animation-delay: 1.9s; }
        .terms-section:nth-child(20) { animation-delay: 2.0s; }
        .terms-section:nth-child(21) { animation-delay: 2.1s; }
        .terms-section:nth-child(22) { animation-delay: 2.2s; }
        .terms-section:nth-child(23) { animation-delay: 2.3s; }
        .terms-section:nth-child(24) { animation-delay: 2.4s; }
        .terms-section:nth-child(25) { animation-delay: 2.5s; }
        .terms-section:nth-child(26) { animation-delay: 2.6s; }
        .terms-section:nth-child(27) { animation-delay: 2.7s; }
      `}</style>
    </div>
  );
}

export default TermsAndConditions;