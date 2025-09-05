import React from "react";
import { Link, useParams } from "react-router-dom";

export default function Forbidden403(){
    const { lang } = useParams();
    return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
      <h1 className="display-1 fw-bold text-danger">403</h1>
      <h2 className="mb-3">Acceso denegado</h2>
      <p className="mb-4 text-secondary">
        No tienes permiso para acceder a esta página.
      </p>
      <Link to={`/${lang}/inicio`} className="btn btn-primary">
        Ir a inicio
      </Link>
    </div>
    );
}