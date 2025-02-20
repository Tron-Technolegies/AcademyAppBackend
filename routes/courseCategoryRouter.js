import { Router } from "express";
import {
  addCourseCategory,
  deleteCategory,
  getAllCategory,
  getSingleCategory,
  updateCategory,
} from "../controllers/courseCategoryController.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import { validateCategoryInput } from "../middleware/validationMiddleware.js";

const router = Router();
router.post("/addCategory", validateCategoryInput, isAdmin, addCourseCategory);
router.get("/getCategories", getAllCategory);
router.patch(
  "/updateCategory/:id",
  validateCategoryInput,
  isAdmin,
  updateCategory
);
router.get("/getCategories/:id", isAdmin, getSingleCategory);
router.delete("/deleteCategory/:id", isAdmin, deleteCategory);
export default router;
