import Billiard from "../models/Billiard.js";
import { v2 as cloudinary } from "cloudinary"
import Room from "../models/Room.js";

// API to create a new room for a billiard
export const  createRoom = async (req, res) =>{
    try {
        const {roomType, pricePerNight, amenities} = req.body;
        const billiardData = await Billiard.findOne({owner: req.user._id})

        if(!billiardData) return res.json({ success : false, message: "No Billiard found"});

        // upload images to cloudinary
        const uploadImages = req.files.map(async (file) =>{
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        })
        //wait for all upload to complete
        const images = await Promise.all(uploadImages)

        await Room.create({
            billiard: billiardData._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images,
        })
        res.json({ success: true, message: "Room created successfully"})
    } catch (error) {
        console.error('Create room error:', error);
        res.json({ success: false, message: error.message})
    }
}


// API to get all rooms
export const  getRooms = async (req, res) =>{
    try {
       const rooms = await Room.find({isAvailable: true}).populate({
        path: 'billiard',
        populate:{
            path: 'owner',
            select: 'image'
        }
       }).sort({createdAt: -1 })
       res.json({success: true, rooms});
    } catch (error) {
       res.json({success: false, message: error.message});
    }
}

// API to get all rooms a specific billiard
export const  getOwnerRooms = async (req, res) =>{
    try {
        const billiardData = await Billiard.findOne({owner: req.user._id})
        if(!billiardData) return res.json({success: false, message: "No billiard found"})
        const rooms = await Room.find({billiard: billiardData._id.toString()}).populate("billiard");
        res.json({success: true, rooms});
    } catch (error) {
        console.error('Error in getOwnerRooms:', error);
        res.json({success: false, message: error.message});
    }
}


// API to toggle availability of a room
export const  toggleRoomAvailability = async (req, res) =>{
    try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success : true, message: "Room availability updated"})
    } catch (error) {
        res.json({ success : false, message: error.message})
    }
}
