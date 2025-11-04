import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import Dashboard from './page/home/Dashboard';
import DashboardLayout from './components/dashComponents/DashboardLayout.jsx';
import ProductTable from './page/home/productTable/Productos';
import Categorias from './page/home/Categorias';
import Carousel from './page/home/Carousel';
import CategoryProducts from "./page/home/CategoryProducts";
import AdminLoginForm from './components/AdminLoginForm';
import { AlertProvider } from './components/AlertProvider';

import './assets/stylesheets/RegisterForm.css';
import './assets/stylesheets/LoginForm.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/stylesheets/GestionUsuarios.css';
import './App.css';
import "./i18n";

import { useTranslation } from "react-i18next";
import ProtectedRoute from './page/home/ProtectedRoute';
import Forbidden403 from './page/home/Forbidden403';
import SubCategorias from './page/home/SubCategories';
import GestionUsuarios from './components/dashComponents/GestionUsuarios';
import Notificationes from './page/home/Notifications';
import CreateDiscount from './page/home/CreateDiscount';
import UserProfile from "./components/dashComponents/userPerfil.jsx";
import { isAuthenticated, isAdmin } from './services/authService';
import AuthGate from './components/auth/AuthGate.jsx';
import Orders from './page/home/Orders.jsx';

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
    const token = localStorage.getItem('token');
    const roles = JSON.parse(localStorage.getItem('roles')) || [];
    return token && roles.includes('admin');
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  // Debug: Log para verificar el estado
  React.useEffect(() => {
    console.log('isLoggedIn:', isLoggedIn);
    console.log('token:', localStorage.getItem('token'));
    console.log('roles:', localStorage.getItem('roles'));
  }, [isLoggedIn]);

  return (
    <AlertProvider>
      <Router>
         <AuthGate /> 
        <Routes>
          {/* Redirige / al idioma por defecto */}
          <Route
            path="/"
            element={
              isLoggedIn 
                ? <Navigate to={`/${(navigator.language || "es").startsWith("es") ? "es" : "en"}/home`} replace />
                : <Navigate to={`/${(navigator.language || "es").startsWith("es") ? "es" : "en"}/login`} replace />
            }
          />

          {/* Rutas con idioma */}
          <Route path="/:lang" element={<Wrapper />}>
            {/* Ruta de login */}
            <Route 
              path="login" 
              element={
                isLoggedIn ? 
                  <Navigate to="home" replace /> : 
                  <AdminLoginForm onLogin={handleLogin} />
              } 
            />
            

            {/* Página de acceso denegado */}
            <Route path="403" element={<Forbidden403 />} />

            {/* Rutas protegidas del dashboard */}
            <Route path="home" element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductTable />} />
              <Route path="categories" element={<Categorias />} />
              <Route path="categories/:slug" element={<SubCategorias />} />
              <Route path="categories/:id" element={<CategoryProducts />} /> 
              <Route path="carousel" element={<Carousel />} />
              <Route path="usuarios" element={<GestionUsuarios />} />
              <Route path="notificaciones" element={<Notificationes />} />
              <Route path="crear_descuento" element={<CreateDiscount />} />
              <Route path="user-profile" element={<UserProfile />} />
              <Route path="orders" element={<Orders />} />
            </Route>
          </Route>

          {/* Ruta catch-all para URLs no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;
