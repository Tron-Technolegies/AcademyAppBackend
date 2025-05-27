import { Router } from "express";
import { getUserStats } from "../controllers/adminController.js";

const router = Router();

router.get("/getUsers", getUserStats);

export default router;
