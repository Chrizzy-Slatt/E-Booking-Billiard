import fetch from 'node-fetch';

const testWebhook = async () => {
    try {
        console.log("🧪 Testing webhook endpoint...");
        
        // Test if server is running
        const response = await fetch('http://localhost:3000/', {
            method: 'GET'
        });
        
        if (response.ok) {
            const text = await response.text();
            console.log("✅ Server is running:", text);
        } else {
            console.log("❌ Server not responding. Status:", response.status);
            console.log("Make sure to start the server with: npm start or node server.js");
            return;
        }
        
        // Test webhook endpoint (this will fail without proper headers, but we can see if endpoint exists)
        try {
            const webhookResponse = await fetch('http://localhost:3000/api/clerk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'test',
                    data: { id: 'test' }
                })
            });
            
            console.log("📡 Webhook endpoint status:", webhookResponse.status);
            
        } catch (webhookError) {
            console.log("❌ Webhook endpoint error:", webhookError.message);
        }
        
    } catch (error) {
        console.log("❌ Error testing server:", error.message);
        console.log("Make sure the server is running on port 3000");
    }
};

testWebhook();
