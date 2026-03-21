import { Platform } from 'react-native';

const getBaseUrl = () => {
    // PRODUCTION: Render Cloud Hosting
    return 'https://readpro-backend.onrender.com';
};

const API_URL = `${getBaseUrl()}/api`;

export default API_URL;
