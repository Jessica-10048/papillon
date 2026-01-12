const express = require('express');
const router = express.Router();

const UsersController = require('../controllers/user.controller');
const verifieToken = require('../middlewares/auth')

// ========================================
// ROUTES PUBLIQUES (pas d'authentification)
// ========================================

// Inscription - accessible à tous
router.post('/register', UsersController.register);

// Vérification email - accessible avec token dans URL
router.put("/verify/:token", UsersController.verifyEmail);

// Mot de passe oublié - accessible à tous
router.post('/forgot-password', UsersController.forgotPassword);

// Reset mot de passe - accessible avec token dans URL
router.post('/reset-password/:token', UsersController.resetPassword);

// Connexion - accessible à tous
router.post('/sign', UsersController.sign);

// ========================================
// ROUTES PROTÉGÉES (authentification requise)
// ========================================


// Lister tous les users - réservée aux admins/profs
router.get('/all', verifieToken, UsersController.get_all_users);

// Récupérer un user spécifique - protégée
router.get('/get/:id', verifieToken, UsersController.get_user);

// Modifier un user - protégée
router.put('/update/:id', verifieToken, UsersController.update_user);

// Supprimer un user - réservée aux admins
router.put('/delete/:id', verifieToken, UsersController.delete_user);

// Lister les professeurs - protégée (CORRIGÉ: GET au lieu de PUT)
router.get('/prof', verifieToken, UsersController.get_all_profs);

module.exports = router;