const { Router } = require("express");
const { body, param, query } = require("express-validator");
const clientController = require("../controllers/clientController");
const validate = require("../middleware/validate");
const { verifyAuth, requireRole } = require("../middleware/authMiddleware");

const router = Router();

router.use(verifyAuth);

const idParam = param("id").isInt({ min: 1 }).withMessage("Invalid client id");

const listQueryValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];

const clientBodyValidators = [
  body("fullName").trim().isLength({ min: 2 }).withMessage("Full name is required and must be at least 2 characters"),
  body("phone").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 30 }).withMessage("Phone is too long"),
  body("email").optional({ nullable: true, checkFalsy: true }).trim().isEmail().withMessage("A valid email is required"),
  body("address").optional({ nullable: true, checkFalsy: true }).trim().isLength({ max: 255 }).withMessage("Address is too long"),
  body("notes").optional({ nullable: true, checkFalsy: true }).trim(),
];

router.get("/", listQueryValidators, validate, clientController.list);
router.get("/:id", idParam, validate, clientController.getOne);
router.post("/", requireRole("admin", "agent"), clientBodyValidators, validate, clientController.create);
router.put("/:id", requireRole("admin", "agent"), [idParam, ...clientBodyValidators], validate, clientController.update);
router.delete("/:id", requireRole("admin"), idParam, validate, clientController.remove);

module.exports = router;
