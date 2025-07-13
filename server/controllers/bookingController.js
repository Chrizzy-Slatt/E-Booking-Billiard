    import { Form } from "react-router-dom";
// bookingController.js
    import transporter from "../configs/nodemailer.js"; // ✅
    import Billiard from "../models/Billiard.js";
    import Booking from "../models/Booking.js";
    import Room from "../models/Room.js";
    import User from "../models/Users.js";

    // Fungtion to Check Availability of Room
    const checkAvailability = async ({ checkInDate, checkOutDate, room })=>{
        try {
            const bookings = await Booking.find({
                room,
                checkInDate: {$lte: checkOutDate},
                checkOutDate: {$gte: checkInDate},
            })
            const isAvailable = bookings.length === 0;
            return isAvailable;
        } catch (error) {
            console.error(error.message);
        }
    }

    // API to Check Availability of Room
    // POST /api/bookings/check-availability
    export const  checkAvailabilityAPI = async ( req, res) =>{
        try {
            const { room, checkInDate, checkOutDate } = req.body;
            const isAvailable = await checkAvailability({checkInDate, checkOutDate, room});
            res.json({success: true, isAvailable})
        } catch (error) {
            res.json({success: false, message: error.message})
        }
    }

    //API to create a new booking
    // POST /api/booking/book

    export const  createBooking= async ( req, res) =>{
        try {
            const { room, checkInDate, checkOutDate, guests } = req.body;
            const user = req.user._id;


            // before check booking availability
            const isAvailable = await checkAvailability({
                checkInDate,
                checkOutDate,
                room
            });
            if(!isAvailable){
                return res.json({success: false, message: "Room is not availability"})
            }

        //get total price for room
        const roomData = await Room.findById(room).populate("billiard")

        // let totalPrice = roomData.pricePerNight;
        // // calculate totalprice based on night
        // const checkIn = new Date(checkInDate)
        // const checkOut = new Date(checkOutDate)
        // const timeDiff = checkOut.getTime() - checkIn.getTime();
        // const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // totalPrice *=nights;

        let totalPrice = roomData.pricePerHour || roomData.pricePerNight; // fallback
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Get difference in hours
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const hours = Math.ceil(timeDiff / (1000 * 60 * 60)); // in hours

        totalPrice *= hours;

        const newBooking = await Booking.create({
            user,
            room,
            billiard: roomData.billiard._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: req.user.email,
            subject: 'Billiard Booking Details',
            html: `
            <h2>Your Billiard Booking Details</h2>
            <p>Dear ${req.user.username},</p>
            <p>Thank You for your booking! Here are your details:</p>
            <ul>
                <li><strong>Booking ID: </strong> ${newBooking._id}</li>
                <li><strong>Billiard Name: </strong> ${roomData.billiard.name}</li>
                <li><strong>Location: </strong> ${roomData.billiard.address}</li>
                <li><strong>Date: </strong> ${newBooking.checkInDate.toLocaleString()}
                </li>
                <li><strong>Booking Amount: </strong> ${process.env.CURRENCY ||
                'Rp.'} ${newBooking.totalPrice.toLocaleString()} </li>
            </ul>
            <p>We look forward to Welcoming You!</p>
            <p>If you need to make any changes, feel free to contact us.</p>
            <p>Best regards,</p>
            <p>Pocket Billiard Team</p>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({success: true, message: "Booking create Succsessfully"})
        } catch (error) {
        console.log(error);
        res.json({success: false, message: "failed to create booking "})
        }
    };

    //API to get all booking for a user

    //GET /api/bookkings/user

    export const getUserBookings = async ( req, res) =>{
        try {
            const user = req.user._id;
            const bookings = await Booking.find({user}).populate("room billiard").sort({createdAt: -1})
            res.json({success: true, bookings})
        } catch (error) {
            res.json({success: false, message: "failed to fetch bookings"});
        }
    }

    export const getBilliardBookings = async ( req, res) =>{

        try {
            const billiard = await Billiard.findOne({owner: req.user._id});
            if (!billiard){
                return res.json({success: false, message: "No Billiard found"});
            }
            const bookings = await Booking.find({billiard: billiard._id}).populate("room billiard user").sort({ createdAt: -1});

        //total bookings
        const totalBookings = bookings.length;
        //total Revenue
        const totalRevenue = bookings.reduce((acc, booking)=>acc + booking.totalPrice, 0)

        res.json({success: true, dashboardData: {totalBookings, totalRevenue, bookings}})
        } catch (error) {
            res.json({success: false, message: "failed to fetch bookings"})
        }
    }