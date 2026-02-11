const mongoose = require('mongoose');
const dotenv = require('dotenv');

// 1. Load your secrets
dotenv.config();

// 2. Define Schema (Must match your Training.js model)
const TrainingSchema = new mongoose.Schema({
  title: String,
  type: { 
    type: String, 
    enum: ['video', 'pdf'] 
  },
  url: String,
  category: String,
  thumbnail: String,
  createdAt: { type: Date, default: Date.now }
});

const Training = mongoose.model('Training', TrainingSchema);

// 3. The Mixed List (Videos + PDFs)
const trainingData = [
  // --- VIDEOS ---
  {
    title: "How to Create Viral Reels",
    type: "video",
    category: "Content Strategy",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg"
  },
  {
    title: "UGC Editing Masterclass",
    type: "video",
    category: "Editing",
    url: "https://www.youtube.com/watch?v=example123",
    thumbnail: "https://img.youtube.com/vi/example123/mqdefault.jpg"
  },

  // --- PDFS ---
  {
    title: "2026 Brand Guidelines",
    type: "pdf",
    category: "Guidelines",
    url: "https://www.mdh-university.de/files/brand-guide.pdf", 
    // Use a generic icon for PDFs since they don't have thumbnails like YouTube
    thumbnail: "https://cdn-icons-png.flaticon.com/512/337/337946.png"
  },
  {
    title: "Creator Contract Template",
    type: "pdf",
    category: "Legal",
    url: "https://www.mdh-university.de/files/contract.pdf",
    thumbnail: "https://cdn-icons-png.flaticon.com/512/2965/2965335.png"
  }
];

// 4. The Magic Function
const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // CLEAR old data
    await Training.deleteMany();
    console.log('🗑️  Old data removed...');

    // INSERT new mixed data
    await Training.insertMany(trainingData);
    console.log('✨ Success! Added ' + trainingData.length + ' items (Videos & PDFs).');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();