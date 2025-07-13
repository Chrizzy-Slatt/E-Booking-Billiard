import { Message } from "svix/dist/api/message.js";
import User from "../models/Users.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res)=>{
    try {
        // Create s svix instance with clerk webhook secret.
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)

        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // verifying headers
        await whook.verify(JSON.stringify(req.body), headers)

        // getting data from request body
        const {data, type} = req.body

        // Validate required data
        if (!data || !data.id) {
            throw new Error("Invalid webhook data: missing user ID");
        }

        if (!data.email_addresses || data.email_addresses.length === 0) {
            throw new Error("Invalid webhook data: missing email address");
        }

        const userData = {
            _id: data.id,
            email: data.email_addresses[0].email_address,
            username: (data.first_name || "") + " " + (data.last_name || ""),
            image: data.image_url || "",
            recentSearchedCities: "", // Default empty string for required field
        }

        // Switch case for different Events
        console.log(`Webhook received: ${type} for user ${data.id}`);

        switch (type) {
            case "user.created":{
                console.log("Creating new user:", userData);
                const newUser = await User.create(userData);
                console.log("User created successfully:", newUser._id);
                break;
            }

            case "user.updated":{
                console.log("Updating user:", data.id);
                const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
                console.log("User updated successfully:", updatedUser?._id);
                break;
            }

            case "user.deleted":{
                console.log("Deleting user:", data.id);
                const deletedUser = await User.findByIdAndDelete(data.id);
                console.log("User deleted successfully:", deletedUser?._id);
                break;
            }
            default:
                console.log("Unhandled webhook type:", type);
                break;
        }
        res.json({success:true, message: "Webhook Recieved"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export default clerkWebhooks;