import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/images/ale_logo.jpg';
import { BsHeart } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BsCart4 } from "react-icons/bs";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    alert('Buscar: ' + searchTerm);
  }

  return (
    <header className="navbar">
      {/* Logo más a la izquierda */}
      <div className="logo">
        <Link to="/inicio">
          <img src={logo} alt="Logo Tienda de Belleza" />
        </Link>
      </div>

      {/* Menú */}
      <nav id="main-nav" className={menuOpen ? "open" : ""}>
        <Link to="/inicio" className={location.pathname === '/inicio' ? 'active' : ''}>INICIO</Link>
        <Link to="/productos" className={location.pathname === '/productos' ? 'active' : ''}>PRODUCTOS</Link>
        <Link to="/user_categories" className={location.pathname === '/user_categories' ? 'active' : ''}>CATEGORÍAS</Link>
      </nav>

      {/* Buscador + Iconos alineados */}
      <div className="search-icons-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar"
            className="search-input"
          />
          <button type="submit" className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </form>

        {/* Iconos */}
        <div className="header-icons">
          <IoPersonCircleSharp />
          <BsHeart />
          <BsCart4 />
        </div>
      </div>
    </header>
  );
}
