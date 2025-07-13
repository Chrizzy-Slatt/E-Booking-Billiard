import express from "express";
import { midtransCallback, getPaymentToken } from "../controllers/midtransController.js";
import { protect } from "../middleware/authMiddleware.js";

const paymentRouter = express.Router();

paymentRouter.post('', midtransCallback);
paymentRouter.post('/get-payment-token', protect, getPaymentToken);

export default paymentRouter;