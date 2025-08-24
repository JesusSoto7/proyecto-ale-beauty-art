import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Register from './components/RegisterForm';
import Inicio from './pages/inicio/Inicio';
import LayoutInicio from './components/Layout';
import Cart from './components/Cart';
import ShippingAddress from './components/ShippingAddress';
import ShippingAddressForm from './components/ShippingAddressForm';
import Dashboard from './pages/home/Dashboard';
import DashboardLayout from './components/DashboardLayout';
import ProductTable from './pages/home/Productos';
import Categorias from './pages/home/Categorias';
import Carousel from './pages/home/Carousel';
import ProductDetails from './pages/productsDetails/ProductDetails';
import ProductosCliente from "./pages/ProductosCliente/productosCliente";
import Perfil from './components/perfil';

import './assets/stylesheets/RegisterForm.css';
import './assets/stylesheets/LoginForm.css';
import './assets/stylesheets/home.css';
import './assets/stylesheets/Inicio.css'
import './assets/stylesheets/Header.css'
import './assets/stylesheets/Footer.css'
import './assets/stylesheets/Cart.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import CheckoutLayout from './components/CheckoutLayout';
import Checkout from './pages/inicio/Checkout';
import CheckoutSuccess from './components/CheckoutSuccess';

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return !!localStorage.getItem('token');
  });

  return (
    <Router>
      <Routes>

        <Route element={<LayoutInicio />}>
          <Route
            path='/inicio'
            element={isLoggedIn ? <Inicio /> : <Navigate to="/login" />}
          />
           <Route
            path="/products"
            element={<ProductosCliente />}
          />
        </Route>

        <Route element={<CheckoutLayout />}>
          <Route
            path='/checkout'
            element={<Checkout />}
          />
          <Route
            path='/checkout/success/:paymentId'
            element={<CheckoutSuccess />}
          />
        </Route>

        <Route element={<LayoutInicio />}>
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route
            path='/direcciones'
            element={<ShippingAddress />}
          />
          <Route path="/direcciones/nueva" element={<ShippingAddressForm onSuccess={() => { }} />} />
          <Route path="/perfil" element={<Perfil />} />
        </Route>


        <Route
          path="/login"
          element={<LoginForm onLogin={() => setIsLoggedIn(true)} />}
        />

        <Route path="/home" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="productos" element={<ProductTable />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="carousel" element={<Carousel />} />
        </Route>


        <Route
          path="/register"
          element={<Register />}
        />

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