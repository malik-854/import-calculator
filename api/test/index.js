export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    
    return res.status(200).json({ 
        status: 'API is working',
        timestamp: new Date().toISOString(),
        env: process.env.MONGODB_URI ? 'MongoDB URI is set' : 'MongoDB URI is missing'
    });
}