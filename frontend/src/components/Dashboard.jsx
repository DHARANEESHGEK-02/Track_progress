import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { fetchStats } from '../api/studentApi';

// Muted, ledger-appropriate palette for the grade-distribution pie chart.
// Deliberately not bright/primary colors — this echoes the ink-and-paper theme.
const PIE_COLORS = ['#7A2E2E', '#4B7A62', '#B8860B', '#3B4B6B', '#8A6D3B', '#5C5C5C'];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchStats();
        setStats(result.data);
      } catch (err) {
        setError('Could not load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="loading">Loading register summary...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return null;

  return (
    <div>
      <div className="page-header">
        <h1>Register Summary</h1>
        <p className="page-subtitle">An overview of current enrollment and standing</p>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-label">Total Enrolled</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <span className="stat-value stat-value-active">{stats.active}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Inactive</span>
          <span className="stat-value stat-value-inactive">{stats.inactive}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Attendance</span>
          <span className="stat-value">{stats.avgAttendance}%</span>
        </div>
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <h3>Enrollment by Class</h3>
          {stats.byClass.length === 0 ? (
            <p className="empty-note">No records yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.byClass} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E1D8" vertical={false} />
                <XAxis dataKey="className" tick={{ fontFamily: 'Inter', fontSize: 12, fill: '#5C5C5C' }} />
                <YAxis allowDecimals={false} tick={{ fontFamily: 'IBM Plex Mono', fontSize: 11, fill: '#5C5C5C' }} />
                <Tooltip
                  contentStyle={{ fontFamily: 'Inter', fontSize: 13, borderRadius: 4 }}
                  cursor={{ fill: '#F1EEE5' }}
                />
                <Bar dataKey="count" fill="#7A2E2E" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="chart-card">
          <h3>Grade Distribution</h3>
          {stats.byGrade.length === 0 ? (
            <p className="empty-note">No records yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.byGrade}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ grade, count }) => `${grade} (${count})`}
                  labelLine={false}
                >
                  {stats.byGrade.map((entry, index) => (
                    <Cell key={entry.grade} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: 'Inter', fontSize: 13, borderRadius: 4 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
