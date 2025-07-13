import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  registerBilliard,
  stripePayment
} from "../controllers/billiardController.js";

const billiardRouter = express.Router();

billiardRouter.post('/', protect, registerBilliard);
billiardRouter.post('/stripe-payment', protect, stripePayment);

export default billiardRouter;
