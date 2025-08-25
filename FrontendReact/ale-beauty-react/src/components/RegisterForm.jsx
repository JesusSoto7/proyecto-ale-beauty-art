import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate, Link, useParams } from 'react-router-dom';
import bannerImg from '../assets/images/bannreg.png';

function Register() {
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { lang } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');


    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
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
      setSuccess('Usuario registrado correctamente');
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
            <h2>Crear cuenta</h2>
            <form onSubmit={handleSubmit}>
              <div className="row-card">
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
                <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />
              </div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" />
              <div className="row-card">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" />
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={e => setPasswordConfirmation(e.target.value)}
                  placeholder="Confirmar contraseña"
                />
              </div>
              <button type="submit">Registrarse</button>
              {error && <p className="error">{error}</p>}
              {success && <p className="success">{success}</p>}
              <p className='text-center'>
                ¿Ya tiene una cuenta? <Link to={`/${lang}/login`} className="rosa text-decoration-underline">Inicia Sesión</Link>
              </p>
            </form>
          </div>
          <div className="image-section">
            <img src={bannerImg} alt="Cosméticos" />
          </div>
        </div>

        <div class="wave-wrapper">
          <div class="wave-top-bg">
            <svg viewBox="0 0 1440 320" class="wave-svg">
              <path fill="#ffffff" fill-opacity="0.4"
                d="M0,160L60,165.3C120,171,240,181,360,181.3C480,181,600,171,720,160C840,149,960,139,1080,122.7C1200,107,1320,85,1380,74.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
              <path fill="#ffffff" fill-opacity="0.6"
                d="M0,192L60,186.7C120,181,240,171,360,149.3C480,128,600,96,720,96C840,96,960,128,1080,138.7C1200,149,1320,139,1380,133.3L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
              <path fill="#ffffff" fill-opacity="1"
                d="M0,224L60,213.3C120,203,240,181,360,165.3C480,149,600,139,720,149.3C840,160,960,192,1080,192C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
            </svg>
          </div>
        </div>
      </div>

    </>
  );
}

export default Register;
