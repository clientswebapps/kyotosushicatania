import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/config";
import {
  Eye,
  Users,
  Compass,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Loader2,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  ExternalLink,
  Settings,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";

export default function AnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [chartMetric, setChartMetric] = useState("activeUsers"); // 'activeUsers' or 'pageViews'
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [showSetupHelp, setShowSetupHelp] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Reference for tooltip position
  const chartRef = useRef(null);

  const fetchAnalytics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setErrorInfo(null);

    try {
      if (!functions) {
        throw new Error("Firebase Functions SDK is not initialized.");
      }

      const getAnalyticsReport = httpsCallable(functions, "getAnalyticsReport");
      const result = await getAnalyticsReport();
      const response = result.data;

      if (response.success) {
        setReportData(response.data);
      } else {
        setErrorInfo({
          type: response.error,
          message: response.message,
          details: response.details || ""
        });
        // Show setup help automatically if property/auth configuration is missing
        if (response.error === "PROPERTY_ID_MISSING" || response.error === "AUTHENTICATION_FAILED" || response.error === "CLIENT_INITIALIZATION_FAILED") {
          setShowSetupHelp(true);
        }
      }
    } catch (err) {
      console.error("Error calling getAnalyticsReport function:", err);
      setErrorInfo({
        type: "CALL_ERROR",
        message: err.message || "Failed to contact the backend service. Make sure the functions are deployed."
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Compute stats based on the trend data (30-day aggregates)
  const statsSummary = useMemo(() => {
    if (!reportData || !reportData.trend || reportData.trend.length === 0) {
      return { totalVisitors: 0, totalPageViews: 0, avgViewsPerUser: 0 };
    }

    const totalVisitors = reportData.trend.reduce((sum, d) => sum + d.activeUsers, 0);
    const totalPageViews = reportData.trend.reduce((sum, d) => sum + d.pageViews, 0);
    const avgViewsPerUser = totalVisitors > 0 ? (totalPageViews / totalVisitors).toFixed(1) : 0;

    return {
      totalVisitors,
      totalPageViews,
      avgViewsPerUser
    };
  }, [reportData]);

  // Compute SVG layout coordinates for the 30-day traffic trend
  const chartLayout = useMemo(() => {
    if (!reportData || !reportData.trend || reportData.trend.length === 0) return null;

    const width = 600;
    const height = 240;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 35;

    const trend = reportData.trend;
    const maxVal = Math.max(...trend.map(d => d[chartMetric]), 10);
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = trend.map((d, i) => {
      const x = paddingLeft + (i / (trend.length - 1)) * chartWidth;
      const y = height - paddingBottom - (d[chartMetric] / maxVal) * chartHeight;
      return { x, y, data: d };
    });

    // Generate SVG path 'd' strings
    const lineD = points.length > 0 
      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ")
      : "";

    const areaD = points.length > 0
      ? `${lineD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
      : "";

    return {
      width,
      height,
      paddingLeft,
      paddingRight,
      paddingTop,
      paddingBottom,
      maxVal,
      points,
      lineD,
      areaD
    };
  }, [reportData, chartMetric]);

  // Device categories details
  const deviceStats = useMemo(() => {
    if (!reportData || !reportData.devices || reportData.devices.length === 0) return [];
    
    const total = reportData.devices.reduce((sum, d) => sum + d.activeUsers, 0);
    
    return reportData.devices.map(d => {
      const pct = total > 0 ? ((d.activeUsers / total) * 100).toFixed(0) : 0;
      return {
        category: d.category,
        activeUsers: d.activeUsers,
        percentage: Number(pct)
      };
    }).sort((a, b) => b.activeUsers - a.activeUsers);
  }, [reportData]);

  // Helper icons for device types
  const getDeviceIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat === "mobile") return <Smartphone size={16} />;
    if (cat === "desktop") return <Monitor size={16} />;
    if (cat === "tablet") return <Tablet size={16} />;
    return <Globe size={16} />;
  };

  const getDeviceColorClass = (category) => {
    const cat = category.toLowerCase();
    if (cat === "mobile") return "blue";
    if (cat === "desktop") return "gold";
    return "green";
  };

  if (loading) {
    return (
      <div className="admin-loading-spinner-wrapper">
        <div className="menu-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="analytics-tab-container">
      <div className="admin-res-header-row">
        <div>
          <h2>Website Traffic Analytics</h2>
          <p>Retrieve audience performance metrics sourced directly from Google Analytics 4.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            className="btn-seed-db"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => setShowSetupHelp(!showSetupHelp)}
          >
            <Settings size={14} />
            <span>Setup Instructions</span>
          </button>
          <button 
            className="btn-seed-db"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            disabled={refreshing}
            onClick={() => fetchAnalytics(true)}
          >
            {refreshing ? <Loader2 size={14} className="admin-spinner" /> : <RefreshCw size={14} />}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Setup Guide Assistant Panel */}
      <AnimatePresence>
        {showSetupHelp && (
          <motion.section 
            className="analytics-setup-card"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.3 }}
            style={{ overflow: "hidden", marginBottom: "24px" }}
          >
            <div className="setup-card-header">
              <Settings size={20} className="gold-text" />
              <h3>Google Analytics 4 (GA4) Integration Setup Guide</h3>
            </div>
            
            <div className="setup-steps-grid">
              <div className="setup-step">
                <div className="step-badge">1</div>
                <h4>Enable Google Analytics Data API</h4>
                <p>
                  Open the Google Cloud Console library page and enable the <strong>Google Analytics Data API (v1beta)</strong>:
                </p>
                <a 
                  href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="setup-link"
                >
                  <span>Open API Library</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="setup-step">
                <div className="step-badge">2</div>
                <h4>Grant Viewer Access to Service Account</h4>
                <p>
                  Go to Google Analytics Admin Console &rarr; <strong>Property Access Management</strong>. Add the project default service account email as a <strong>Viewer</strong>:
                </p>
                <div className="code-copy-box">
                  <code>kyotosushicatania@appspot.gserviceaccount.com</code>
                </div>
                <span className="step-note">* Ensure the service account email is correct for the active environment.</span>
              </div>

              <div className="setup-step">
                <div className="step-badge">3</div>
                <h4>Define GA4 Property ID</h4>
                <p>
                  Locate your Property ID in Google Analytics (Admin &rarr; Property Settings &rarr; Property Details) and add it to your Cloud Functions environment:
                </p>
                <div className="code-copy-box">
                  <code>GA4_PROPERTY_ID=477759530</code>
                </div>
                <span className="step-note">Paste it in <code>functions/.env.kyotosushicatania</code> and redeploy.</span>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Error Message Panel if API fails */}
      {errorInfo && (
        <div className="analytics-error-banner">
          <ShieldAlert size={20} className="red-icon" />
          <div className="error-banner-content">
            <h4>Failed to Fetch Analytics ({errorInfo.type})</h4>
            <p>{errorInfo.message}</p>
            {errorInfo.details && <pre className="error-pre">{errorInfo.details}</pre>}
          </div>
        </div>
      )}

      {reportData && (
        <>
          {/* Summary Stats Grid */}
          <section className="admin-stats-grid" style={{ marginBottom: "24px" }}>
            <div className="admin-stat-card">
              <div className="admin-stat-icon gold">
                <Users size={24} />
              </div>
              <div>
                <h3>Unique Visitors (30d)</h3>
                <p className="admin-stat-num">{statsSummary.totalVisitors.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="admin-stat-card">
              <div className="admin-stat-icon blue">
                <Eye size={24} />
              </div>
              <div>
                <h3>Page Views (30d)</h3>
                <p className="admin-stat-num">{statsSummary.totalPageViews.toLocaleString()}</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-icon green">
                <Compass size={24} />
              </div>
              <div>
                <h3>Pages / Visitor</h3>
                <p className="admin-stat-num">{statsSummary.avgViewsPerUser}</p>
              </div>
            </div>
          </section>

          {/* Real-time Indicator pulse */}
          <div className="analytics-realtime-bar">
            <span className="pulse-indicator"></span>
            <span>
              <strong>{reportData.realtimeUsers}</strong> active {reportData.realtimeUsers === 1 ? "user" : "users"} online right now (last 30 minutes)
            </span>
          </div>

          {/* Visualization Grid: Chart & Devices */}
          <div className="analytics-viz-grid">
            {/* SVG Line/Area Chart */}
            <article className="analytics-chart-container" ref={chartRef}>
              <div className="chart-header">
                <h3>Traffic Trend (30 Days)</h3>
                <div className="metric-toggle-group">
                  <button 
                    className={`metric-toggle-btn ${chartMetric === "activeUsers" ? "active" : ""}`}
                    onClick={() => setChartMetric("activeUsers")}
                  >
                    Visitors
                  </button>
                  <button 
                    className={`metric-toggle-btn ${chartMetric === "pageViews" ? "active" : ""}`}
                    onClick={() => setChartMetric("pageViews")}
                  >
                    Views
                  </button>
                </div>
              </div>

              {chartLayout && (
                <div className="svg-wrapper" style={{ position: "relative" }}>
                  <svg 
                    viewBox={`0 0 ${chartLayout.width} ${chartLayout.height}`} 
                    className="analytics-svg"
                    width="100%"
                    height="100%"
                  >
                    {/* Definitions for smooth gradients */}
                    <defs>
                      <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand-gold)" stopOpacity="0.22"/>
                        <stop offset="100%" stopColor="var(--color-brand-gold)" stopOpacity="0.00"/>
                      </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    <line 
                      x1={chartLayout.paddingLeft} 
                      y1={chartLayout.paddingTop} 
                      x2={chartLayout.width - chartLayout.paddingRight} 
                      y2={chartLayout.paddingTop} 
                      stroke="rgba(255,255,255,0.05)" 
                    />
                    <line 
                      x1={chartLayout.paddingLeft} 
                      y1={chartLayout.height / 2} 
                      x2={chartLayout.width - chartLayout.paddingRight} 
                      y2={chartLayout.height / 2} 
                      stroke="rgba(255,255,255,0.05)" 
                    />
                    <line 
                      x1={chartLayout.paddingLeft} 
                      y1={chartLayout.height - chartLayout.paddingBottom} 
                      x2={chartLayout.width - chartLayout.paddingRight} 
                      y2={chartLayout.height - chartLayout.paddingBottom} 
                      stroke="rgba(255,255,255,0.1)" 
                    />

                    {/* Left Y-Axis Labels */}
                    <text x={chartLayout.paddingLeft - 8} y={chartLayout.paddingTop + 4} textAnchor="end" fill="var(--color-text-secondary)" fontSize="10">
                      {chartLayout.maxVal}
                    </text>
                    <text x={chartLayout.paddingLeft - 8} y={chartLayout.height / 2 + 4} textAnchor="end" fill="var(--color-text-secondary)" fontSize="10">
                      {Math.round(chartLayout.maxVal / 2)}
                    </text>
                    <text x={chartLayout.paddingLeft - 8} y={chartLayout.height - chartLayout.paddingBottom + 4} textAnchor="end" fill="var(--color-text-secondary)" fontSize="10">
                      0
                    </text>

                    {/* SVG Areas and Paths */}
                    {chartLayout.areaD && (
                      <motion.path 
                        d={chartLayout.areaD} 
                        fill="url(#chart-area-grad)"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
                      />
                    )}

                    {chartLayout.lineD && (
                      <motion.path 
                        d={chartLayout.lineD} 
                        fill="none" 
                        stroke="var(--color-brand-gold)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.2, ease: "easeOut" }}
                      />
                    )}

                    {/* Interactive hover elements */}
                    {hoveredPoint !== null && (
                      <>
                        {/* Hover vertical helper line */}
                        <line 
                          x1={chartLayout.points[hoveredPoint].x} 
                          y1={chartLayout.paddingTop} 
                          x2={chartLayout.points[hoveredPoint].x} 
                          y2={chartLayout.height - chartLayout.paddingBottom} 
                          stroke="rgba(232, 184, 48, 0.2)" 
                          strokeDasharray="4"
                          strokeWidth="1.5"
                        />
                        {/* Glowing dot on the path */}
                        <circle 
                          cx={chartLayout.points[hoveredPoint].x} 
                          cy={chartLayout.points[hoveredPoint].y} 
                          r="6" 
                          fill="var(--color-bg-elevated)" 
                          stroke="var(--color-brand-gold)" 
                          strokeWidth="3.5" 
                        />
                      </>
                    )}

                    {/* Bottom X-Axis labels (Date boundaries) */}
                    {chartLayout.points.length > 1 && (
                      <>
                        <text x={chartLayout.points[0].x} y={chartLayout.height - 12} textAnchor="start" fill="var(--color-text-secondary)" fontSize="10">
                          {chartLayout.points[0].data.date.substring(5)}
                        </text>
                        <text x={chartLayout.points[Math.round(chartLayout.points.length / 2)].x} y={chartLayout.height - 12} textAnchor="middle" fill="var(--color-text-secondary)" fontSize="10">
                          {chartLayout.points[Math.round(chartLayout.points.length / 2)].data.date.substring(5)}
                        </text>
                        <text x={chartLayout.points[chartLayout.points.length - 1].x} y={chartLayout.height - 12} textAnchor="end" fill="var(--color-text-secondary)" fontSize="10">
                          {chartLayout.points[chartLayout.points.length - 1].data.date.substring(5)}
                        </text>
                      </>
                    )}

                    {/* Invisible hotzones for mouseover tooltips */}
                    {chartLayout.points.map((p, index) => {
                      const widthBetween = chartLayout.width / chartLayout.points.length;
                      return (
                        <rect
                          key={index}
                          x={p.x - widthBetween / 2}
                          y={chartLayout.paddingTop}
                          width={widthBetween}
                          height={chartLayout.height - chartLayout.paddingTop - chartLayout.paddingBottom}
                          fill="transparent"
                          onMouseEnter={() => setHoveredPoint(index)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* HTML Rich Tooltip Overlay */}
                  <AnimatePresence>
                    {hoveredPoint !== null && chartLayout.points[hoveredPoint] && (
                      <motion.div 
                        className="chart-tooltip"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          position: "absolute",
                          left: `${(chartLayout.points[hoveredPoint].x / chartLayout.width) * 100}%`,
                          top: `${(chartLayout.points[hoveredPoint].y / chartLayout.height) * 100 - 65}%`,
                          transform: "translateX(-50%)",
                          pointerEvents: "none",
                        }}
                      >
                        <div className="tooltip-date">
                          {new Date(chartLayout.points[hoveredPoint].data.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })}
                        </div>
                        <div className="tooltip-value">
                          <span>{chartMetric === "activeUsers" ? "Visitors" : "Page Views"}:</span>
                          <strong>{chartLayout.points[hoveredPoint].data[chartMetric]}</strong>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </article>

            {/* Device Distribution Cards */}
            <article className="analytics-devices-container">
              <h3>Devices (30 Days)</h3>
              <div className="devices-list">
                {deviceStats.length === 0 ? (
                  <p className="empty-devices-text">No device data available.</p>
                ) : (
                  deviceStats.map(item => (
                    <div key={item.category} className="device-row">
                      <div className="device-label-row">
                        <div className="device-name">
                          <span className={`device-icon-wrapper ${getDeviceColorClass(item.category)}`}>
                            {getDeviceIcon(item.category)}
                          </span>
                          <span className="capitalize">{item.category}</span>
                        </div>
                        <div className="device-values">
                          <span>{item.activeUsers.toLocaleString()} users</span>
                          <strong>{item.percentage}%</strong>
                        </div>
                      </div>
                      <div className="device-progress-bar-bg">
                        <motion.div 
                          className={`device-progress-bar-fill ${getDeviceColorClass(item.category)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={shouldReduceMotion ? { duration: 0 } : { duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </div>

          {/* Top Visited Pages Table */}
          <section className="analytics-pages-section" style={{ marginTop: "24px" }}>
            <h3>Top Pages (30 Days)</h3>
            <div className="table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Page Path</th>
                    <th>Page Title</th>
                    <th className="align-right">Unique Visitors</th>
                    <th className="align-right">Page Views</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.pages.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-table-text">No page traffic logged.</td>
                    </tr>
                  ) : (
                    reportData.pages.map((page, index) => (
                      <tr key={index}>
                        <td className="page-path-cell">
                          <code>{page.path}</code>
                          <a href={page.path} target="_blank" rel="noopener noreferrer" className="page-link-arrow">
                            <ArrowUpRight size={12} />
                          </a>
                        </td>
                        <td className="page-title-cell">{page.title}</td>
                        <td className="align-right">{page.activeUsers.toLocaleString()}</td>
                        <td className="align-right">{page.pageViews.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
