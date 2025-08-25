import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
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
import CheckoutLayout from './components/CheckoutLayout';
import Checkout from './pages/inicio/Checkout';
import CheckoutSuccess from './components/CheckoutSuccess';
import Perfil from './components/Perfil'

import './assets/stylesheets/RegisterForm.css';
import './assets/stylesheets/LoginForm.css';
import './assets/stylesheets/Inicio.css'
import './assets/stylesheets/Header.css'
import './assets/stylesheets/Footer.css'
import './assets/stylesheets/Cart.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import "./i18n";

import { useTranslation } from "react-i18next";

function Wrapper() {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  // cada vez que cambie la URL, se actualiza el idioma de i18n
  React.useEffect(() => {
    if (lang && ['es', 'en'].includes(lang)) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <Outlet />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return !!localStorage.getItem('token');
  });

  return (
    <Router>
      <Routes>
        {/* redirige / al idioma por defecto */}
        <Route
          path="/"
          element={
            <Navigate
              to={`/${(navigator.language || "es").startsWith("es") ? "es" : "en"}/login`}
              replace
            />
          }
        />


        {/* Rutas con idioma */}
        <Route path="/:lang" element={<Wrapper />}>
          <Route element={<LayoutInicio />}>
            <Route
              path="inicio"
              element={isLoggedIn ? <Inicio /> : <Navigate to="../login" />}
            />
            <Route path="productos" element={<ProductosCliente />} />
            <Route path="producto/:slug" element={<ProductDetails />} />
            <Route path="direcciones" element={<ShippingAddress />} />
            <Route path="direcciones/nueva" element={<ShippingAddressForm />} />
            <Route path="carrito" element={<Cart />} />
            <Route path="perfil" element={<Perfil />} />
          </Route>

          <Route element={<CheckoutLayout />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="checkout/success/:paymentId" element={<CheckoutSuccess />} />
          </Route>

          <Route path="login" element={<LoginForm onLogin={() => setIsLoggedIn(true)} />} />
          <Route path="register" element={<Register />} />

          <Route path="home" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ProductTable />} />
            <Route path="categories" element={<Categorias />} />
            <Route path="carousel" element={<Carousel />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
