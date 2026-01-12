import logo from "../assets/logoPapillon.png";
import { Router , Link } from "react-router";

const Header = () => {
  return (
    <header className="header">
      <img src={logo} alt="Logo Papillon" className="logo" />
      <nav>
        <ul className="nav-list">
          <Link>Accueil</Link>
          <Link>À propos</Link>
          <Link>Contact</Link>
          <Link>connexion </Link>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
