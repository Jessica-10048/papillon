// CONTROLLER USER - controllers/user.controller.js  
// =============================================================================
// Gestion complète des utilisateurs : auth, CRUD, reset password, newsletters

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ENV = require("../config/env");
const users = require("../models/user.model");
const createError = require("../middlewares/error");
const {
  sendEmail,
  sendPasswordReset,
} = require("../services/nodemailer");


// =============================================================================
// HELPERS - Fonctions utilitaires pour la sécurité
// =============================================================================

/**
 * Génère un token de récupération sécurisé (64 caractères aléatoires)
 */
const generateResetToken = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Hash un token avec bcrypt pour stockage sécurisé
 */
const hashToken = (token) => {
  return bcrypt.hashSync(token, 10);
};

/**
 * Vérifie un token contre sa version hashée
 */
const verifyToken = (plainToken, hashedToken) => {
  return bcrypt.compareSync(plainToken, hashedToken);
};

// =============================================================================
// REGISTER - Inscription d'un nouvel utilisateur avec create()
// =============================================================================
const register = async (req, res, next) => {
  try {
    const { role, acceptCGU } = req.body;
    
    // Validation de l'acceptation des CGU
    if (!acceptCGU) {
      return res
        .status(400)
        .json({ message: "Vous devez accepter les CGU pour vous inscrire." });
    }
    
    // Hachage du mot de passe avec bcrypt
    const passwordHashed = await bcrypt.hash(req.body.password, 12);
    
   
    // Création de l'utilisateur avec create()
    const user = await users.create({
      ...req.body,
      password: passwordHashed,
      isVerified: false,
    });

    // Génération du token de vérification email avec JWT
    const verificationToken = jwt.sign({ id: user._id }, ENV.TOKEN_SIGNATURE, {
      expiresIn: "5m",
    });

    // Envoi de l'email de vérification avec nodemailer
    await sendEmail(req.body, verificationToken);

    res.status(201).json({
      message: "Utilisateur créé et email envoyé !",
      user,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

// =============================================================================
// FORGOT PASSWORD - Demande de récupération avec findOne()
// =============================================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Vérification de l'existence de l'utilisateur avec findOne()
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Par sécurité, même réponse si l'email n'existe pas
      return res.status(200).json({
        message: "Si cet email existe, vous recevrez un lien de récupération",
      });
    }

    // Vérification que l'email est vérifié
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Veuillez d'abord vérifier votre email",
      });
    }

    // Génération d'un token de récupération sécurisé
    const resetToken = generateResetToken();
    const hashedToken = hashToken(resetToken);

    // Sauvegarde du token hashé avec save()
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // Envoi de l'email avec nodemailer
    await sendPasswordReset(user, resetToken);

    res.status(200).json({
      message: "Si cet email existe, vous recevrez un lien de récupération",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =============================================================================
// RESET PASSWORD - Réinitialisation avec find() et save()
// =============================================================================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validation du nouveau mot de passe
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères",
      });
    }

    // Recherche des utilisateurs avec token actif avec find()
    const usersWithActiveTokens = await users.find({
      resetPasswordToken: { $exists: true, $ne: null },
      resetPasswordExpires: { $gt: Date.now() },
    });

    // Vérification du token contre les tokens hashés avec bcrypt
    let targetUser = null;
    for (const user of usersWithActiveTokens) {
      if (verifyToken(token, user.resetPasswordToken)) {
        targetUser = user;
        break;
      }
    }

    if (!targetUser) {
      return res.status(400).json({
        message: "Token invalide ou expiré",
      });
    }

    // Hachage du nouveau mot de passe avec bcrypt
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Mise à jour du mot de passe avec save()
    targetUser.password = hashedPassword;
    targetUser.resetPasswordToken = null;
    targetUser.resetPasswordExpires = null;
    await targetUser.save();

    res.status(200).json({
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// =============================================================================
// VERIFY EMAIL - Vérification avec findByIdAndUpdate()
// =============================================================================
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Vérification et décodage du token JWT
    const decoded = jwt.verify(token, ENV.TOKEN_SIGNATURE, (error, data) => {
      if (error) return res.status(500).json(error.message);
      return data;
    });

    // Mise à jour du statut de vérification avec findByIdAndUpdate()
    await users.findByIdAndUpdate(
      decoded.id,
      { isVerified: true },
      { new: true }
    );

    return res.status(200).json({ message: "Email vérifié avec succès !" });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }
    res.status(500).json({ message: error.message });
  }
};

// =============================================================================
// SIGN IN - Connexion utilisateur avec findOne()
// =============================================================================
const sign = async (req, res) => {
  try {
    // Recherche de l'utilisateur par email avec findOne()
    const foundUser = await users.findOne({ email: req.body.email });

    if (!foundUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé !" });
    }

    // Vérification que l'email est vérifié
    if (!foundUser.isVerified) {
      return res.status(403).json({
        message: `Veuillez vérifier votre email pour accéder à cette fonctionnalité.`,
      });
    }

    // Vérification du mot de passe avec bcrypt
    const comparePassword = await bcrypt.compare(
      req.body.password,
      foundUser.password
    );

    if (!comparePassword) {
      return res.status(400).json({ message: "Identifiants incorrects !" });
    }

    // Génération du token JWT
    const token = jwt.sign({ id: foundUser._id }, ENV.TOKEN_SIGNATURE, {
      expiresIn: "24h",
    });

    // Suppression du mot de passe de la réponse
    const { password, ...others } = foundUser._doc;

    // Configuration du cookie sécurisé
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json(others);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// =============================================================================
// READ - Récupérer tous les utilisateurs avec find()
// =============================================================================
const get_all_users = async (req, res) => {
  try {
    // Récupération de tous les utilisateurs avec find()
    const allUsers = await users.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================================================
// READ - Récupérer un utilisateur par ID avec findById()
// =============================================================================
const get_user = async (req, res) => {
  try {
    // Recherche de l'utilisateur par ID avec findById()
    const foundUser = await users.findById(req.params.id);
    if (!foundUser)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.status(200).json(foundUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================================================
// UPDATE - Modifier un utilisateur avec findByIdAndUpdate()
// =============================================================================
const update_user = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mise à jour avec retour de l'objet modifié avec findByIdAndUpdate()
    const updatedUser = await users.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    
    if (!updatedUser)
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// =============================================================================
// DELETE - Désactiver un utilisateur avec findById() et save()
// =============================================================================
const delete_user = async (req, res, next) => {
  try {
    // Recherche de l'utilisateur avec findById()
    const foundUser = await users.findById(req.params.id);
    if (!foundUser) 
      return res.status(404).json({ message: "Utilisateur non trouvé." });

    // Désactivation au lieu de suppression définitive avec save()
    foundUser.isActive = false;
    await foundUser.save();

    res.status(200).json({
      message: `L'utilisateur avec l'ID ${req.params.id} a été désactivé.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =============================================================================
// READ - Récupérer tous les professeurs avec find()
// =============================================================================
const get_all_profs = async (req, res) => {
  try {
    // Récupération des utilisateurs qui sont professeurs avec find()
    const profs = await users.find({ role: "admin", isProf: true });
    res.status(200).json(profs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export des fonctions du contrôleur
module.exports = {
  register,
  sign,
  get_all_users,
  update_user,
  get_user,
  delete_user,
  get_all_profs,
  verifyEmail,
  forgotPassword,
  resetPassword,
};