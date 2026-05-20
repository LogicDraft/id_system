const { authenticator } = require('./backend/node_modules/otplib');

authenticator.options = { step: 30, window: 1 };
const USN = '1AY25AI037';
const SECRET = 'GZXQAYTLI5TEGVKU';

async function test() {
    try {
        console.log("Generating token for secret:", SECRET);
        const token = authenticator.generate(SECRET);
        console.log("Token generated:", token);

        console.log(`Sending POST request to http://localhost:5000/api/verify with { usn: '${USN}', token: '${token}' }`);
        const response = await fetch('http://localhost:5000/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usn: USN, token: token })
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", data);
        
        if (response.ok) {
            console.log("✅ TEST PASSED");
            process.exit(0);
        } else {
            console.log("❌ TEST FAILED");
            process.exit(1);
        }
    } catch (err) {
        console.error("❌ TEST FAILED");
        console.error(err.message);
        process.exit(1);
    }
}

test();
