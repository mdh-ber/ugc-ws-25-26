import { useEffect, useState } from "react";
import axios from "axios";

function ReviewStatus() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    console.log("URL CALLED =", url);

    axios.get("http://localhost:5000/api/feedbacks")
      .then(res => setReviews(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Review Status</h2>

      <ul>
        {reviews.map((review) => (
          <li key={review._id}>
            {review.contentTitle} - {review.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewStatus;
