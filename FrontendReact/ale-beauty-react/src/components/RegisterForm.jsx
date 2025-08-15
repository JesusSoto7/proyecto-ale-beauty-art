import React, { useState } from 'react';
import { register } from '../services/authService';
import { useNavigate, Link } from 'react-router-dom';
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
      navigate('/login');
      console.log('Registro exitoso:', data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="register-container">
        <div className="register-card">
          <div className="form-section">
            <h2>Crear cuenta</h2>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
                <input value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Apellido" />
              </div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Correo electrónico" />
              <div className="row">
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
              <p>
                ¿Ya tiene una cuenta? <Link to="/login">Inicia Sesión</Link>
              </p>
            </form>
          </div>
          <div className="image-section">
            <img src={bannerImg} alt="Cosméticos" />
          </div>
        </div>
      </div>

    </>
  );
}

export default Register;
