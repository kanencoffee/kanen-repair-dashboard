import { useState, useEffect } from 'react';
import { DonutChart, LineChart, BarChart, Heatmap } from '../components/Charts';

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [stockoutAlerts, setStockoutAlerts] = useState([]);
  const [repairVelocity, setRepairVelocity] = useState([]);
  const [techPerformance, setTechPerformance] = useState([]);
  const [brandProfiles, setBrandProfiles] = useState([]);
  const [partsProfit, setPartsProfit] = useState([]);
  const [burnRates, setBurnRates] = useState([]);
  const [repeatCustomers, setRepeatCustomers] = useState([]);
  const [customerSplit, setCustomerSplit] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const summaryRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/dashboard/summary');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const stockoutRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/analytics/stockout-alerts');
      const stockoutData = await stockoutRes.json();
      setStockoutAlerts(stockoutData);

      const velocityRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/analytics/repair-velocity');
      const velocityData = await velocityRes.json();
      setRepairVelocity(velocityData);

      const techRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/analytics/brand-profiles');
      const techData = await techRes.json();
      setTechPerformance(techData);

      const brandRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/analytics/brand-profiles');
      const brandData = await brandRes.json();
      setBrandProfiles(brandData);

      const profitRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/analytics/parts-profit');
      const profitData = await profitRes.json();
      setPartsProfit(profitData);

      const burnRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/analytics/burn-rates');
      const burnData = await burnRes.json();
      setBurnRates(burnData);

      const repeatRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/v1/analytics/repeat-customers');
      const repeatData = await repeatRes.json();
      setRepeatCustomers(repeatData);

      // Mock customer split data
      setCustomerSplit({
        commercial: 65,
        residential: 35
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Repair Intelligence Dashboard</h1>

        {/* Business Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h2>
            <DonutChart data={summary.revenueBreakdown} />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Repair Velocity</h2>
            <LineChart data={repairVelocity} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Repairs</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalRepairs}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Avg Ticket</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${summary.avgTicket}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Annualized Revenue</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">${summary.annualizedRevenue}</p>
          </div>
        </div>

        {/* Stockout Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Top 5 Stockout Alerts</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Part</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Daily Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Days Until Stockout</th>
              </tr>
            </thead>
            <tbody>
              {stockoutAlerts.map((alert, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{alert.part}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{alert.currentStock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{alert.dailyUsage}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{alert.daysUntilStockout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Technician Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Technician Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Repairs per Technician</h3>
              <BarChart data={techPerformance} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Brand Specialization</h3>
              <Heatmap data={brandProfiles} />
            </div>
          </div>
        </div>

        {/* Parts Intelligence */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Parts Intelligence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Top Parts by Revenue</h3>
              <BarChart data={partsProfit} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Burn Rates</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Part</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Burn Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stockout Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {burnRates.map((rate, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rate.part}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{rate.burnRate}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${rate.stockoutRisk === 'High' ? 'text-red-600 dark:text-red-400' : rate.stockoutRisk === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>{rate.stockoutRisk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Customer Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Top Repeat Customers</h3>
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Repairs</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {repeatCustomers.map((customer, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{customer.repairs}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${customer.totalSpent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Commercial vs Residential</h3>
              <DonutChart data={customerSplit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;