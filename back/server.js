const express = require('express');
const connectMongoDB = require('./config/dbMongo');
const ENV = require('./config/env');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// ✅ CONNEXION MONGO
connectMongoDB(ENV.MONGO_URI_LOCAL, ENV.DB_NAME);

// ✅ MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS CORRECT - DOIT ÊTRE AVANT LES ROUTES
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ FICHIERS STATIQUES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ROUTES
app.get("/", (req, res) => {
  res.send("API Les Papillons 🦋");
});

app.use("/api/user", require('./routes/user.router'));
app.use("/api/contact", require('./routes/contact.router'));

// ✅ GESTION DES ERREURS 404
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

// ✅ MIDDLEWARE DE GESTION D'ERREURS
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Erreur serveur";
  res.status(status).json({ message });
});

// ✅ DÉMARRAGE DU SERVEUR
const PORT = ENV.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});