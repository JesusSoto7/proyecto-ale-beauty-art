import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { login } from "../services/authService";
import ale_logo from "../assets/images/ale_logo.jpg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAlert } from "../components/AlertProvider.jsx";

function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { lang } = useParams();
  const { addAlert } = useAlert();
  const { t } = useTranslation();

  useEffect(() => {
    if (emailError) {
      addAlert(emailError, "warning", 8000);
    }
  }, [emailError]);

  useEffect(() => {
    if (passwordError) {
      addAlert(passwordError, "warning", 8000);
    }
  }, [passwordError]);

  const validateFields = () => {
    let isValid = true;

    if (!email) {
      setEmailError("El correo es obligatorio.");
      isValid = false;
    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
      setEmailError("El correo no tiene un formato válido.");
      isValid = false;
    } else if (/[A-ZÁÉÍÓÚÜÑáéíóúüñ]/.test(email)) {
      setEmailError("El correo no debe contener mayúsculas ni acentos.");
      isValid = false;
    } else {
      setEmailError("");
    }


    if (!password) {
      setPasswordError("La contraseña es obligatoria.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Debe tener al menos 6 caracteres.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateFields()) return;

    try {
      const data = await login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("roles", JSON.stringify(data.user.roles));
      onLogin();

      // No redirigir a panel de administración desde la tienda; siempre llevar al inicio público
      navigate(`/${lang}/inicio`);
    } catch (err) {
      setError(err.message);
      addAlert(err.message || "Error al iniciar sesión.", "error", 8000);
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
          <h4 className="fw-bold rosa">{t("login.welcome")}</h4>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <input
              type="email"
              name="email"
              className={`login-input ${emailError ? "is-invalid" : ""}`}
              placeholder={t("login.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {/* {emailError && <small className="text-danger">{emailError}</small>} */}
          </div>

          <div className="mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className={`login-input pe-5 ${passwordError ? "is-invalid" : ""}`}
              placeholder={t("login.passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* {passwordError && <small className="text-danger">{passwordError}</small>} */}

            <button
              type="button"
              className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <VisibilityOff style={{ color: "#ccc" }} />
              ) : (
                <Visibility style={{ color: "#ccc" }} />
              )}
            </button>
          </div>

          {/* {error && <p className="text-danger small">{error}</p>} */}

          <div className="text-end mb-3">
            <Link to={`/${lang}/forgot-password`} className="rosa text-decoration-none small">
              {t("login.forgotPassword")}
            </Link>
          </div>

          <button type="submit" className="rosa-fondo btn-light w-100 login-btn">
            {t("login.signIn")}
          </button>
        </form>

        {/* Otros métodos */}
        <p className="text-center text-secondary small">
          {t("login.noAccount")}{" "}
          <Link to={`/${lang}/register`} className="rosa text-decoration-none">
            {t("login.register")}
          </Link>
        </p>

        <p className="text-secondary text-center mt-4 small">
          {t("login.terms1")}{" "}
          <a className="rosa text-decoration-underline" href={`/${lang}/terms`}>{t("footer.information.terms")}</a>{" "}
          {t("login.and")}{" "}
          <a className="rosa text-decoration-underline" href={`/${lang}/privacy-policy`}>{t("footer.information.privacy")}</a>.
        </p>
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

export default LoginForm;
