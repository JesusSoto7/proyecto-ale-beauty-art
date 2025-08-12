import './assets/stylesheets/RegisterForm.css';
import './assets/stylesheets/Inicio.css'
import './assets/stylesheets/Header.css'
import './assets/stylesheets/Inicio.css'
import './assets/stylesheets/Footer.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm'; LoginForm
import Register from './components/RegisterForm';
import Inicio from './components/Inicio';
import LayoutInicio from './components/Layout';
import Carrito from './components/Cart';


function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return !!localStorage.getItem('token'); // true si hay token
  });

  return (
    <Router>
      <Routes>

        <Route element={<LayoutInicio />}>
          <Route
            path='/inicio'
            element={isLoggedIn ? <Inicio /> : <Navigate to="/login" />}
          />
        </Route>


        <Route
          path="/login"
          element={<LoginForm onLogin={() => setIsLoggedIn(true)} />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Redirigir ruta raíz al login */}
        <Route
          path="/"
          element={<Navigate to="/login" />}
        />
        <Route element={<LayoutInicio />}>
          <Route path='/carrito'
            element={<Carrito />} />
        </Route>


      </Routes>
    </Router>
  );
}

export default App;
