import mongoose from "mongoose";
import User from "./models/Users.js";
import "dotenv/config";
import { createClerkClient } from '@clerk/backend';
import fetch from 'node-fetch';

const verifySetup = async () => {
    console.log("🔍 Verifying Clerk-MongoDB Setup...\n");
    
    let allChecks = [];
    
    try {
        // 1. Check Environment Variables
        console.log("1️⃣ Checking Environment Variables...");
        const envChecks = [
            { name: "MONGODB_URI", value: process.env.MONGODB_URI },
            { name: "CLERK_SECRET_KEY", value: process.env.CLERK_SECRET_KEY },
            { name: "CLERK_PUBLISHABLE_KEY", value: process.env.CLERK_PUBLISHABLE_KEY },
            { name: "CLERK_WEBHOOK_SECRET", value: process.env.CLERK_WEBHOOK_SECRET }
        ];
        
        envChecks.forEach(check => {
            const status = check.value ? "✅" : "❌";
            console.log(`   ${status} ${check.name}: ${check.value ? "Set" : "Missing"}`);
            allChecks.push({ name: check.name, passed: !!check.value });
        });
        
        // 2. Check MongoDB Connection
        console.log("\n2️⃣ Checking MongoDB Connection...");
        try {
            await mongoose.connect(`${process.env.MONGODB_URI}/pocket-billiard`);
            console.log("   ✅ MongoDB connection successful");
            allChecks.push({ name: "MongoDB Connection", passed: true });
            
            // Test user model
            const userCount = await User.countDocuments();
            console.log(`   📊 Current users in database: ${userCount}`);
            
        } catch (mongoError) {
            console.log("   ❌ MongoDB connection failed:", mongoError.message);
            allChecks.push({ name: "MongoDB Connection", passed: false });
        }
        
        // 3. Check Clerk API
        console.log("\n3️⃣ Checking Clerk API...");
        try {
            const clerkClient = createClerkClient({
                secretKey: process.env.CLERK_SECRET_KEY,
            });
            
            const userList = await clerkClient.users.getUserList({ limit: 1 });
            console.log("   ✅ Clerk API connection successful");
            console.log(`   📊 Total users in Clerk: ${userList.totalCount}`);
            allChecks.push({ name: "Clerk API", passed: true });
            
        } catch (clerkError) {
            console.log("   ❌ Clerk API connection failed:", clerkError.message);
            allChecks.push({ name: "Clerk API", passed: false });
        }
        
        // 4. Check Server Status
        console.log("\n4️⃣ Checking Server Status...");
        try {
            const response = await fetch('http://localhost:3000/', {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                const text = await response.text();
                console.log("   ✅ Server is running:", text);
                allChecks.push({ name: "Server Running", passed: true });
                
                // Check webhook endpoint
                try {
                    const webhookResponse = await fetch('http://localhost:3000/api/clerk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'test' })
                    });
                    console.log(`   ✅ Webhook endpoint accessible (status: ${webhookResponse.status})`);
                    allChecks.push({ name: "Webhook Endpoint", passed: true });
                    
                } catch (webhookError) {
                    console.log("   ❌ Webhook endpoint error:", webhookError.message);
                    allChecks.push({ name: "Webhook Endpoint", passed: false });
                }
                
            } else {
                console.log("   ❌ Server not responding properly");
                allChecks.push({ name: "Server Running", passed: false });
            }
            
        } catch (serverError) {
            console.log("   ❌ Server not running. Start with: npm start");
            allChecks.push({ name: "Server Running", passed: false });
        }
        
        // 5. Summary
        console.log("\n📋 SETUP SUMMARY");
        console.log("=".repeat(50));
        
        const passedChecks = allChecks.filter(check => check.passed).length;
        const totalChecks = allChecks.length;
        
        allChecks.forEach(check => {
            const status = check.passed ? "✅" : "❌";
            console.log(`${status} ${check.name}`);
        });
        
        console.log(`\n📊 Score: ${passedChecks}/${totalChecks} checks passed`);
        
        if (passedChecks === totalChecks) {
            console.log("\n🎉 ALL CHECKS PASSED!");
            console.log("Your Clerk-MongoDB integration is ready!");
            console.log("\nNext steps:");
            console.log("1. Configure webhook in Clerk dashboard");
            console.log("2. Register new users through frontend");
            console.log("3. Monitor with: node monitorUsers.js");
        } else {
            console.log("\n⚠️ Some checks failed. Please fix the issues above.");
        }
        
    } catch (error) {
        console.log("❌ Verification error:", error.message);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
};

verifySetup();
