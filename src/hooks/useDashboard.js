import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../utils/dashboard-api';

export const useDashboard = () => {
  const [stats, setStats] = useState({
    totalBusiness: 0,
    totalProjects: 0,
    totalTasks: 0,
    taskStatusDistribution: {}
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { stats, activities } = await dashboardApi.getDashboardData();
      
      setStats(stats);
      setActivities(activities);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      
      // Set default values on error
      setStats({
        totalBusiness: 0,
        totalProjects: 0,
        totalTasks: 0,
        taskStatusDistribution: {}
      });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate derived data
  const totalTasks = Object.values(stats.taskStatusDistribution || {}).reduce((sum, count) => sum + count, 0);
  const completedTasks = (stats.taskStatusDistribution.done || 0) + (stats.taskStatusDistribution.checked || 0);
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100) 
    : 0;

  const chartData = [
    { status: 'pending', count: stats.taskStatusDistribution.pending || 0, color: '#fbbf24' },
    { status: 'in_progress', count: stats.taskStatusDistribution.in_progress || 0, color: '#3b82f6' },
    { status: 'pause', count: stats.taskStatusDistribution.pause || 0, color: '#42368aff' },
    { status: 'done', count: stats.taskStatusDistribution.done || 0, color: '#10b981' },
    { status: 'checked', count: stats.taskStatusDistribution.checked || 0, color: '#8b5cf6' }
  ];

  return {
    stats,
    activities,
    loading,
    error,
    refreshData,
    totalTasks,
    completionRate,
    chartData
  };
};
