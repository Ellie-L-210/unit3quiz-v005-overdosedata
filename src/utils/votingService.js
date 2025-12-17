import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

const VOTES_COLLECTION = 'votes'

/**
 * Check if a user has already voted
 * @param {string} userId - The user's Firebase Auth UID
 * @returns {Promise<boolean>} - True if user has voted, false otherwise
 */
export const hasUserVoted = async (userId) => {
  try {
    if (!userId) return false
    
    const voteDocRef = doc(db, VOTES_COLLECTION, userId)
    const voteDoc = await getDoc(voteDocRef)
    
    return voteDoc.exists()
  } catch (error) {
    console.error('Error checking if user has voted:', error)
    return false
  }
}

/**
 * Submit a vote for a user
 * @param {string} userId - The user's Firebase Auth UID
 * @param {string} userEmail - The user's email address
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const submitVote = async (userId, userEmail) => {
  try {
    if (!userId || !userEmail) {
      return { success: false, message: 'User ID and email are required' }
    }

    // Check if user has already voted
    const alreadyVoted = await hasUserVoted(userId)
    if (alreadyVoted) {
      return { success: false, message: 'You have already voted. Each registered user can only vote once.' }
    }

    // Submit the vote
    const voteDocRef = doc(db, VOTES_COLLECTION, userId)
    await setDoc(voteDocRef, {
      userId,
      userEmail,
      votedAt: serverTimestamp(),
      timestamp: new Date().toISOString()
    })

    return { success: true, message: 'Thank you for your vote!' }
  } catch (error) {
    console.error('Error submitting vote:', error)
    return { success: false, message: 'Failed to submit vote. Please try again.' }
  }
}

/**
 * Submit a poll vote (Yes/No)
 * @param {string} userId - The user's Firebase Auth UID
 * @param {string} userEmail - The user's email address
 * @param {string} answer - 'yes' or 'no'
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const submitPollVote = async (userId, userEmail, answer) => {
  try {
    if (!userId || !userEmail) {
      return { success: false, message: 'User ID and email are required' }
    }

    if (answer !== 'yes' && answer !== 'no') {
      return { success: false, message: 'Invalid answer. Must be "yes" or "no".' }
    }

    // Check if user has already voted
    const alreadyVoted = await hasUserVoted(userId)
    if (alreadyVoted) {
      return { success: false, message: 'You have already voted. Each registered user can only vote once.' }
    }

    // Submit the poll vote
    const voteDocRef = doc(db, VOTES_COLLECTION, userId)
    await setDoc(voteDocRef, {
      userId,
      userEmail,
      pollAnswer: answer,
      votedAt: serverTimestamp(),
      timestamp: new Date().toISOString()
    })

    return { success: true, message: 'Thank you for your vote!' }
  } catch (error) {
    console.error('Error submitting poll vote:', error)
    return { success: false, message: 'Failed to submit vote. Please try again.' }
  }
}

/**
 * Get vote count (total number of votes)
 * @returns {Promise<number>} - Total number of votes
 */
export const getVoteCount = async () => {
  try {
    const votesQuery = query(collection(db, VOTES_COLLECTION))
    const querySnapshot = await getDocs(votesQuery)
    return querySnapshot.size
  } catch (error) {
    console.error('Error getting vote count:', error)
    return 0
  }
}

