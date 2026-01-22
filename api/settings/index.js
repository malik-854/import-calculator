const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

export default async function handler(req, res) {
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
        const client = await MongoClient.connect(MONGODB_URI);
        const db = client.db('import_calculator');
        
        // Ensure collections exist
        try {
            await db.createCollection('settings');
        } catch (e) {
            // Collection already exists, ignore
        }
        
        if (req.method === 'POST') {
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
            
            await client.close();
            return res.status(200).json({ success: true, message: 'Saved to cloud' });
            
        } else if (req.method === 'GET') {
            const { deviceId, hsCode } = req.query;
            
            const data = await db.collection('settings').findOne(
                { deviceId, hsCode }
            );
            
            await client.close();
            return res.status(200).json({ 
                success: true, 
                settings: data ? data.settings : null 
            });
        }
        
        await client.close();
        return res.status(405).json({ error: 'Method not allowed' });
        
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            success: false,
            error: 'Database error',
            message: error.message 
        });
    }
}