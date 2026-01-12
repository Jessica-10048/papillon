// routes/contact.router.js
const express = require('express');
const router = express.Router();
const { sendContact } = require('../services/nodemailer');

// Route POST pour envoyer un message de contact
router.post('/', async (req, res) => {
  try {
    const { nom, email, objet, message } = req.body;

    // Validation des champs
    if (!nom || !email || !objet || !message) {
      return res.status(400).json({ 
        message: "Tous les champs sont requis" 
      });
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Format d'email invalide" 
      });
    }

    // Envoi de l'email
    await sendContact({ nom, email, objet, message });

    res.status(200).json({ 
      message: "Message envoyé avec succès !" 
    });
  } catch (error) {
    console.error('Erreur envoi contact:', error);
    res.status(500).json({ 
      message: "Erreur lors de l'envoi du message" 
    });
  }
});

module.exports = router;