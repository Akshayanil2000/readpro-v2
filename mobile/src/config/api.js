import { Platform } from 'react-native';

const getBaseUrl = () => {
    // PRODUCTION: Render Cloud Hosting
    return 'https://readpro-backend.onrender.com';

    /* 
    // LOCAL DEVELOPMENT OPTIONS:
    // 1. FOR PHYSICAL DEVICE (WiFi): CURRENT LOCAL IP = 192.168.0.117
    const PC_IP = '192.168.0.117'; 
    
    // 2. FOR ANDROID EMULATOR: Use 10.0.2.2
    // const PC_IP = '10.0.2.2';
    
    // 3. FOR WEB / iOS SIMULATOR: Use localhost
    // const PC_IP = 'localhost';

    return `http://${PC_IP}:5000`;
    */
};



const API_URL = `${getBaseUrl()}/api`;

export default API_URL;
