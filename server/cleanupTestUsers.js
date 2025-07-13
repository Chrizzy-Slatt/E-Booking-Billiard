import mongoose from "mongoose";
import User from "./models/Users.js";
import "dotenv/config";

const cleanupTestUsers = async () => {
    try {
        console.log("🧹 Cleaning up test users...\n");
        
        await mongoose.connect(`${process.env.MONGODB_URI}/pocket-billiard`);
        console.log("✅ Connected to MongoDB");
        
        // Find test users (users with test in ID or email)
        const testUsers = await User.find({
            $or: [
                { _id: /test/i },
                { email: /test/i },
                { username: /test/i }
            ]
        });
        
        console.log(`📊 Found ${testUsers.length} test users:`);
        
        if (testUsers.length > 0) {
            testUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (${user.email}) - ID: ${user._id}`);
            });
            
            console.log("\n🗑️ Deleting test users...");
            
            const deleteResult = await User.deleteMany({
                $or: [
                    { _id: /test/i },
                    { email: /test/i },
                    { username: /test/i }
                ]
            });
            
            console.log(`✅ Deleted ${deleteResult.deletedCount} test users`);
        } else {
            console.log("   No test users found");
        }
        
        // Show remaining users
        const remainingUsers = await User.find({});
        console.log(`\n📊 Remaining users in database: ${remainingUsers.length}`);
        
        if (remainingUsers.length > 0) {
            console.log("👥 Remaining users:");
            remainingUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}`);
            });
        }
        
        console.log("\n✨ Database is now ready for real users!");
        console.log("Next steps:");
        console.log("1. Make sure webhook is configured in Clerk dashboard");
        console.log("2. Start the server: npm start");
        console.log("3. Register new users through the frontend");
        console.log("4. Monitor with: node monitorUsers.js");
        
    } catch (error) {
        console.log("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Database disconnected");
    }
};

cleanupTestUsers();
