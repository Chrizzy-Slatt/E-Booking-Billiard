import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { getUserData, storerecentSearchedCities, createOrGetUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get('/', protect, getUserData);
userRouter.post('/create-or-get', createOrGetUser);
userRouter.post('/store-recent-search', protect, storerecentSearchedCities);

export default userRouter;