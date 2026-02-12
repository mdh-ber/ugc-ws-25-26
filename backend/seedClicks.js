require('dotenv').config();
const mongoose = require('mongoose');
const Click = require('./models/Click');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const seedClicks = async () => {
  try {
    await connectDB();
    
    // Clear existing click data
    await Click.deleteMany({});
    console.log('Cleared existing click data');
    
    // Generate sample clicks for the last 30 days
    const clicks = [];
    const resourceTypes = ['training', 'guideline', 'profile', 'other'];
    const pages = ['home', 'dashboard', 'trainings', 'profile'];
    const actions = ['view', 'click', 'download', 'share'];
    
    // Generate clicks for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random number of clicks per day (5-25)
      const clicksPerDay = Math.floor(Math.random() * 20) + 5;
      
      for (let j = 0; j < clicksPerDay; j++) {
        const randomHours = Math.floor(Math.random() * 24);
        const randomMinutes = Math.floor(Math.random() * 60);
        const timestamp = new Date(date);
        timestamp.setHours(randomHours, randomMinutes, 0, 0);
        
        clicks.push({
          userId: `user${Math.floor(Math.random() * 10) + 1}`,
          resourceType: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
          resourceId: `resource${Math.floor(Math.random() * 20) + 1}`,
          timestamp,
          metadata: {
            page: pages[Math.floor(Math.random() * pages.length)],
            action: actions[Math.floor(Math.random() * actions.length)],
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
      }
    }
    
    // Insert all clicks
    await Click.insertMany(clicks);
    console.log(`✅ Seeded ${clicks.length} click events`);
    
    // Display statistics
    const stats = await Click.aggregate([
      {
        $group: {
          _id: '$resourceType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\nClick statistics by type:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} clicks`);
    });
    
    mongoose.connection.close();
    console.log('\n✅ Seeding completed and connection closed');
  } catch (err) {
    console.error('❌ Error seeding clicks:', err);
    process.exit(1);
  }
};

seedClicks();
