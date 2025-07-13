import express from "express"
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRouters.js";
import billiardRouter from "./routes/billiardRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import paymentRouter from "./routes/midtransRoutes.js";

connectDB()
connectCloudinary();

const app = express()
app.use(cors()) // Enable cross-origin resource sharing

//Middleware
app.use(express.json())
app.use(clerkMiddleware())

//API to listen to clerk Webhooks
app.use("/api/clerk", clerkWebhooks)
app.use("/api/midtrans", paymentRouter)

app.get('/', (req, res)=> res.send("API berhasil terkoneksi"))
app.use('/api/users', userRouter)
app.use('/api/billiard', billiardRouter)
app.use('/api/room', roomRouter)
app.use('/api/bookings', bookingRouter)

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> console.log(`Server berjalan di port ${PORT}`));