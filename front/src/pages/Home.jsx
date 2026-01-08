import { useEffect } from "react";
import axios from "axios";

const Home = () => {
  useEffect(() => {
    axios.get("http://localhost:8000")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Bienvenue Les Papillons 🦋</h1>
    </div>
  );
};

export default Home;