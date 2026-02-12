import ClicksChart from '../components/ClicksChart';

function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Total Posts</h3>
          <p className="text-3xl mt-2">24</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Total Likes</h3>
          <p className="text-3xl mt-2">340</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold">Comments</h3>
          <p className="text-3xl mt-2">89</p>
        </div>
      </div>

      {/* Clicks Analytics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Click Analytics</h2>
        <ClicksChart />
      </div>
    </div>
  );
}

export default Dashboard;
