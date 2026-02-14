import { useEffect, useState } from "react";
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
    </div>
  );
}