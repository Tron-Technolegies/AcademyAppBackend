import { Router } from "express";
import { authenticateUser } from "../middleware/authenticationMiddleware.js";
import { addUserDetails } from "../controllers/userController.js";
import { validateUserDetailInput } from "../middleware/validationMiddleware.js";

const router = Router();
router.post(
  "/addDetails",
  validateUserDetailInput,
  authenticateUser,
  addUserDetails
);
export default router;
