import User from "../models/Users.js";

// Middleware to check if user is authenticated
export const protect = async (req, res, next)=>{
    try {
        const {userId} = req.auth;

        if(!userId){
            return res.json({success: false, message: "not authenticated"});
        }

        const user = await User.findById(userId);

        if(!user){
            return res.json({success: false, message: "user not found in database"});
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("Auth middleware error:", error.message);
        return res.json({success: false, message: "authentication error"});
    }
}