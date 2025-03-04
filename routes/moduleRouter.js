import { Router } from "express";
import { validateModuleInput } from "../middleware/validationMiddleware.js";
import {
  addModule,
  deleteModule,
  getAllModule,
  getModuleByCourse,
  getSingleModule,
  updateModule,
} from "../controllers/moduleController.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";

const router = Router();
router.post("/addModule", validateModuleInput, isAdmin, addModule);
router.get("/getModule", getAllModule);
router.patch("/updateModule/:id", validateModuleInput, isAdmin, updateModule);
router.get("/getModule/:id", getSingleModule);
router.delete("/deleteModule/:id", isAdmin, deleteModule);
router.get("/getModuleByCourse", getModuleByCourse); //here we are taken id from(req.body) not from params that's why we are not passing id here, instead we are passing on the body
export default router;
