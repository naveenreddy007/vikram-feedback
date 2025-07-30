import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Button, Card, LoadingSpinner } from './ui';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AdminDashboardProps {
  adminUser: any;
  onLogout: () => void;
}

interface FeedbackStats {
  overview: {
    totalFeedback: number;
    averageRatings: {
      teachingSkills: number;
      realWorldExplanation: number;
      overallSatisfaction: number;
    };
  };
  stats: {
    teachingPace: Array<{
      teachingPace: string;
      _count: { teachingPace: number };
    }>;
    deviceType: Array<{
      deviceType: string;
      _count: { deviceType: number };
    }>;
  };
  recentFeedback: Array<{
    id: string;
    name: string;
    teachingSkills: number;
    realWorldExplanation: number;
    overallSatisfaction: number;
    submittedAt: string;
  }>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onLogout }) => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      const response = await fetch('api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.error?.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      setIsExporting(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`/api/admin/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feedback-export-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const getAverageRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-accent-green';
    if (rating >= 6) return 'text-accent-blue';
    if (rating >= 4) return 'text-accent-orange';
    return 'text-red-400';
  };

  const ratingsChartData = {
    labels: ['Teaching Skills', 'Real-World Explanation', 'Overall Satisfaction'],
    datasets: [
      {
        label: 'Average Ratings',
        data: stats ? [
          stats.overview.averageRatings.teachingSkills,
          stats.overview.averageRatings.realWorldExplanation,
          stats.overview.averageRatings.overallSatisfaction,
        ] : [],
        backgroundColor: [
          'rgba(0, 212, 255, 0.8)',
          'rgba(57, 255, 20, 0.8)',
          'rgba(255, 107, 53, 0.8)',
        ],
        borderColor: [
          'rgba(0, 212, 255, 1)',
          'rgba(57, 255, 20, 1)',
          'rgba(255, 107, 53, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const paceChartData = {
    labels: stats?.stats.teachingPace.map(item => 
      item.teachingPace.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
    ) || [],
    datasets: [
      {
        data: stats?.stats.teachingPace.map(item => item._count.teachingPace) || [],
        backgroundColor: [
          'rgba(255, 107, 53, 0.8)',
          'rgba(57, 255, 20, 0.8)',
          'rgba(0, 212, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 107, 53, 1)',
          'rgba(57, 255, 20, 1)',
          'rgba(0, 212, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const deviceChartData = {
    labels: stats?.stats.deviceType.map(item => item.deviceType) || [],
    datasets: [
      {
        data: stats?.stats.deviceType.map(item => item._count.deviceType) || [],
        backgroundColor: [
          'rgba(0, 212, 255, 0.8)',
          'rgba(57, 255, 20, 0.8)',
          'rgba(255, 107, 53, 0.8)',
        ],
        borderColor: [
          'rgba(0, 212, 255, 1)',
          'rgba(57, 255, 20, 1)',
          'rgba(255, 107, 53, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#ffffff',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          padding: 20,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" color="blue" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card variant="glass" className="p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-4 text-red-400">Error Loading Dashboard</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" onClick={fetchDashboardData}>
              Retry
            </Button>
            <Button variant="secondary" onClick={onLogout}>
              Logout
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl lewish-text text-accent-blue mb-2">
              ADMIN DASHBOARD
            </h1>
            <p className="text-gray-300">
              Welcome back, <span className="text-accent-green font-semibold">{adminUser?.username || 'Admin'}</span>!
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button variant="secondary" onClick={fetchDashboardData}>
              🔄 Refresh
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              📊 Export CSV
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleExport('json')}
              disabled={isExporting}
            >
              📄 Export JSON
            </Button>
            <Button variant="secondary" onClick={onLogout}>
              ← Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'analytics', label: 'Analytics', icon: '📈' },
            { id: 'feedback', label: 'Recent Feedback', icon: '💬' },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? 'primary' : 'secondary'}
              onClick={() => setSelectedTab(tab.id)}
              className="flex items-center space-x-2"
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card variant="glass" className="p-6 text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-2xl font-bold text-accent-blue mb-1">
                    {stats?.overview.totalFeedback || 0}
                  </div>
                  <div className="text-gray-400 text-sm">Total Feedback</div>
                </Card>

                <Card variant="glass" className="p-6 text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <div className={`text-2xl font-bold mb-1 ${getAverageRatingColor(stats?.overview.averageRatings.teachingSkills || 0)}`}>
                    {stats?.overview.averageRatings.teachingSkills?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-gray-400 text-sm">Teaching Skills</div>
                </Card>

                <Card variant="glass" className="p-6 text-center">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className={`text-2xl font-bold mb-1 ${getAverageRatingColor(stats?.overview.averageRatings.realWorldExplanation || 0)}`}>
                    {stats?.overview.averageRatings.realWorldExplanation?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-gray-400 text-sm">Real-World Explanation</div>
                </Card>

                <Card variant="glass" className="p-6 text-center">
                  <div className="text-3xl mb-2">😊</div>
                  <div className={`text-2xl font-bold mb-1 ${getAverageRatingColor(stats?.overview.averageRatings.overallSatisfaction || 0)}`}>
                    {stats?.overview.averageRatings.overallSatisfaction?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-gray-400 text-sm">Overall Satisfaction</div>
                </Card>
              </div>

              {/* Quick Insights */}
              <Card variant="glass" className="p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4 text-accent-green">Quick Insights</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Performance Summary</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Average rating across all categories: <span className="text-accent-blue font-semibold">
                        {stats ? ((stats.overview.averageRatings.teachingSkills + stats.overview.averageRatings.realWorldExplanation + stats.overview.averageRatings.overallSatisfaction) / 3).toFixed(1) : '0.0'}
                      </span></li>
                      <li>• Total feedback submissions: <span className="text-accent-green font-semibold">{stats?.overview.totalFeedback || 0}</span></li>
                      <li>• Highest rated area: <span className="text-accent-orange font-semibold">
                        {stats ? (
                          Math.max(stats.overview.averageRatings.teachingSkills, stats.overview.averageRatings.realWorldExplanation, stats.overview.averageRatings.overallSatisfaction) === stats.overview.averageRatings.teachingSkills ? 'Teaching Skills' :
                          Math.max(stats.overview.averageRatings.teachingSkills, stats.overview.averageRatings.realWorldExplanation, stats.overview.averageRatings.overallSatisfaction) === stats.overview.averageRatings.realWorldExplanation ? 'Real-World Explanation' : 'Overall Satisfaction'
                        ) : 'N/A'}
                      </span></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Recommendations</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Continue focusing on real-world applications</li>
                      <li>• Maintain current teaching pace</li>
                      <li>• Keep engaging with practical examples</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <Card variant="glass" className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-accent-blue">Average Ratings</h3>
                  <Bar data={ratingsChartData} options={chartOptions} />
                </Card>

                <Card variant="glass" className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-accent-green">Teaching Pace Feedback</h3>
                  <Doughnut data={paceChartData} options={doughnutOptions} />
                </Card>
              </div>

              <Card variant="glass" className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-accent-orange">Device Usage</h3>
                <div className="max-w-md mx-auto">
                  <Doughnut data={deviceChartData} options={doughnutOptions} />
                </div>
              </Card>
            </motion.div>
          )}

          {selectedTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="p-6">
                <h3 className="text-xl font-semibold mb-6 text-accent-blue">Recent Feedback</h3>
                
                {stats?.recentFeedback && stats.recentFeedback.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentFeedback.map((feedback, index) => (
                      <motion.div
                        key={feedback.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-white">{feedback.name}</h4>
                            <p className="text-sm text-gray-400">
                              {new Date(feedback.submittedAt).toLocaleDateString()} at{' '}
                              {new Date(feedback.submittedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getAverageRatingColor(feedback.teachingSkills)}`}>
                              {feedback.teachingSkills}/10
                            </div>
                            <div className="text-gray-400">Teaching Skills</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getAverageRatingColor(feedback.realWorldExplanation)}`}>
                              {feedback.realWorldExplanation}/10
                            </div>
                            <div className="text-gray-400">Real-World</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getAverageRatingColor(feedback.overallSatisfaction)}`}>
                              {feedback.overallSatisfaction}/10
                            </div>
                            <div className="text-gray-400">Overall</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-gray-400">No feedback submissions yet</p>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;