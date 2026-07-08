const { Router } = require("express");
const { body, param, query } = require("express-validator");
const propertyController = require("../controllers/propertyController");
const propertyImageController = require("../controllers/propertyImageController");
const { uploadPropertyImages } = require("../middleware/upload");
const validate = require("../middleware/validate");
const { verifyAuth, requireRole } = require("../middleware/authMiddleware");

const router = Router();

router.use(verifyAuth);

const idParam = param("id").isInt({ min: 1 }).withMessage("Invalid property id");

const listQueryValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("type").optional().isIn(["rent", "sale"]).withMessage("type must be 'rent' or 'sale'"),
  query("status")
    .optional()
    .isIn(["available", "sold", "rented"])
    .withMessage("status must be 'available', 'sold' or 'rented'"),
  query("min_price").optional().isFloat({ min: 0 }).withMessage("min_price must be a positive number"),
  query("max_price").optional().isFloat({ min: 0 }).withMessage("max_price must be a positive number"),
  query("client_id").optional().isInt({ min: 1 }).withMessage("client_id must be a positive integer"),
];

const propertyBodyValidators = [
  body("title").trim().isLength({ min: 3 }).withMessage("Title is required and must be at least 3 characters"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price is required and must be a number greater than 0"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("latitude")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage("latitude must be between -90 and 90"),
  body("longitude")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage("longitude must be between -180 and 180"),
  body("clientId")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("clientId must be a positive integer"),
  body("type").isIn(["rent", "sale"]).withMessage("Type must be 'rent' or 'sale'"),
  body("status")
    .optional()
    .isIn(["available", "sold", "rented"])
    .withMessage("Status must be 'available', 'sold' or 'rented'"),
];

router.get("/", listQueryValidators, validate, propertyController.list);
// Must be registered before "/:id" so "export" isn't matched as an :id value.
router.get("/export/csv", listQueryValidators, validate, propertyController.exportCsv);
router.get("/export/excel", listQueryValidators, validate, propertyController.exportExcel);
router.get("/counts", propertyController.getCounts);
router.get("/:id", idParam, validate, propertyController.getOne);
router.get("/:id/tax-bill", idParam, validate, propertyController.generateTaxBill);
router.post("/", requireRole("admin", "agent"), propertyBodyValidators, validate, propertyController.create);
router.put(
  "/:id",
  requireRole("admin", "agent"),
  [idParam, ...propertyBodyValidators],
  validate,
  propertyController.update
);
router.delete("/:id", requireRole("admin"), idParam, validate, propertyController.remove);

router.post(
  "/:id/images",
  requireRole("admin", "agent"),
  idParam,
  validate,
  uploadPropertyImages,
  propertyImageController.uploadImages
);
router.delete(
  "/:id/images/:imageId",
  requireRole("admin", "agent"),
  [idParam, param("imageId").isInt({ min: 1 }).withMessage("Invalid image id")],
  validate,
  propertyImageController.deleteImage
);

module.exports = router;
