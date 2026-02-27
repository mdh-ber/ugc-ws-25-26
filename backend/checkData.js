const mongoose = require('mongoose');
const Campaign = require('./models/Campaign');
const Earning = require('./models/Earning');
require('dotenv').config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const campaigns = await Campaign.find({});
    console.log('Campaigns found:', campaigns.length);
    campaigns.forEach(c => console.log(`- ${c.name}: ${c._id}`));

    const earnings = await Earning.find({}).populate('campaignId');
    console.log('Earnings found:', earnings.length);
    earnings.forEach(e => console.log(`- ${e.creator} (${e.platform}): $${e.revenue} - Campaign: ${e.campaignId ? e.campaignId.name : 'No campaign'}`));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();