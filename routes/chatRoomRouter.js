import { Router } from "express";
import {
  addChatRoom,
  deleteChatRoom,
  getAllChatRoom,
  getChatRoomByCommunity,
  getChatRoomBySubCommunity,
  getSingleChatRoom,
  updateChatRoom,
} from "../controllers/chatRoomController.js";
import { isAdmin } from "../middleware/authenticationMiddleware.js";
import { validateChatRoomInput } from "../middleware/validationMiddleware.js";

const router = Router();

router.post("/addChatRoom", isAdmin, validateChatRoomInput, addChatRoom);
router.get("/getAllChatRoom", getAllChatRoom);
router.patch(
  "/updateAllChatRoom/:id",
  isAdmin,
  validateChatRoomInput,
  updateChatRoom
);
router.get("/getSingleChatRoom/:id", getSingleChatRoom);
router.delete("/deleteChatRoom/:id", isAdmin, deleteChatRoom);
router.get("/byCommunity", getChatRoomByCommunity);
router.get("/bySubCommunity", getChatRoomBySubCommunity);

export default router;
