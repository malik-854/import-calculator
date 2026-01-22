const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('import_calculator');
    cachedDb = db;
    return db;
}

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        const db = await connectToDatabase();
        
        if (req.method === 'POST') {
            // Save settings
            const { deviceId, hsCode, settings } = req.body;
            
            await db.collection('settings').updateOne(
                { deviceId, hsCode },
                { 
                    $set: { 
                        deviceId, 
                        hsCode, 
                        settings,
                        updatedAt: new Date() 
                    } 
                },
                { upsert: true }
            );
            
            return res.json({ success: true });
            
        } else if (req.method === 'GET') {
            // Load settings
            const { deviceId, hsCode } = req.query;
            
            const data = await db.collection('settings').findOne(
                { deviceId, hsCode }
            );
            
            return res.json({ 
                success: true, 
                settings: data ? data.settings : null 
            });
        }
        
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message });
    }
};