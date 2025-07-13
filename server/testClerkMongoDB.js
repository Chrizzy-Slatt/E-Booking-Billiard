import mongoose from "mongoose";
import User from "./models/Users.js";
import "dotenv/config";
import { createClerkClient } from '@clerk/backend';

const testClerkMongoDB = async () => {
    try {
        console.log("🔗 Testing Clerk-MongoDB Integration...\n");
        
        // 1. Test MongoDB Connection
        console.log("1️⃣ Testing MongoDB Connection...");
        await mongoose.connect(`${process.env.MONGODB_URI}/pocket-billiard`);
        console.log("✅ MongoDB connected successfully");
        
        // 2. Test Clerk Configuration
        console.log("\n2️⃣ Testing Clerk Configuration...");
        
        if (!process.env.CLERK_SECRET_KEY) {
            throw new Error("CLERK_SECRET_KEY not found in environment variables");
        }
        
        const clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        
        console.log("✅ Clerk client initialized successfully");
        
        // 3. Test Clerk API Connection
        console.log("\n3️⃣ Testing Clerk API Connection...");
        try {
            const userList = await clerkClient.users.getUserList({ limit: 1 });
            console.log("✅ Clerk API connection successful");
            console.log(`📊 Total users in Clerk: ${userList.totalCount}`);
            
            if (userList.data.length > 0) {
                const clerkUser = userList.data[0];
                console.log(`👤 Sample Clerk user: ${clerkUser.firstName} ${clerkUser.lastName} (${clerkUser.emailAddresses[0]?.emailAddress})`);
                
                // 4. Check if this user exists in MongoDB
                console.log("\n4️⃣ Checking user sync between Clerk and MongoDB...");
                const mongoUser = await User.findById(clerkUser.id);
                
                if (mongoUser) {
                    console.log("✅ User found in MongoDB:");
                    console.log(`   ID: ${mongoUser._id}`);
                    console.log(`   Email: ${mongoUser.email}`);
                    console.log(`   Username: ${mongoUser.username}`);
                } else {
                    console.log("❌ User NOT found in MongoDB");
                    console.log("This means webhook is not working properly");
                    
                    // Create user manually for testing
                    console.log("\n🔧 Creating user manually for testing...");
                    const userData = {
                        _id: clerkUser.id,
                        email: clerkUser.emailAddresses[0]?.emailAddress || "no-email",
                        username: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "No Name",
                        image: clerkUser.imageUrl || "",
                        recentSearchedCities: "",
                    };
                    
                    const newUser = await User.create(userData);
                    console.log("✅ User created manually:", newUser._id);
                }
            } else {
                console.log("ℹ️ No users found in Clerk");
            }
            
        } catch (clerkError) {
            console.log("❌ Clerk API error:", clerkError.message);
        }
        
        // 5. Check MongoDB Users
        console.log("\n5️⃣ Current MongoDB Users...");
        const allUsers = await User.find({}).select('_id email username role');
        console.log(`📊 Total users in MongoDB: ${allUsers.length}`);
        
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
        });
        
        // 6. Webhook Configuration Check
        console.log("\n6️⃣ Webhook Configuration Check...");
        console.log("Webhook Secret:", process.env.CLERK_WEBHOOK_SECRET ? "✅ Set" : "❌ Missing");
        console.log("Webhook URL should be: http://localhost:3000/api/clerk");
        console.log("Required events: user.created, user.updated, user.deleted");
        
        console.log("\n🎉 Integration test completed!");
        
    } catch (error) {
        console.log("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Database disconnected");
    }
};

testClerkMongoDB();
