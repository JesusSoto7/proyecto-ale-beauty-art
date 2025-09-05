import { Navigate, useParams } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }){
    const roles = JSON.parse(localStorage.getItem("roles")) || [];
    const { lang } = useParams();

    if(!roles.includes(requiredRole)){
        return <Navigate to={`/${lang}/403`} replace />;
    }

    return children;
}