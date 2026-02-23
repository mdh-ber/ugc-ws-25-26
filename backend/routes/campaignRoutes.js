const router = require("express").Router();
const ctrl = require("../controllers/campaignController");

router.post("/", ctrl.createCampaign);
router.get("/", ctrl.getCampaigns);
router.get("/:id", ctrl.getCampaignById);
router.put("/:id", ctrl.updateCampaign);
router.delete("/:id", ctrl.archiveCampaign);

module.exports = router;