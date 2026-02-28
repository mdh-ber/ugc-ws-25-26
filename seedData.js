
const mongoose = require('mongoose');
require('dotenv').config();  // Remove the path, just use .env from root

const Hashtag = require('./models/Hashtag');  // Change from '../models/Hashtag' to './models/Hashtag'
const Caption = require('./models/Caption'); 
// ... rest of the code remains the same

const seedHashtags = [
    { tag: '#photography', category: 'general', popularity: 95, usageCount: 1000, relatedTags: ['#photo', '#pictures'] },
    { tag: '#travel', category: 'general', popularity: 90, usageCount: 950, relatedTags: ['#wanderlust', '#adventure'] },
    { tag: '#fashion', category: 'trending', popularity: 98, usageCount: 1200, relatedTags: ['#style', '#outfit'] },
    { tag: '#foodie', category: 'niche', popularity: 85, usageCount: 800, relatedTags: ['#food', '#cooking'] },
    { tag: '#fitness', category: 'trending', popularity: 92, usageCount: 1100, relatedTags: ['#gym', '#workout'] },
    { tag: '#tech', category: 'niche', popularity: 88, usageCount: 750, relatedTags: ['#technology', '#gadgets'] },
    { tag: '#nature', category: 'general', popularity: 87, usageCount: 900, relatedTags: ['#outdoors', '#wildlife'] },
    { tag: '#art', category: 'niche', popularity: 84, usageCount: 700, relatedTags: ['#artist', '#creative'] },
    { tag: '#music', category: 'general', popularity: 89, usageCount: 850, relatedTags: ['#singer', '#band'] },
    { tag: '#business', category: 'brand', popularity: 82, usageCount: 600, relatedTags: ['#entrepreneur', '#marketing'] }
];

const seedCaptions = [
    {
        text: "Living my best life! ✨ #blessed",
        category: "personal",
        tone: "casual",
        usageCount: 150,
        suggestedHashtags: ["#lifestyle", "#happy", "#goodvibes"]
    },
    {
        text: "Chasing sunsets and dreams 🌅",
        category: "inspirational",
        tone: "emotional",
        usageCount: 200,
        suggestedHashtags: ["#sunset", "#dreams", "#inspiration"]
    },
    {
        text: "New product alert! Check out our latest collection 🛍️",
        category: "promotional",
        tone: "professional",
        usageCount: 180,
        suggestedHashtags: ["#newarrivals", "#shopping", "#fashion"]
    },
    {
        text: "Today's workout: crushed it! 💪",
        category: "personal",
        tone: "motivational",
        usageCount: 120,
        suggestedHashtags: ["#fitness", "#gymlife", "#workout"]
    },
    {
        text: "Learn something new every day 📚",
        category: "educational",
        tone: "casual",
        usageCount: 90,
        suggestedHashtags: ["#learning", "#knowledge", "#growth"]
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        await Hashtag.deleteMany({});
        await Caption.deleteMany({});
        
        await Hashtag.insertMany(seedHashtags);
        await Caption.insertMany(seedCaptions);
        
        console.log('Database seeded successfully');
        console.log(`Added ${seedHashtags.length} hashtags`);
        console.log(`Added ${seedCaptions.length} captions`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();