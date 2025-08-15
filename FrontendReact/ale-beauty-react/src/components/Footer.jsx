export default function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section">
          <h3>Información</h3>
          <ul>
            <li><a href="#">Sobre nosotros</a></li>
            <li><a href="#">Términos y condiciones</a></li>
            <li><a href="#">Política de privacidad</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contacto</h3>
          <ul>
            <li><i className="fas fa-phone"></i> +57 123 456 7890</li>
            <li><i className="fas fa-envelope"></i> alebeautyart@gmail.com</li>
            <li><i className="fas fa-map-marker-alt"></i> Barranquilla, Colombia</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Síguenos</h3>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="https://www.instagram.com/ale.beautyart/"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-pinterest-p"></i></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        © 2025 Tienda de Cosmeticos - Todos los derechos reservados
      </div>
    </footer>
  );
}
