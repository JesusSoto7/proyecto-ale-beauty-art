import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/ale_logo.jpg';
import { BsHeart } from "react-icons/bs";
import { IoPersonCircleSharp } from "react-icons/io5";
import { BsCart4 } from "react-icons/bs";
import Dropdown from 'react-bootstrap/Dropdown';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  function toggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    alert('Buscar: ' + searchTerm);
  }

  async function handleLogout() {
    localStorage.removeItem('token');

    fetch('https://localhost:4000/api/v1/sign_out', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }).finally(() => {
      window.location.href = '/login'
    });
  }

  return (
    <header className="navbar">
      <div className="logo">
        <Link to="/inicio">
          <img src={logo} alt="Logo Tienda de Belleza" />
        </Link>
      </div>

      <nav id="main-nav" className={menuOpen ? "open" : ""}>
        <Link to="/inicio" className={location.pathname === '/inicio' ? 'active' : ''}>INICIO</Link>
        <Link to="/productos" className={location.pathname === '/productos' ? 'active' : ''}>PRODUCTOS</Link>
        <Link to="/user_categories" className={location.pathname === '/user_categories' ? 'active' : ''}>CATEGORÍAS</Link>
      </nav>

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

        <div className="header-icons">
          <Dropdown align="end">
            <Dropdown.Toggle as="span" className="icon-dropdown">
              <IoPersonCircleSharp size={35} />
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey="1">Perfil</Dropdown.Item>
              <Dropdown.Item eventKey="2">Mis direcciones</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>Cerrar sesión</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <BsHeart size={25} />

          <Link to={"/carrito"}>
            <BsCart4 size={30} />
          </Link>

        </div>
      </div>
    </header>
  );
}
