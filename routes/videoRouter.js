import { Router } from "express";
import { validateVideoInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import {
  addVideo,
  deleteVideo,
  getAllVideo,
  getSingleVideo,
  updateVideos,
} from "../controllers/videoController.js";

const router = Router();
router.post("/addVideo", validateVideoInput, isAdmin, addVideo);
router.get("/getAllVideo", getAllVideo);
router.patch("/updateVideo/:id", validateVideoInput, isAdmin, updateVideos);
router.get("/getVideo/:id", getSingleVideo);
router.delete("/deleteVideo/:id", isAdmin, deleteVideo);
export default router;
