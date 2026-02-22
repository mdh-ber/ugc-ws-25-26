const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  timestamp: { 
    type: Date, 
    default: () => {
    
      const now = new Date();
      

      const germanyString = now.toLocaleString("en-US", { timeZone: "Europe/Berlin" });
      
      return new Date(germanyString);
    }
  },
  ipHash: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String 
  }
});

module.exports = mongoose.model('Visit', visitSchema);