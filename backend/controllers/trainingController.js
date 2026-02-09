const Training = require("../models/Training");

exports.getTrainings = async (req, res) => {
  try {
    const trainings = await Training.find();

   /* Training.insertOne({
      title: "AI Security Workshop",
      description: "Introduction to OWASP API Security",
      type: "Video",
      url: "https://www.youtube.com/watch?v=example",
      thumbnail: "https://img.youtube.com/vi/example/0.jpg",
      category: "Security"
    });*/
        res.json(trainings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
