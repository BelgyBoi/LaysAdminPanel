
import axios from 'axios';

const url = 'https://laysapi-uyjc.onrender.com/api/v1/default/user/auth';

async function checkPath() {
    try {
        console.log(`Testing POST ${url}...`);
        // Sending dummy data to expect a 401 or 200 (if credentials worked)
        const response = await axios.post(url, {
            email: "admin@example.com",
            password: "wrong_password" 
        });
        console.log(`[SUCCESS] API responded with status ${response.status}`);
        console.log('Body:', response.data);
    } catch (error) {
        if (error.response) {
            console.log(`[Reachable] API responded with status ${error.response.status}`);
             console.log('Error Data:', error.response.data);
            if (error.response.status === 404) {
                 console.log("CRITICAL: 404 means the path is WRONG on the server.");
            }
        } else {
             console.log(`[ERROR] Network/Other error: ${error.message}`);
        }
    }
}

checkPath();
