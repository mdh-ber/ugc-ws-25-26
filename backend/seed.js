// seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

// 0️⃣ Fix SRV DNS resolution issues on Windows
dns.setServers(['8.8.8.8', '1.1.1.1']); // Google's DNS servers

// 1️⃣ Load environment variables
dotenv.config();

// 2️⃣ Define Schema (must match your Training model)
const TrainingSchema = new mongoose.Schema({
  title: String,
  type: { 
    type: String, 
    enum: ['Video', 'PDF'] 
  },
  url: String,
  category: String,
  thumbnail: String,
  createdAt: { type: Date, default: Date.now }
});

const Training = mongoose.model('Training', TrainingSchema);

// 3️⃣ Seed data
const trainingData = [
  // --- Videos ---
  {
    title: "How to Create Viral Reels",
    type: "Video",
    category: "Content Strategy",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  {
    title: "UGC Editing Masterclass",
    type: "Video",
    category: "Editing",
    url: "https://www.youtube.com/watch?v=example123",
    thumbnail: "https://img.youtube.com/vi/example123/mqdefault.jpg"
  },

  // --- PDFs ---
  {
    title: "2026 Brand Guidelines",
    type: "PDF",
    category: "Guidelines",
    url: "https://www.mdh-university.de/files/brand-guide.PDF", 
    thumbnail: "https://cdn-icons-png.flaticon.com/512/337/337946.png"
  },
  {
    title: "Creator Contract Template",
    type: "PDF",
    category: "Legal",
    url: "https://www.mdh-university.de/files/contract.PDF",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/2965/2965335.png"
  }
];

// 4️⃣ Seed function
const seedDB = async () => {
  try {
    // Connect to MongoDB (SRV URL from .env)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Remove old data
    await Training.deleteMany();
    console.log('🗑️  Old data removed');

    // Insert new data
    await Training.insertMany(trainingData);
    console.log(`✨ Success! Added ${trainingData.length} items (Videos & PDFs)`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

// 5️⃣ Run seed
seedDB();