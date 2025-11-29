import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import ProtectedRoute from './page/home/ProtectedRoute';
import Forbidden403 from './page/home/Forbidden403';
import SubCategorias from './page/home/SubCategories';
import GestionUsuarios from './components/dashComponents/GestionUsuarios';
import Notificationes from './page/home/Notifications';
import CreateDiscount from './page/home/CreateDiscount';
import UserProfile from "./components/dashComponents/userPerfil.jsx";
import { isAuthenticated, isAdmin } from './services/authService';
import AuthGate from './components/auth/AuthGate.jsx';
import UserFullPerfil from './components/dashComponents/UserFullPerfil';
import Orders from './page/home/Orders.jsx';
import Sales from './page/home/Sales.jsx';
import AdminSupportMessages from "./components/dashComponents/AdminSupporMessages.jsx";
import AdminProfile from './components/dashComponents/AdminProfile.jsx';

// Nota: eliminada la envoltura basada en ruta de idioma. El dashboard ya no usa prefijos '/es' o '/en' en la URL.

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
          {/* Redirige / al dashboard o login sin prefijo de idioma */}
          <Route
            path="/"
            element={
              isLoggedIn
                ? <Navigate to={`/home`} replace />
                : <Navigate to={`/login`} replace />
            }
          />

          {/* Ruta de login */}
          <Route
            path="/login"
            element={
              isLoggedIn ?
                <Navigate to="/home" replace /> :
                <AdminLoginForm onLogin={handleLogin} />
            }
          />

          {/* Página de acceso denegado */}
          <Route path="/403" element={<Forbidden403 />} />

          {/* Rutas protegidas del dashboard (sin prefijo de idioma) */}
          <Route path="/home" element={
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
            <Route path="user-full-perfil/:id" element={<UserFullPerfil />} />
            <Route path="notificaciones" element={<Notificationes />} />
            <Route path="crear_descuento" element={<CreateDiscount />} />
            <Route path="user-profile" element={<UserProfile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="support-messages" element={<AdminSupportMessages />} />
            <Route path="perfil" element={<AdminProfile />} />
          </Route>

          {/* Ruta catch-all para URLs no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AlertProvider>
  );
}

export default App;
