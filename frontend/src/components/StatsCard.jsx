import { TrendingDown, Clock, TrendingUp, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getMetrics } from '../services/analytics';
import './StatsCard.css';

const defaultStats = [
  {
    title: 'Incidentes Totales',
    value: '1.247',
    change: '12.3%',
    trend: 'down',
    icon: TrendingDown,
    color: 'blue',
  },
  {
    title: 'Tiempo de Respuesta',
    value: '8.5 min',
    change: '15.3%',
    trend: 'down',
    icon: Clock,
    color: 'cyan',
  },
  {
    title: 'Tasa de Criminalidad',
    value: '24.3%',
    change: '8.2%',
    trend: 'down',
    icon: TrendingUp,
    color: 'purple',
  },
  {
    title: 'Casos Resueltos',
    value: '892',
    change: '5.2%',
    trend: 'up',
    icon: CheckCircle,
    color: 'green',
  },
];

export function StatsOverview() {
  const [stats, setStats] = useState(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch metrics from backend
    getMetrics()
      .then((data) => {
        // Transform API response to stats format
        if (data && Array.isArray(data) && data.length > 0) {
          const transformedStats = data.map((item, idx) => ({
            title: item.title || item.name || defaultStats[idx]?.title || 'Métrica',
            value: item.value || item.count || item.total || '0',
            change: item.change || item.percent_change || '0%',
            trend: item.trend || (parseFloat(item.change) > 0 ? 'up' : 'down') || 'neutral',
            icon: defaultStats[idx]?.icon || TrendingDown,
            color: defaultStats[idx]?.color || 'blue',
          }));
          setStats(transformedStats.slice(0, 4)); // Show max 4 stats
        }
      })
      .catch((err) => {
        console.error('Error fetching metrics:', err);
        setStats(defaultStats);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="stats-grid">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className={`stat-card stat-card-${stat.color}`}>
            <div className="stat-icon">
              <Icon size={24} />
            </div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <p className="stat-value">{isLoading ? '...' : stat.value}</p>
              <p className={`stat-change ${stat.trend}`}>
                {stat.trend === 'down' ? '↓' : stat.trend === 'up' ? '↑' : '→'} {stat.change} vs mes anterior
              </p>
            </div>
            <div className="stat-bar"></div>
          </div>
        );
      })}
    </div>
  );
}
