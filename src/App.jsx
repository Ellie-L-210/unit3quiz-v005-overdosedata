import { useState, useEffect } from 'react'
import './App.css'
import { loadCSVData } from './utils/dataLoader'
import SalesOverTime from './components/SalesOverTime'
import SalesByItemType from './components/SalesByItemType'
import YearlyComparison from './components/YearlyComparison'
import MonthlyTrends from './components/MonthlyTrends'
import SalesDistribution from './components/SalesDistribution'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

    fetchData()
  }, [])

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Warehouse and Retail Sales Analytics</h1>
        <p className="subtitle">Comprehensive sales data visualization</p>
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
      </main>
    </div>
  )
}

export default App
