

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Register from './components/RegisterForm';
import Inicio from './components/Inicio';
import LayoutInicio from './components/Layout';
import Cart from './components/Cart';
import ShippingAddress from './components/ShippingAddress';
import ShippingAddressForm from './components/ShippingAddressForm';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Carousel from './pages/Carousel';


import './assets/stylesheets/RegisterForm.css';
import './assets/stylesheets/Inicio.css'
import './assets/stylesheets/Header.css'
import './assets/stylesheets/Footer.css'
import './assets/stylesheets/Cart.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

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

        <Route element={<LayoutInicio />}>
          <Route
            path='/direcciones'
            element={<ShippingAddress />}
          />
          <Route path="/direcciones/nueva" element={<ShippingAddressForm onSuccess={() => { }} />} />
        </Route>


        <Route
          path="/login"
          element={<LoginForm onLogin={() => setIsLoggedIn(true)} />}
        />

        {/* O incluso: <Route index element={<DashboardMain />} /> */}
        <Route path="/home" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<Productos />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="carousel" element={<Carousel />} />
        </Route>


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
            element={<Cart />} />
        </Route>


      </Routes>
    </Router>
  );
}

export default App;
