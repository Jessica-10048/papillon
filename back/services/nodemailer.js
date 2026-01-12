const nodemailer = require('nodemailer'); // Importer le package Nodemailer
const ENV = require('../config/env.js')

const transporter = nodemailer.createTransport({
  // Configuration du serveur SMTP de Gmail
  host: "smtp.gmail.com",
  // Port standard pour TLS
  port: 587,
  // false pour TLS (port 587), true pour SSL (port 465)
  secure: false,
  // Authentification avec les identifiants Gmail
  auth: {
    // l'email configuré dans .env
    user: ENV.EMAIL_USER,
    // mot de passe configuré dans .env 
    pass: ENV.EMAIL_PASS,
  },
});

// Cette fonction va nous permettre d'envoyer un email de vérification
// C'est super important pour s'assurer que l'utilisateur 
// a bien accès à l'email qu'il a renseigné!
const sendEmail = async (user, verifieToken) => {
  // On crée un lien de vérification que l'utilisateur pourra cliquer
  // Le ${verifieToken} sera remplacé par le vrai token généré précédemment
  const verificationLink = `${ENV.PORT_APPLICATION_FRONT}/verify/${verifieToken}`;

  console.log("DANS NODEMAILER => ", ENV.EMAIL_USER);

  // Maintenant, on va utiliser notre configuration nodemailer 
  // pour envoyer l'email
  // C'est comme envoyer une lettre, mais en version numérique! 📧
  await transporter.sendMail({
    // C'est nous qui envoyons l'email (comme l'adresse de l'expéditeur)
    from: ENV.EMAIL_USER,   
    // L'adresse email de notre nouvel utilisateur
    to: user.email,        
    // Le sujet du mail (ce que verra l'utilisateur en premier)
    subject: "Vérifiez votre email", 
    
    // Le message en version texte simple (au cas où l'HTML ne marche pas)
    text: `Hello ${user.name},\n\nMerci de vous être inscrit\n\nCordialement.`,
    
    // La version en HTML avec notre lien de vérification
    html: `Cliquez sur ce lien pour vérifier votre email : <a href='${verificationLink}'> Cliquer ici </a>`,
  });
};



const sendContact = async ({ nom, email, objet, message }) => {
  await transporter.sendMail({
    from: `"${nom}" <${email}>`, 
    to: ENV.EMAIL_USER,
    subject: `Contact : ${objet}`,
    html: `
      <h3>Nouveau message de contact</h3>
      <p><strong>Nom :</strong> ${nom}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Objet :</strong> ${objet}</p>
      <p><strong>Message :</strong></p>
      <p>${message}</p>
    `,
  });
};

// ⭐ NOUVELLE FONCTION : Envoi email de récupération mot de passe
const sendPasswordReset = async (user, resetToken) => {
  // Créer le lien de récupération
  const resetURL = `${ENV.PORT_APPLICATION_FRONT}/reset-password/${resetToken}`;
  
  console.log("📧 Envoi email reset à:", user.email);
  
  // Envoyer l'email avec votre transporter existant
  await transporter.sendMail({
    from: `"École Maternelle" <${ENV.EMAIL_USER}>`,
    to: user.email,
    subject: "🔐 Réinitialisation de votre mot de passe",
    
    // Version texte
    text: `Bonjour ${user.username},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nCliquez sur ce lien : ${resetURL}\n\nCe lien expire dans 10 minutes.\n\nCordialement.`,
    
    // Version HTML
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Bonjour ${user.username},</h2>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte École Maternelle.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Réinitialiser mon mot de passe
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          ⚠️ Ce lien expire dans <strong>10 minutes</strong> pour votre sécurité.
        </p>
        
        <p style="color: #666; font-size: 14px;">
          Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
        </p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          École Maternelle - Cet email a été envoyé automatiquement
        </p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendContact,
  sendPasswordReset, 
}