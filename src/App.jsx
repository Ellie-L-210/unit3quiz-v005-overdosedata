import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './contexts/AuthContext'
import { loadCSVData } from './utils/dataLoader'
import Login from './components/Login'
import Register from './components/Register'
import Poll from './components/Poll'
import SalesOverTime from './components/SalesOverTime'
import SalesByItemType from './components/SalesByItemType'
import YearlyComparison from './components/YearlyComparison'
import MonthlyTrends from './components/MonthlyTrends'
import SalesDistribution from './components/SalesDistribution'
import CategoryMonthlyView from './components/CategoryMonthlyView'
import VoteButton from './components/VoteButton'

function App() {
  const { currentUser, logout } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authMode, setAuthMode] = useState(null) // 'login', 'register', or null
  const [showPoll, setShowPoll] = useState(false) // Control poll visibility via Vote button

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const csvData = await loadCSVData()
        setData(csvData)
        setError(null)
      } catch (err) {
        setError(err.message)
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    // Always fetch data - no authentication required to view
    fetchData()
  }, [])

  // Close modal when user successfully logs in or registers
  useEffect(() => {
    if (currentUser && authMode) {
      setAuthMode(null)
    }
  }, [currentUser, authMode])

  // Ensure poll is closed when user logs out
  useEffect(() => {
    if (!currentUser) {
      setShowPoll(false)
    }
  }, [currentUser])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading sales data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Data</h2>
        <p>{error}</p>
        <p>Please make sure the CSV file is in the public folder.</p>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      // Close poll when user logs out
      setShowPoll(false)
      await logout()
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  }

  const handleRegisterClick = () => {
    setAuthMode('register')
  }

  const handleSignInClick = () => {
    setAuthMode('login')
  }

  const handleCloseModal = () => {
    setAuthMode(null)
  }

  const handleVoteClick = () => {
    if (!currentUser) {
      // If not logged in, show register modal
      setAuthMode('register')
      // Ensure poll is closed
      setShowPoll(false)
    } else {
      // ONLY show the poll when Vote button is explicitly clicked
      // This is the ONLY place where setShowPoll(true) should be called
      setShowPoll(true)
    }
  }

  return (
    <>
      {authMode && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            {authMode === 'register' && (
              <Register onToggleMode={() => setAuthMode('login')} />
            )}
            {authMode === 'login' && (
              <Login onToggleMode={() => setAuthMode('register')} />
            )}
          </div>
        </div>
      )}
      <Poll showPoll={showPoll} onClosePoll={() => setShowPoll(false)} />
      <div className="app">
        <header className="app-header">
          <div className="header-top">
            <div>
              <h1>Warehouse and Retail Sales Analytics</h1>
              <p className="subtitle">Comprehensive sales data visualization</p>
            </div>
          </div>
          {currentUser && (
            <div className="stats-bar">
              <div className="stat-item registered-badge">
                <span className="stat-label">✓ Registered to Vote</span>
              </div>
            </div>
          )}
          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">Total Records:</span>
              <span className="stat-value">{data.length.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Retail Sales:</span>
              <span className="stat-value">
                ${data.reduce((sum, row) => sum + (row['RETAIL SALES'] || 0), 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Warehouse Sales:</span>
              <span className="stat-value">
                ${data.reduce((sum, row) => sum + (row['WAREHOUSE SALES'] || 0), 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </header>

        <section className="statement-section">
          <VoteButton 
          onVoteClick={handleVoteClick} 
          onRegisterClick={handleRegisterClick}
          onSignInClick={handleSignInClick}
        />
          <h2 className="statement-title">Statement of Intent</h2>
          <div className="statement-content">
            <p className="candidate-name">— The Honorable Senator Reginald P. Bottleworth III, Esq.</p>
            <div className="statement-text">
              <p>
                My fellow citizens, distinguished colleagues, and valued constituents—I stand before you today not merely as a public servant, but as a champion of transparency, accountability, and the fundamental right of every American to understand the economic forces that shape our great nation.
              </p>
              <p>
                The data you see before you represents more than mere numbers; it represents the heartbeat of American commerce, the pulse of our retail economy, and the very essence of free-market enterprise. As your representative, I have made it my solemn duty to bring these critical metrics into the light, for knowledge is power, and power belongs to the people.
              </p>
              <p>
                <strong>My stance on these findings is clear and unwavering:</strong> The comprehensive analysis of warehouse and retail sales data reveals a robust, dynamic economy that demands our attention and respect. The trends we observe—from the steady growth in retail sales to the strategic distribution across multiple product categories—demonstrate the resilience of American business and the ingenuity of our entrepreneurs.
              </p>
              <p>
                I believe in data-driven governance. I believe in transparency. I believe that when we examine the facts—when we look at the monthly trends, the yearly comparisons, and the categorical breakdowns—we see not just statistics, but stories. Stories of hardworking Americans building businesses, creating jobs, and contributing to our nation's prosperity.
              </p>
              <p>
                Therefore, I pledge to you, the American people: I will continue to champion policies that support retail growth, warehouse efficiency, and economic transparency. I will fight for the small business owner, the warehouse worker, and the retail associate. I will ensure that data like this remains accessible, understandable, and actionable for all citizens.
              </p>
              <p>
                The numbers don't lie, my friends. And neither do I. Together, we will build a future where data illuminates the path forward, where transparency guides our decisions, and where every chart tells a story of American excellence.
              </p>
              <p className="statement-signature">
                <em>In service and transparency,</em><br />
                <strong>Senator Reginald P. Bottleworth III</strong>
              </p>
            </div>
          </div>
        </section>

        <main className="charts-grid">
          <div className="chart-wrapper">
            <SalesOverTime data={data} />
          </div>
          <div className="chart-wrapper">
            <YearlyComparison data={data} />
          </div>
          <div className="chart-wrapper">
            <SalesByItemType data={data} />
          </div>
          <div className="chart-wrapper">
            <MonthlyTrends data={data} />
          </div>
          <div className="chart-wrapper">
            <SalesDistribution data={data} />
          </div>
          <div className="chart-wrapper chart-wrapper-full">
            <CategoryMonthlyView data={data} />
          </div>
        </main>
      </div>
    </>
  )
}

export default App
