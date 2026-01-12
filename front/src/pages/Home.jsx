import { useEffect } from "react";
import api from '../utilis/axios';
import butterfly from "../assets/butterfly.jpg";

const Home = () => {
  useEffect(() => {
    api
      .get("http://localhost:8000")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <main>
      <h1>
        Bienvenue Les Papillons 🦋
      </h1>

      <img
        className="home-image"
        src={butterfly}
        alt="Papillon"
      />

      <div className="poem">
        <p>À toi, Papillon</p>

        <p>
          Tu as traversé des choses que peu comprennent.<br />
          Ton passé t’a blessée, parfois brisée, et pourtant tu es encore là.<br />
          Même quand tu pensais ne plus avoir la force, tu as tenu.
        </p>

        <p>
          Tu t’es enfermée pour survivre.<br />
          Pour te protéger.<br />
          Et c’était nécessaire.
        </p>

        <p>
          Aujourd’hui, tu n’as pas besoin d’aller vite.<br />
          Tu n’as rien à prouver.<br />
          Chaque petit pas compte, même ceux que personne ne voit.
        </p>

        <p>
          Tu portes en toi une force silencieuse.<br />
          Même si tu doutes, même si tu trembles.<br />
          Tu n’es pas faible d’avoir souffert — tu es courageuse d’être restée debout.
        </p>

        <p>
          Un jour, tu ouvriras tes ailes.<br />
          Pas parce que tout ira bien,<br />
          mais parce que tu auras choisi de ne plus rester enfermée.
        </p>

        <p>
          Prends ton temps, Papillon.<br />
          Tu n’es pas seule.<br />
          Et tu mérites la douceur, la paix, et la lumière.
        </p>
      </div>
    </main>
  );
};

export default Home;
