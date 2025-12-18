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
      // Only check voting status if poll should be shown (Vote button clicked) and user is signed in
      if (showPoll && currentUser) {
        // Reset voting state when poll is shown
        setJustVoted(false)
        setSelectedAnswer(null)
        setError('')
        try {
          // Check if user has already voted
          const voted = await hasUserVoted(currentUser.uid)
          setHasVoted(voted)
        } catch (err) {
          console.error('Error checking voting status:', err)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }
    checkVotingStatus()
  }, [currentUser, showPoll])

  const handleVote = async (answer) => {
    if (!currentUser || submitting || justVoted) return

    setSelectedAnswer(answer)
    setJustVoted(true)
    setSubmitting(true)
    setError('')

    // Submit vote in the background
    try {
      const result = await submitPollVote(currentUser.uid, currentUser.email, answer)
      if (result.success) {
        setHasVoted(true)
        // Close poll after voting
        if (onClosePoll) {
          setTimeout(() => onClosePoll(), 0)
        }
      } else {
        // If submission fails, show error but keep thank you message
        setError(result.message)
        console.error('Vote submission failed:', result.message)
      }
    } catch (err) {
      // If submission fails, show error but keep thank you message
      setError('Failed to submit vote. Please try again.')
      console.error('Error submitting vote:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Only show poll if Vote button was clicked (showPoll is true) AND user is signed in
  if (!showPoll || !currentUser) {
    return null
  }

  // Show loading state while checking vote status
  if (loading) {
    return null
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

  // If user has already voted, show thank you message (check this BEFORE showing poll question)
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
              disabled={submitting || justVoted}
              className={`poll-button poll-button-yes ${selectedAnswer === 'yes' ? 'selected' : ''}`}
            >
              Yes
            </button>
            <button
              onClick={() => handleVote('no')}
              disabled={submitting || justVoted}
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

