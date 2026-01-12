const express = require('express');
const connectMongoDB = require('./config/dbMongo');
const ENV = require('./config/env')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const path = require('path');   

// IMPORT ROUTES
const userRouter = require('./routes/user.router')
const contactRouter = require('./routes/contact.router');

// Module pour convertir les URL en chemins de fichiers
const { fileURLToPath } = require('url');
// CONNEXION MONGO
connectMongoDB(ENV.MONGO_URI_LOCAL, ENV.DB_NAME);

// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.urlencoded({ extended: true }));
// URLS API PREFIX

app.use("/api/user",userRouter)
app.use("/api/contact", contactRouter);
// MIDDLEWARE GESTION D ERREURS


module.exports = app;