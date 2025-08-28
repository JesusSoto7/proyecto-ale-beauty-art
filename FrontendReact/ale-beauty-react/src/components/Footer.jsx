import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter"; // se sigue llamando Twitter
import PinterestIcon from "@mui/icons-material/Pinterest";

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
        <div className="social-icons" style={{ display: "flex", gap: "12px" }}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FacebookIcon fontSize="large" style={{ color: "#ffffffff", width: "20px" }} />
          </a>
          <a
            href="https://www.instagram.com/ale.beautyart/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <InstagramIcon fontSize="large" style={{ color: "#ffffffff", width: "20px"}} />
          </a>
          <a href="https://x.com" target="_blank" rel="noopener noreferrer">
            <TwitterIcon fontSize="large" style={{ color: "#ffffffff", width: "20px" }} />
          </a>
          <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer">
            <PinterestIcon fontSize="large" style={{ color: "#ffffffff", width: "20px" }} />
          </a>
        </div>
      </div>

      </div>
      <div className="footer-bottom">
        © 2025 Tienda de Cosmeticos - Todos los derechos reservados
      </div>
    </footer>
  );
}
