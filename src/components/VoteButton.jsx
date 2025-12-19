import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { subscribeToVoteTallies } from '../utils/votingService'
import './VoteButton.css'

export default function VoteButton({ onVoteClick, onRegisterClick, onSignInClick }) {
  const { currentUser, logout } = useAuth()
  const [voteTallies, setVoteTallies] = useState({ yes: 0, no: 0, total: 0 })

  useEffect(() => {
    // Subscribe to real-time vote tallies
    const unsubscribe = subscribeToVoteTallies((tallies) => {
      setVoteTallies(tallies)
    })

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Failed to logout:', err)
    }
  }

  return (
    <div className="vote-section">
      <div className="vote-container">
        <h3 className="vote-title">Cast Your Vote</h3>

        {currentUser ? (
          <div className="vote-user-info">
            <button
              onClick={onVoteClick}
              className="vote-register-button"
            >
              Vote
            </button>
            <span className="vote-user-email">Registered: {currentUser.email}</span>
            <button
              onClick={handleLogout}
              className="vote-signout-button"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="vote-user-info">
            <button
              onClick={onRegisterClick}
              className="vote-register-button"
            >
              Register to Vote
            </button>
            <button
              onClick={onSignInClick}
              className="vote-signin-button"
            >
              Sign In
            </button>
          </div>
        )}

        {!currentUser && (
          <p className="vote-message">Please register or sign in to cast your vote.</p>
        )}

        <div className="vote-tally">
          <h4 className="vote-tally-title">Live Vote Tally</h4>
          <div className="vote-tally-stats">
            <div className="vote-tally-item">
              <span className="vote-tally-label">Yes:</span>
              <span className="vote-tally-value vote-tally-yes">{voteTallies.yes}</span>
            </div>
            <div className="vote-tally-item">
              <span className="vote-tally-label">No:</span>
              <span className="vote-tally-value vote-tally-no">{voteTallies.no}</span>
            </div>
            <div className="vote-tally-item vote-tally-total">
              <span className="vote-tally-label">Total Votes:</span>
              <span className="vote-tally-value">{voteTallies.total}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vote Counter below Cast Your Vote */}
      <div className="vote-counter-section">
        <div className="vote-counter-container">
          <div className="vote-counter-display">
            <span className="vote-counter-label">Total Votes:</span>
            <span className="vote-counter-number">{voteTallies.total}</span>
          </div>
          <div className="vote-counter-breakdown">
            <span className="vote-counter-yes">Yes: {voteTallies.yes}</span>
            <span className="vote-counter-separator">•</span>
            <span className="vote-counter-no">No: {voteTallies.no}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
