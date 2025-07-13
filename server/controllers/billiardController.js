import Billiard from "../models/Billiard.js";
import User from "../models/Users.js";
import stripe from "stripe";

export const registerBilliard = async (req, res) =>{
    try {
        const {name, address, contact, city} = req.body;
        const owner = req.user._id

        //check if user already registered
        const existingBilliard = await Billiard.findOne({owner})
        if(existingBilliard){
            return res.json({ success : false, message: "You already have a registered billiard. You can access your dashboard to manage it." })
        }

        await Billiard.create({name, address, contact, city, owner});

        await User.findByIdAndUpdate(owner, {role: "billiardOwner"});

        res.json({success : true, message : "billiard registered successfully"})

    } catch (error) {
        console.error('Billiard registration error:', error);
        res.json({success : false, message : error.message})
    }
}

// Get user's billiard info
export const getUserBilliard = async (req, res) => {
    try {
        const owner = req.user._id;
        const billiard = await Billiard.findOne({owner});

        if(billiard) {
            res.json({success: true, billiard, hasRegistered: true});
        } else {
            res.json({success: true, billiard: null, hasRegistered: false});
        }
    } catch (error) {
        console.error('Get billiard error:', error);
        res.json({success: false, message: error.message});
    }
}

// Delete user's billiard (for testing purposes)
export const deleteBilliard = async (req, res) => {
    try {
        const owner = req.user._id;

        // Delete billiard
        await Billiard.findOneAndDelete({owner});

        // Reset user role
        await User.findByIdAndUpdate(owner, {role: "user"});

        res.json({success: true, message: "Billiard registration deleted successfully"});
    } catch (error) {
        console.error('Delete billiard error:', error);
        res.json({success: false, message: error.message});
    }
} 

export const stripePayment = async (req, res)=>{

    try {
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        const roomData = await Room.findById(booking.room).populate('billiard');
        const totalPrice = booking.totalPrice;
        const { origin } = req.headers;

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

        const line_items = [
            {
                price_data:{
                    currency: "rp",
                    product_data:{
                        name: roomData.hotel.name,
                    },
                    unit_amount: totalPrice * 100
                },
                quantity: 1,
            }
        ]
        // Create Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `Rp{origin}/loader/my-bookings`,
            cancel_url: `Rp{origin}my-bookings`, 
            metadata:{
                bookingId,
            }
        })
        res.json({success: true, url: session.url})

    } catch (error) {
        res.json({success: false, message: "Payment Failed"})
    }
}