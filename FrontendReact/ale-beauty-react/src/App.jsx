import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Register from './components/RegisterForm';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Inicio from './pages/inicio/Inicio';
import LayoutInicio from './components/Layout';
import Cart from './components/Cart';
import ShippingAddress from './components/ShippingAddress';
import ShippingAddressForm from './components/ShippingAddressForm';
import ProductDetails from './pages/productsDetails/ProductDetails';
import ProductosCliente from "./pages/ProductosCliente/productosCliente";
import CheckoutLayout from './components/CheckoutLayout';
import Checkout from './pages/inicio/Checkout';
import CheckoutSuccess from './components/CheckoutSuccess';
import Perfil from './components/perfil'
import CategoryProductsUser from './components/CategoryProductsUser';
import AboutUs from './components/AboutUs';
import TermsAndConditions from './components/TermsAndConditions';

import './assets/stylesheets/RegisterForm.css';
import './assets/stylesheets/LoginForm.css';
import './assets/stylesheets/Inicio.css'
import './assets/stylesheets/Header.css'
import './assets/stylesheets/Footer.css'
import './assets/stylesheets/Cart.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/stylesheets/GestionUsuarios.css';
import './App.css';
import "./i18n";
import SubCateProd from './components/SubCateProd';

import { useTranslation } from "react-i18next";
import Pedidos from './pages/inicio/Pedidos';
import DetallePedido from './pages/inicio/DetallePedido';
import GuestCheckout from './components/GuestCheckout/GuestCheckout.jsx';
import useRecordPageView from './pages/inicio/hooks/useRecordPageView.js';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import SupportMs from './components/supportMs.jsx';

function Wrapper() {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  // cada vez que cambie la URL, se actualiza el idioma de i18n
  React.useEffect(() => {
    if (lang && ['es', 'en'].includes(lang)) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);
  useRecordPageView();
  return <Outlet />;
}

function App() {

  const [isLoggedIn, setIsLoggedIn] = React.useState(() => {
    return !!localStorage.getItem('token');
  });

  return (
    <Router>
      <Routes>
        {/* redirige / al idioma por defecto, siempre al inicio (público) */}
        <Route
          path="/"
          element={
            <Navigate
              to={`/${(navigator.language || "es").startsWith("es") ? "es" : "en"}/inicio`}
              replace
            />
          }
        />

        {/* Rutas con idioma */}
        <Route path="/:lang" element={<Wrapper />}>
          <Route element={<LayoutInicio />}>
            {/* Inicio ahora es público */}
            <Route path="inicio" element={<Inicio />} />
            <Route path="productos" element={<ProductosCliente />} />
            <Route path="producto/:slug" element={<ProductDetails />} />
            <Route path="direcciones" element={<ShippingAddress />} />
            <Route path="direcciones/nueva" element={<ShippingAddressForm />} />
            <Route path="carrito" element={<Cart />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="categoria/:categoryId" element={<CategoryProductsUser />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="pedidos/:id" element={<DetallePedido />} />
            <Route path="soporte" element={<SupportMs />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="terms" element={<TermsAndConditions />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/:lang/categoria/:categorySlug/:subCategorySlug/products" element={<SubCateProd />} />
          </Route>

          <Route element={<CheckoutLayout />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="checkout/success/:paymentId" element={<CheckoutSuccess />} />
            <Route path="guest-checkout" element={<GuestCheckout />} />
          </Route>

          <Route path="login" element={<LoginForm onLogin={() => setIsLoggedIn(true)} />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;