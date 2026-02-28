import { useEffect, useState } from "react";
<<<<<<< HEAD
import { getReferralOverview } from "../services/uuService";

export default function ReferralOverview() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await getReferralOverview({ days: 7 });
        setData(res?.series || []);
      } catch (err) {
        console.error("API error", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Referral Overview</h1>

      {loading && <p>Loading...</p>}

      {!loading && data.length === 0 && <p>No data yet...</p>}

      {!loading &&
        data.map((item, index) => (
          <p key={index}>
            {item.date} : {item.uu}
          </p>
        ))}
=======
import axios from "axios";

export default function ReferralOverview() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/uu/referral/overview")
      .then((res) => {
        console.log(res.data);
        setData(res.data.series);
      })
      .catch((err) => {
        console.error("API error", err);
      });
  }, []);

  return (
    <div>
      <h1>Referral Overview</h1>

      {data.map((item, index) => (
        <p key={index}>
          {item.date} : {item.uu}
        </p>
      ))}
>>>>>>> 5c3591f6d6d1bedf79fbc2183dff9203be7d51d1
    </div>
  );
}