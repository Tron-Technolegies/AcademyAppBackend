import { Router } from "express";
import { validateVideoInput } from "../middleware/validationMiddleware.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import {
  addVideo,
  deleteVideo,
  getAllVideo,
  getSingleVideo,
  getVideoByCourse,
  getVideoByModule,
  updateVideos,
} from "../controllers/videoController.js";

const router = Router();
router.post("/addVideo", validateVideoInput, isAdmin, addVideo);
router.get("/getAllVideo", getAllVideo);
router.patch("/updateVideo/:id", validateVideoInput, isAdmin, updateVideos);
router.get("/getVideo/:id", getSingleVideo);
router.delete("/deleteVideo/:id", isAdmin, deleteVideo);
router.get("/getVideoByCourse", getVideoByCourse);
router.get("/getVideoByModule", getVideoByModule);
export default router;
