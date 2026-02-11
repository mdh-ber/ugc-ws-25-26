import { useEffect, useState } from "react";
import { getTrainings } from "../services/trainingService";

function Trainings() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const data = await getTrainings();
        setTrainings(data);
      } catch (err) {
        setError("Failed to fetch trainings");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
  }, []);

  if (loading) return <p>Loading trainings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Trainings</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => (
          <div
            key={training._id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="font-bold text-lg">{training.title}</h3>
            <p className="text-gray-600 mt-2">{training.description}</p>
            {training.videoUrl && (
              <a
                href={training.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-primary font-medium hover:underline"
              >
                Watch Video
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Trainings;
