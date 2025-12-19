import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { hasUserVoted, submitPollVote } from '../utils/votingService'
import './Poll.css'

export default function Poll({ showPoll = false, onClosePoll }) {
  const { currentUser } = useAuth()
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [justVoted, setJustVoted] = useState(false)

  // Silly and obscure question
  const pollQuestion = "Do you believe that if a rubber duck were to become the mayor of a small town, it would be required to wear a tiny top hat during official ceremonies, and if so, should the top hat be tax-deductible as a business expense?"

  useEffect(() => {
    const checkVotingStatus = async () => {
      // CRITICAL: Only check voting status if poll should be shown (Vote button clicked) and user is signed in
      // The poll should NEVER appear unless showPoll is explicitly set to true by the Vote button click
      if (showPoll && currentUser) {
        // Reset voting state when poll is shown
        setJustVoted(false)
        setSelectedAnswer(null)
        setError('')
        setLoading(true)
        try {
          // Rule 2: Check if user has already voted (persists across browser refresh, incognito, etc.)
          // Votes are tracked by Firebase Auth UID, which is tied to the user's account
          const voted = await hasUserVoted(currentUser.uid)
          setHasVoted(voted)
        } catch (err) {
          console.error('Error checking voting status:', err)
          // On error, assume user hasn't voted to be safe
          setHasVoted(false)
        } finally {
          setLoading(false)
        }
      } else {
        // If showPoll is false, ensure we're not loading
        setLoading(false)
        // Reset state when poll is closed
        if (!showPoll) {
          setHasVoted(false)
          setJustVoted(false)
          setSelectedAnswer(null)
          setError('')
        }
      }
    }
    checkVotingStatus()
  }, [currentUser, showPoll])

  const handleVote = async (answer) => {
    // MULTIPLE SAFEGUARDS: Prevent duplicate votes
    // 1. Check if already submitting or voted
    if (!currentUser || submitting || justVoted || hasVoted) {
      console.warn('Vote attempt blocked: already voted or submitting')
      return
    }

    // 2. Immediately disable UI to prevent double-clicks
    setSelectedAnswer(answer)
    setJustVoted(true)
    setSubmitting(true)
    setError('')

    // 3. Double-check with server before submitting (extra safety layer)
    try {
      const alreadyVotedCheck = await hasUserVoted(currentUser.uid)
      if (alreadyVotedCheck) {
        console.warn('Vote attempt blocked: user already voted (pre-check)')
        setHasVoted(true)
        setSubmitting(false)
        setJustVoted(false)
        return
      }

      // 4. Submit vote with transaction (atomic check-and-write on server)
      const result = await submitPollVote(currentUser.uid, currentUser.email, answer)
      
      if (result.success) {
        // 5. Mark as voted immediately to prevent any further attempts
        setHasVoted(true)
        // Close poll after voting
        if (onClosePoll) {
          setTimeout(() => onClosePoll(), 0)
        }
      } else {
        // If submission fails, check if it's because they already voted
        if (result.message.includes('already voted')) {
          setHasVoted(true)
        }
        setError(result.message)
        console.error('Vote submission failed:', result.message)
        // Reset state to allow retry if it was a different error
        if (!result.message.includes('already voted')) {
          setJustVoted(false)
        }
      }
    } catch (err) {
      // If error occurs, check if user has voted (might have succeeded despite error)
      try {
        const votedCheck = await hasUserVoted(currentUser.uid)
        if (votedCheck) {
          setHasVoted(true)
        }
      } catch (checkErr) {
        console.error('Error checking vote status after submission:', checkErr)
      }
      
      setError('Failed to submit vote. Please try again.')
      console.error('Error submitting vote:', err)
      // Only reset if we're sure they haven't voted
      if (!hasVoted) {
        setJustVoted(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // CRITICAL: Only show poll if Vote button was explicitly clicked (showPoll is true) AND user is registered
  // This prevents the poll from appearing randomly or automatically
  if (!showPoll) {
    return null
  }

  if (!currentUser) {
    return null
  }

  // Show loading state while checking vote status
  if (loading) {
    return (
      <div className="poll-overlay">
        <div className="poll-container">
          <div className="poll-card">
            <div className="vote-loading">Loading poll...</div>
          </div>
        </div>
      </div>
    )
  }

  // If user just voted, show thank you message
  if (justVoted) {
    return (
      <div className="poll-overlay">
        <div className="poll-container">
          <div className="poll-card poll-thank-you">
            <h2 className="poll-title">🦆 Thank you for your support!</h2>
            <p className="poll-thank-you-message">Your vote has been recorded.</p>
            <button 
              onClick={() => {
                setJustVoted(false)
                if (onClosePoll) onClosePoll()
              }}
              className="poll-close-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Rule 4: If user has already voted, show thank you message only (NO poll)
  if (hasVoted) {
    return (
      <div className="poll-overlay">
        <div className="poll-container">
          <div className="poll-card poll-thank-you">
            <h2 className="poll-title">🦆 Thank you for voting!</h2>
            <p className="poll-thank-you-message">Your vote has been recorded.</p>
            <button 
              onClick={() => {
                if (onClosePoll) onClosePoll()
              }}
              className="poll-close-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Rule 3: Display the poll if user is registered AND they haven't voted yet
  return (
    <div className="poll-overlay">
      <div className="poll-container">
        <div className="poll-card">
          <h2 className="poll-title">🗳️ Official Poll</h2>
          <p className="poll-question">{pollQuestion}</p>
          
          {error && <div className="poll-error">{error}</div>}
          
          <div className="poll-buttons">
            <button
              onClick={() => handleVote('yes')}
              disabled={submitting || justVoted || hasVoted}
              className={`poll-button poll-button-yes ${selectedAnswer === 'yes' ? 'selected' : ''}`}
            >
              Yes
            </button>
            <button
              onClick={() => handleVote('no')}
              disabled={submitting || justVoted || hasVoted}
              className={`poll-button poll-button-no ${selectedAnswer === 'no' ? 'selected' : ''}`}
            >
              No
            </button>
          </div>
          
          <p className="poll-note">Your vote will be recorded and cannot be changed.</p>
          {showPoll && (
            <button 
              onClick={() => {
                if (onClosePoll) onClosePoll()
              }}
              className="poll-close-button"
              style={{ marginTop: '1rem', background: '#64748b' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

