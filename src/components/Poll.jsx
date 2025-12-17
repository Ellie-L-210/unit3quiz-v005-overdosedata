import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { hasUserVoted, submitPollVote } from '../utils/votingService'
import './Poll.css'

export default function Poll() {
  const { currentUser } = useAuth()
  const [hasVoted, setHasVoted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [shouldShowPoll, setShouldShowPoll] = useState(false)
  const [justVoted, setJustVoted] = useState(false)

  // Silly and obscure question
  const pollQuestion = "Do you believe that if a rubber duck were to become the mayor of a small town, it would be required to wear a tiny top hat during official ceremonies, and if so, should the top hat be tax-deductible as a business expense?"

  useEffect(() => {
    const checkVotingStatus = async () => {
      if (currentUser) {
        try {
          // Check if user came from "Register to Vote" flow
          const fromRegisterToVote = sessionStorage.getItem('fromRegisterToVote') === 'true'
          
          // Check if user has already voted
          const voted = await hasUserVoted(currentUser.uid)
          setHasVoted(voted)
          
          // Only show poll if:
          // 1. User came from "Register to Vote" button
          // 2. User has not voted before
          setShouldShowPoll(fromRegisterToVote && !voted)
        } catch (err) {
          console.error('Error checking voting status:', err)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
        setShouldShowPoll(false)
      }
    }
    checkVotingStatus()
  }, [currentUser])

  const handleVote = async (answer) => {
    if (!currentUser || submitting) return

    setSubmitting(true)
    setError('')
    setSelectedAnswer(answer)

    try {
      const result = await submitPollVote(currentUser.uid, currentUser.email, answer)
      if (result.success) {
        setHasVoted(true)
        setShouldShowPoll(false)
        setJustVoted(true)
        // Clear the flag after voting
        sessionStorage.removeItem('fromRegisterToVote')
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('Failed to submit vote. Please try again.')
      console.error('Error submitting vote:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return null
  }

  // Check if user came from "Register to Vote" flow
  const fromRegisterToVote = sessionStorage.getItem('fromRegisterToVote') === 'true'

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

  // If user came from "Register to Vote", is logged in, and has already voted (but didn't just vote), show thank you message
  if (fromRegisterToVote && currentUser && hasVoted && !justVoted) {
    return (
      <div className="poll-overlay">
        <div className="poll-container">
          <div className="poll-card poll-thank-you">
            <h2 className="poll-title">🦆 Thank you for voting!</h2>
            <p className="poll-thank-you-message">Your vote has been recorded.</p>
            <button 
              onClick={() => {
                sessionStorage.removeItem('fromRegisterToVote')
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

  // Only show poll if user came from "Register to Vote" and hasn't voted
  if (!shouldShowPoll || hasVoted) {
    return null
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
              disabled={submitting}
              className={`poll-button poll-button-yes ${selectedAnswer === 'yes' ? 'selected' : ''}`}
            >
              {submitting && selectedAnswer === 'yes' ? 'Submitting...' : 'Yes'}
            </button>
            <button
              onClick={() => handleVote('no')}
              disabled={submitting}
              className={`poll-button poll-button-no ${selectedAnswer === 'no' ? 'selected' : ''}`}
            >
              {submitting && selectedAnswer === 'no' ? 'Submitting...' : 'No'}
            </button>
          </div>
          
          <p className="poll-note">Your vote will be recorded and cannot be changed.</p>
        </div>
      </div>
    </div>
  )
}

