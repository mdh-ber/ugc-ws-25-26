function Reviews() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews Overview</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Review Request</h3>
          <p className="text-3xl mt-2">24</p>
        </div> */}

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Submit Review</h3>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit review</button>
        </div>

       
      </div>
    </div>
  );
}

export default Reviews;
