import React, { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resetPassword } from "../services/authService";
import ale_logo from "../assets/images/ale_logo.jpg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { lang } = useParams();
  const { t } = useTranslation();

  const resetToken = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== passwordConfirmation) {
      setError(t("resetPassword.passwordMismatch"));
      setLoading(false);
      return;
    }

    try {
      await resetPassword({
        reset_password_token: resetToken,
        password,
        password_confirmation: passwordConfirmation
      });
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate(`/${lang}/login`);
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg d-flex justify-content-center align-items-center">
      <div className="login-card shadow-lg p-5">
        {/* Logo */}
        <div className="text-center mb-4">
          <img
            src={ale_logo}
            alt="Cosméticos"
            className="rounded-circle mb-3"
            style={{ width: "60px", height: "60px", objectFit: "cover" }}
          />
          <h4 className="fw-bold rosa">{t("resetPassword.title")}</h4>
          <p className="text-secondary small">{t("resetPassword.subtitle")}</p>
        </div>

        {success ? (
          <div>
            <div className="alert alert-success" role="alert">
              {t("resetPassword.success")}
            </div>
            <p className="text-center text-secondary small">
              {t("resetPassword.redirecting")}
            </p>
          </div>
        ) : (
          <>
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input pe-5"
                  placeholder={t("resetPassword.newPasswordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOff style={{color: "#ccc"}} /> : <Visibility style={{color: "#ccc"}} />}
                </button>
              </div>

              <div className="mb-3 position-relative">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  className="login-input pe-5"
                  placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                >
                  {showPasswordConfirmation ? <VisibilityOff style={{color: "#ccc"}} /> : <Visibility style={{color: "#ccc"}} />}
                </button>
              </div>

              {error && <p className="text-danger small">{error}</p>}

              <button 
                type="submit" 
                className="rosa-fondo btn-light w-100 login-btn"
                disabled={loading}
              >
                {loading ? "..." : t("resetPassword.resetButton")}
              </button>
            </form>
          </>
        )}
      </div>

      <div className="wave-wrapper">
        <div className="wave-top-bg">
          <svg viewBox="0 0 1440 320" className="wave-svg">
            <path
              fill="#ffffff"
              fillOpacity="0.4"
              d="M0,160L60,165.3C120,171,240,181,360,181.3C480,181,600,171,720,160C840,149,960,139,1080,122.7C1200,107,1320,85,1380,74.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
            <path
              fill="#ffffff"
              fillOpacity="0.6"
              d="M0,192L60,186.7C120,181,240,171,360,149.3C480,128,600,96,720,96C840,96,960,128,1080,138.7C1200,149,1320,139,1380,133.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,224L60,213.3C120,203,240,181,360,165.3C480,149,600,139,720,149.3C840,160,960,192,1080,192C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
