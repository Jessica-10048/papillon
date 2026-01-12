// models/user.model.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // Champs pour la vérification email
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Champ pour désactiver un compte
    isActive: {
      type: Boolean,
      default: true,
    },

    // Champs pour le reset de mot de passe
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },

    // Acceptation des CGU
    acceptCGU: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("User", UserSchema);