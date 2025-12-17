import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { hasUserVoted, submitVote, getVoteCount } from '../utils/votingService'
import './VoteButton.css'

export default function VoteButton() {
  const { currentUser } = useAuth()
  const [hasVoted, setHasVoted] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [voteCount, setVoteCount] = useState(0)

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (currentUser) {
        setIsChecking(true)
        try {
          const voted = await hasUserVoted(currentUser.uid)
          setHasVoted(voted)
          
          // Get total vote count
          const count = await getVoteCount()
          setVoteCount(count)
        } catch (error) {
          console.error('Error checking vote status:', error)
        } finally {
          setIsChecking(false)
        }
      } else {
        setIsChecking(false)
      }
    }

    checkVoteStatus()
  }, [currentUser])

  const handleVote = async () => {
    if (!currentUser) {
      setMessage('Please register or sign in to vote.')
      return
    }

    if (hasVoted) {
      setMessage('You have already voted. Each registered user can only vote once.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const result = await submitVote(currentUser.uid, currentUser.email)
      setMessage(result.message)
      
      if (result.success) {
        setHasVoted(true)
        // Refresh vote count
        const count = await getVoteCount()
        setVoteCount(count)
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
      console.error('Error voting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="vote-section">
        <p className="vote-message">Please register or sign in to cast your vote.</p>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="vote-section">
        <div className="vote-loading">Checking vote status...</div>
      </div>
    )
  }

  return (
    <div className="vote-section">
      <div className="vote-container">
        <h3 className="vote-title">Cast Your Vote</h3>
        <p className="vote-subtitle">Support Senator Reginald P. Bottleworth III</p>
        
        {hasVoted ? (
          <div className="vote-status voted">
            <div className="vote-icon">✓</div>
            <p className="vote-status-text">Thank you for voting!</p>
            <p className="vote-status-subtext">You have successfully cast your vote.</p>
          </div>
        ) : (
          <button
            onClick={handleVote}
            disabled={isSubmitting || hasVoted}
            className="vote-button"
          >
            {isSubmitting ? 'Submitting Vote...' : 'Vote Now'}
          </button>
        )}

        {message && (
          <div className={`vote-message ${hasVoted ? 'success' : message.includes('already') ? 'error' : ''}`}>
            {message}
          </div>
        )}

        <div className="vote-count">
          <span className="vote-count-label">Total Votes:</span>
          <span className="vote-count-value">{voteCount}</span>
        </div>
      </div>
    </div>
  )
}

