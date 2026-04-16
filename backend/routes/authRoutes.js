const router = require("express").Router();
const ctrl = require("../controllers/authController");

// REGISTER
router.post("/register", ctrl.register);

// LOGIN
router.post("/login", ctrl.login);

module.exports = router;