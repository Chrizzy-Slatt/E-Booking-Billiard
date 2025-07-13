import mongoose from "mongoose";
import User from "./models/Users.js";
import "dotenv/config";

const testDatabase = async () => {
    try {
        console.log("Connecting to MongoDB...");
        console.log("MongoDB URI:", process.env.MONGODB_URI);
        
        await mongoose.connect(`${process.env.MONGODB_URI}/pocket-billiard`);
        console.log("✅ Database connected successfully");
        
        // Test user count
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);
        
        // Get all users
        const users = await User.find({}).limit(10);
        console.log("👥 Users found:");
        users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user._id}, Email: ${user.email}, Username: ${user.username}`);
        });
        
        if (userCount === 0) {
            console.log("\n❌ No users found in database!");
            console.log("Possible causes:");
            console.log("1. Clerk webhook not configured properly");
            console.log("2. No users have registered yet");
            console.log("3. Webhook endpoint not receiving requests");
            console.log("4. Error in webhook processing");
        }
        
        // Test creating a sample user
        console.log("\n🧪 Testing user creation...");
        const testUser = {
            _id: "test_user_" + Date.now(),
            email: "test@example.com",
            username: "Test User",
            image: "https://example.com/image.jpg",
            recentSearchedCities: ""
        };
        
        try {
            const createdUser = await User.create(testUser);
            console.log("✅ Test user created successfully:", createdUser._id);
            
            // Clean up test user
            await User.findByIdAndDelete(testUser._id);
            console.log("🧹 Test user cleaned up");
        } catch (createError) {
            console.log("❌ Error creating test user:", createError.message);
        }
        
    } catch (error) {
        console.log("❌ Database connection error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Database disconnected");
    }
};

testDatabase();
