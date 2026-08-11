import { Router } from "express";
import { validateClassInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import {
  addClass,
  deleteClass,
  endClassSession,
  getAllClass,
  getSingleClass,
  joinClassSession,
  startClassSession,
  updateClass,
} from "../controllers/classController.js";

const router = Router();
router.post("/addClass", validateClassInput, isAdmin, addClass);
router.get("/getAllClass", getAllClass);
router.patch("/updateClass/:id", validateClassInput, isAdmin, updateClass);
router.get("/getAllClass/:id", getSingleClass);
router.delete("/deleteClass/:id", isAdmin, deleteClass);
router.post("/startClass/:id", startClassSession);
router.post("/endClass/:id", endClassSession);
router.post("/joinClass/:id", joinClassSession);

export default router;
