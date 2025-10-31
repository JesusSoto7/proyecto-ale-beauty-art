import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import bannerImg from "../assets/images/bannreg.png";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useAlert } from "../components/AlertProvider.jsx";

function Register() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { lang } = useParams();
  const { addAlert } = useAlert();
  const { t } = useTranslation();

  const validateFields = () => {
    let isValid = true;
    let message = "";

    // palabras betadas
    const badWords = [
      "tonto", "idiota", "imbecil", "estupido", "pendejo",
      "mierda", "puta", "perra", "cabron", "malparido"
    ];

    if (!nombre.trim()) {
      addAlert("El nombre es obligatorio.", "warning", 6000);
      isValid = false;
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(nombre)) {
      addAlert("El nombre solo puede contener letras y espacios.", "warning", 6000);
      isValid = false;
    } else if (badWords.some(word => nombre.toLowerCase().includes(word))) {
      addAlert("Por favor ingresa un nombre válido.", "warning", 6000);
      isValid = false;
    }

    if (!apellido.trim()) {
      addAlert("El apellido es obligatorio.", "warning", 6000);
      isValid = false;
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(apellido)) {
      addAlert("El apellido solo puede contener letras y espacios.", "warning", 6000);
      isValid = false;
    } else if (badWords.some(word => apellido.toLowerCase().includes(word))) {
      addAlert("Por favor ingresa un apellido válido.", "warning", 6000);
      isValid = false;
    }

    if (!email) {
      message = "El correo es obligatorio.";
      isValid = false;
    } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
      message = "El correo no tiene un formato válido.";
      isValid = false;
    } else if (/[A-ZÁÉÍÓÚÜÑáéíóúüñ]/.test(email)) {
      message = "El correo no debe contener mayúsculas ni acentos.";
      isValid = false;
    }

    if (message) addAlert(message, "warning", 6000);

    if (!password) {
      addAlert("La contraseña es obligatoria.", "warning", 6000);
      isValid = false;
    } else if (password.length < 6) {
      addAlert("La contraseña debe tener al menos 6 caracteres.", "warning", 6000);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // 🔹 Ejecutamos las validaciones antes de continuar
    if (!validateFields()) return;

    if (password !== passwordConfirmation) {
      addAlert(t("register.passwordsNotMatch"), "warning", 6000);
      return;
    }

    try {
      const data = await register({
        email,
        password,
        password_confirmation: passwordConfirmation,
        nombre,
        apellido,
      });
      setSuccess(t("register.registrationSuccess"));
      addAlert(t("register.registrationSuccess"), "success", 5000);
      navigate(`/${lang}/login`);
      console.log("Registro exitoso:", data);
    } catch (err) {
      setError(err.message);
      addAlert(err.message, "error", 7000);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card shadow-lg">
        <div className="form-section">
          <h2>{t("register.createAccount")}</h2>
          <form onSubmit={handleSubmit}>
            <div className="row-card">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder={t("register.firstName")}
              />
              <input
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder={t("register.lastName")}
              />
            </div>

            <input
              value={email}
              name="email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("register.email")}
              autoComplete="email"
            />

            <div className="row-card">
              {/* Password */}
              <div className="position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("register.password")}
                  className="pe-5"
                />
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

              {/* Confirm Password */}
              <div className="position-relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder={t("register.confirmPassword")}
                  className="pe-5"
                />
                <button
                  type="button"
                  className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <VisibilityOff style={{ color: "#ccc" }} />
                  ) : (
                    <Visibility style={{ color: "#ccc" }} />
                  )}
                </button>
              </div>
            </div>

            <button type="submit">{t("register.registerButton")}</button>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}

            <p className="text-center">
              {t("register.alreadyHaveAccount")}{" "}
              <Link to={`/${lang}/login`} className="rosa text-decoration-underline">
                {t("register.loginLink")}
              </Link>
            </p>
          </form>
        </div>

        <div className="image-section">
          <img src={bannerImg} alt={t("register.cosmeticsImageAlt")} />
        </div>
      </div>

      <div className="wave-wrapper">
        <div className="wave-top-bg">
          <svg viewBox="0 0 1440 320" className="wave-svg">
            <path
              fill="#ffffff"
              fillOpacity="0.4"
              d="M0,160L60,165.3C120,171,240,181,360,181.3C480,181,600,171,720,160C840,149,960,139,1080,122.7C1200,107,1320,85,1380,74.7L1440,64L1440,320L0,320Z"
            />
            <path
              fill="#ffffff"
              fillOpacity="0.6"
              d="M0,192L60,186.7C120,181,240,171,360,149.3C480,128,600,96,720,96C840,96,960,128,1080,138.7C1200,149,1320,139,1380,133.3L1440,128L1440,320L0,320Z"
            />
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,224L60,213.3C120,203,240,181,360,165.3C480,149,600,139,720,149.3C840,160,960,192,1080,192C1200,192,1320,160,1380,144L1440,128L1440,320L0,320Z"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Register;
