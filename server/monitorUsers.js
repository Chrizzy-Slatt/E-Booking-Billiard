import mongoose from "mongoose";
import User from "./models/Users.js";
import "dotenv/config";
import { createClerkClient } from '@clerk/backend';

const monitorUsers = async () => {
    try {
        console.log("👀 Monitoring Clerk-MongoDB User Sync...\n");
        
        // Connect to MongoDB
        await mongoose.connect(`${process.env.MONGODB_URI}/pocket-billiard`);
        
        // Initialize Clerk client
        const clerkClient = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        
        // Get users from both sources
        const [clerkUsers, mongoUsers] = await Promise.all([
            clerkClient.users.getUserList({ limit: 50 }),
            User.find({}).select('_id email username createdAt')
        ]);
        
        console.log("📊 USER COMPARISON");
        console.log("=".repeat(50));
        console.log(`Clerk Users: ${clerkUsers.totalCount}`);
        console.log(`MongoDB Users: ${mongoUsers.length}`);
        console.log("");
        
        // Show Clerk users
        console.log("👥 CLERK USERS:");
        if (clerkUsers.data.length === 0) {
            console.log("   No users found in Clerk");
        } else {
            clerkUsers.data.forEach((user, index) => {
                const email = user.emailAddresses[0]?.emailAddress || "No email";
                const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "No name";
                console.log(`   ${index + 1}. ${name} (${email}) - ID: ${user.id}`);
            });
        }
        
        console.log("");
        
        // Show MongoDB users
        console.log("🗄️ MONGODB USERS:");
        if (mongoUsers.length === 0) {
            console.log("   No users found in MongoDB");
        } else {
            mongoUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (${user.email}) - ID: ${user._id}`);
            });
        }
        
        console.log("");
        
        // Check sync status
        console.log("🔄 SYNC STATUS:");
        const clerkUserIds = clerkUsers.data.map(u => u.id);
        const mongoUserIds = mongoUsers.map(u => u._id);
        
        // Users in Clerk but not in MongoDB
        const missingInMongo = clerkUserIds.filter(id => !mongoUserIds.includes(id));
        if (missingInMongo.length > 0) {
            console.log("❌ Users in Clerk but NOT in MongoDB:");
            missingInMongo.forEach(id => {
                const clerkUser = clerkUsers.data.find(u => u.id === id);
                const email = clerkUser.emailAddresses[0]?.emailAddress || "No email";
                console.log(`   - ${id} (${email})`);
            });
        }
        
        // Users in MongoDB but not in Clerk
        const missingInClerk = mongoUserIds.filter(id => !clerkUserIds.includes(id));
        if (missingInClerk.length > 0) {
            console.log("⚠️ Users in MongoDB but NOT in Clerk:");
            missingInClerk.forEach(id => {
                const mongoUser = mongoUsers.find(u => u._id === id);
                console.log(`   - ${id} (${mongoUser.email})`);
            });
        }
        
        if (missingInMongo.length === 0 && missingInClerk.length === 0) {
            console.log("✅ All users are synced between Clerk and MongoDB!");
        }
        
        console.log("");
        console.log("💡 TIPS:");
        console.log("- If users are missing in MongoDB, check webhook configuration");
        console.log("- If users are missing in Clerk, they might be test users");
        console.log("- Run this script after registering new users to verify sync");
        
    } catch (error) {
        console.log("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

// Run monitoring
monitorUsers();

// Optional: Run monitoring every 30 seconds
// setInterval(monitorUsers, 30000);
