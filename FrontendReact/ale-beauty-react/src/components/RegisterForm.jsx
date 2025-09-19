import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import bannerImg from '../assets/images/bannreg.png';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Register() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== passwordConfirmation) {
      setError(t('register.passwordsNotMatch'));
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
      setSuccess(t('register.registrationSuccess'));
      navigate(`/${lang}/login`);
      console.log('Registro exitoso:', data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-card shadow-lg">
          <div className="form-section">
            <h2>{t('register.createAccount')}</h2>
            <form onSubmit={handleSubmit}>
              <div className="row-card">
                <input 
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)} 
                  placeholder={t('register.firstName')} 
                />
                <input 
                  value={apellido} 
                  onChange={e => setApellido(e.target.value)} 
                  placeholder={t('register.lastName')} 
                />
              </div>
              <input 
                value={email} 
                name="email"
                onChange={e => setEmail(e.target.value)} 
                placeholder={t('register.email')} 
                autoComplete="email"
              />
              <div className="row-card">
                {/* Password */}
                <div className="position-relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={t("register.password")}
                    className="pe-5"
                  />
                  <button
                    type="button"
                    className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <VisibilityOff style={{color: "#ccc"}} /> : <Visibility style={{color: "#ccc"}} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="position-relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordConfirmation}
                    onChange={e => setPasswordConfirmation(e.target.value)}
                    placeholder={t("register.confirmPassword")}
                    className="pe-5"
                  />
                  <button
                    type="button"
                    className="btn position-absolute top-50 end-0 translate-middle-y border-0 bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff style={{color: "#ccc"}} /> : <Visibility style={{color: "#ccc"}} />}
                  </button>
                </div>
              </div>
              <button type="submit">{t('register.registerButton')}</button>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
              <p className='text-center'>
                {t('register.alreadyHaveAccount')}{' '}
                <Link to={`/${lang}/login`} className="rosa text-decoration-underline">
                  {t('register.loginLink')}
                </Link>
              </p>
            </form>
          </div>
          <div className="image-section">
            <img src={bannerImg} alt={t('register.cosmeticsImageAlt')} />
          </div>
        </div>

        <div className="wave-wrapper">
          <div className="wave-top-bg">
            <svg viewBox="0 0 1440 320" className="wave-svg">
              <path fill="#ffffff" fillOpacity="0.4"
                d="M0,160L60,165.3C120,171,240,181,360,181.3C480,181,600,171,720,160C840,149,960,139,1080,122.7C1200,107,1320,85,1380,74.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
              <path fill="#ffffff" fillOpacity="0.6"
                d="M0,192L60,186.7C120,181,240,171,360,149.3C480,128,600,96,720,96C840,96,960,128,1080,138.7C1200,149,1320,139,1380,133.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
              <path fill="#ffffff" fillOpacity="1"
                d="M0,224L60,213.3C120,203,240,181,360,165.3C480,149,600,139,720,149.3C840,160,960,192,1080,192C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;