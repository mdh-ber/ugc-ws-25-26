const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificateController");

// GET /api/certificates - Get all certificates
router.get("/", certificateController.getAllCertificates);

// GET /api/certificates/:id - Get single certificate
router.get("/:id", certificateController.getCertificateById);

// POST /api/certificates - Create a new certificate
router.post("/", certificateController.createCertificate);

// PUT /api/certificates/:id - Update a certificate
router.put("/:id", certificateController.updateCertificate);

// DELETE /api/certificates/:id - Delete a certificate
router.delete("/:id", certificateController.deleteCertificate);

module.exports = router;
