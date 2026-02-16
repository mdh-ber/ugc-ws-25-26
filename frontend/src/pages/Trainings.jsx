import { useEffect, useState } from "react";
import { getTrainings } from "../services/trainingService";
import Button from "../components/Button";

function Trainings() {
  // --- STATE ---
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) setUser(JSON.parse(storedUser));

    const fetchData = async () => {
      try {
        const data = await getTrainings();
        setTrainings(data);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading trainings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Training</h1>
      <h2 className="text-lg mb-6">Continue your learning journey</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
        {trainings.map((training) => (
          <div
            key={training._id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <h3 className="font-bold">{training.title}</h3>
            <div className="mt-4">
              <Button 
                text={training.type === 'video' ? 'Watch Video' : 'Read File'}
                onClick={() => window.open(training.url, '_blank')}
                className={training.type === 'video' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Trainings;