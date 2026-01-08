import logo from "../assets/logoPapillon.png";


const Header = () => {
  return (
    <header className="header">
      <img src={logo} alt="Logo Papillon" className="logo" />
      <nav>
        <ul className="nav-list">
          <li>Accueil</li>
          <li>À propos</li>
          <li>Contact</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
