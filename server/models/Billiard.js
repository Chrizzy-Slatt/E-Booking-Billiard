import mongoose from "mongoose";

const billiardSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contact: { type: String, required: true },
    owner: { type: String, required: true, ref: "User" },
    city: { type: String, required: true },
}, {timestamps: true});


const Billiard = mongoose.model("Billiard", billiardSchema);

export default Billiard;