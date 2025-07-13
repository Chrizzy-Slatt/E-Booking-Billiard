import mongoose from "mongoose";
import User from "./models/Users.js";
import "dotenv/config";

const createTestUser = async () => {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(`${process.env.MONGODB_URI}/pocket-billiard`);
        console.log("✅ Database connected successfully");
        
        // Create a test user manually to simulate what webhook should do
        const testUserData = {
            _id: "user_test_" + Date.now(),
            email: "testuser@example.com",
            username: "Test User",
            image: "https://images.clerk.dev/default-avatar.png",
            role: "user",
            recentSearchedCities: "",
            language: "en"
        };
        
        console.log("👤 Creating test user...");
        const newUser = await User.create(testUserData);
        console.log("✅ Test user created successfully:");
        console.log("   ID:", newUser._id);
        console.log("   Email:", newUser.email);
        console.log("   Username:", newUser.username);
        console.log("   Role:", newUser.role);
        
        // Check total users now
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);
        
        // List all users
        const allUsers = await User.find({}).select('_id email username role');
        console.log("\n👥 All users in database:");
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
        });
        
    } catch (error) {
        console.log("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Database disconnected");
    }
};

createTestUser();
