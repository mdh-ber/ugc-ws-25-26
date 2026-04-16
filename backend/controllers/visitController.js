const crypto = require('crypto');
const Visit = require('../models/visit');

exports.trackVisit = async (req, res) => {
    try {
        // 1. called when user visits the site, get client IP
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // 2. create hash of IP for privacy
        const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex');

        // 3. save to DB
        await Visit.create({ 
            ipHash, 
            userAgent: req.get('User-Agent') 
        });

        res.status(200).json({ message: "Tracked successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const totalVisits = await Visit.countDocuments();
        const uniqueVisits = await Visit.distinct('ipHash');
        
        // calculate daily stats (Over time)
        const dailyStats = await Visit.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 },
                    unique: { $addToSet: "$ipHash" }
                }
            },
            { $addFields: { unique: { $size: "$unique" } } },
            { $sort: { "_id": 1 } }
        ]);

        res.json({ totalVisits, uniqueVisits: uniqueVisits.length, dailyStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};