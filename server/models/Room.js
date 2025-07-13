import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
   billiard: {type: String, ref: "Billiard", required: true},
   roomType: {type: String, required: true},
   pricePerNight: {type: Number, required: true},
   amenities: {type: Object, required: true},
   images: { type: [String], required: true },
   isAvailable: { type: Boolean, default: true },

}, {timestamps: true}
);


const Room = mongoose.model("Room", roomSchema);

export default Room;