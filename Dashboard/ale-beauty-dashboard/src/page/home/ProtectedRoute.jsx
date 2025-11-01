import { Navigate, useParams } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
    const token = localStorage.getItem("token");
    const roles = JSON.parse(localStorage.getItem("roles")) || [];
    const { lang } = useParams();

    // Si no hay token, redirigir al login
    if (!token) {
        return <Navigate to={`/${lang}/login`} replace />;
    }

    // Si no tiene el rol requerido, redirigir a 403
    if (requiredRole && !roles.includes(requiredRole)) {
        return <Navigate to={`/${lang}/403`} replace />;
    }

    return children;
}