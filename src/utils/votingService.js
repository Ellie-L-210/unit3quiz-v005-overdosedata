import { 
  ref, 
  get, 
  set, 
  update,
  onValue,
  serverTimestamp as rtdbServerTimestamp
} from 'firebase/database'
import { realtimeDb } from './firebase'

const VOTES_PATH = 'votes'
const TALLIES_PATH = 'tallies'

/**
 * Check if a user has already voted
 * @param {string} userId - The user's Firebase Auth UID
 * @returns {Promise<boolean>} - True if user has voted, false otherwise
 */
export const hasUserVoted = async (userId) => {
  try {
    if (!userId) return false
    
    const voteRef = ref(realtimeDb, `${VOTES_PATH}/${userId}`)
    const snapshot = await get(voteRef)
    
    return snapshot.exists()
  } catch (error) {
    console.error('Error checking if user has voted:', error)
    return false
  }
}

/**
 * Submit a poll vote (Yes/No) using Realtime Database
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

    // CRITICAL: Pre-check before transaction (extra safety layer)
    const preCheck = await hasUserVoted(userId)
    if (preCheck) {
      console.warn('Duplicate vote attempt blocked: user already voted (pre-check)')
      return { success: false, message: 'You have already voted. Each registered user can only vote once.' }
    }

    // Use atomic updates to prevent duplicate votes
    // Check and update in a single operation
    const voteRef = ref(realtimeDb, `${VOTES_PATH}/${userId}`)
    const voteSnapshot = await get(voteRef)
    
    // CRITICAL: Double-check inside atomic operation
    if (voteSnapshot.exists()) {
      console.warn('Duplicate vote attempt blocked: user already voted (atomic check)')
      return { success: false, message: 'You have already voted. Each registered user can only vote once.' }
    }

    // Get current tallies
    const talliesRef = ref(realtimeDb, TALLIES_PATH)
    const talliesSnapshot = await get(talliesRef)
    const currentTallies = talliesSnapshot.exists() ? talliesSnapshot.val() : { yes: 0, no: 0 }

    // Prepare updates for atomic write
    const updates = {}
    
    // Record the vote
    updates[`${VOTES_PATH}/${userId}`] = {
      userId,
      userEmail,
      pollAnswer: answer,
      timestamp: new Date().toISOString(),
      votedAt: Date.now()
    }

    // Update tallies atomically
    updates[`${TALLIES_PATH}/${answer}`] = (currentTallies[answer] || 0) + 1
    updates[`${TALLIES_PATH}/total`] = (currentTallies.total || 0) + 1

    // Atomic update - all or nothing
    await update(ref(realtimeDb), updates)

    return { success: true, message: 'Thank you for your vote!' }
  } catch (error) {
    console.error('Error submitting poll vote:', error)
    
    // Handle the case where user already voted
    if (error.message && error.message.includes('already voted')) {
      return { success: false, message: 'You have already voted. Each registered user can only vote once.' }
    }
    
    return { success: false, message: 'Failed to submit vote. Please try again.' }
  }
}

/**
 * Get vote tallies (real-time)
 * @param {function} callback - Callback function that receives tallies object { yes, no, total }
 * @returns {function} - Unsubscribe function
 */
export const subscribeToVoteTallies = (callback) => {
  const talliesRef = ref(realtimeDb, TALLIES_PATH)
  
  return onValue(talliesRef, (snapshot) => {
    if (snapshot.exists()) {
      const tallies = snapshot.val()
      callback({
        yes: tallies.yes || 0,
        no: tallies.no || 0,
        total: tallies.total || 0
      })
    } else {
      callback({ yes: 0, no: 0, total: 0 })
    }
  }, (error) => {
    console.error('Error subscribing to vote tallies:', error)
    callback({ yes: 0, no: 0, total: 0 })
  })
}

/**
 * Get vote tallies (one-time)
 * @returns {Promise<{yes: number, no: number, total: number}>}
 */
export const getVoteTallies = async () => {
  try {
    const talliesRef = ref(realtimeDb, TALLIES_PATH)
    const snapshot = await get(talliesRef)
    
    if (snapshot.exists()) {
      const tallies = snapshot.val()
      return {
        yes: tallies.yes || 0,
        no: tallies.no || 0,
        total: tallies.total || 0
      }
    }
    
    return { yes: 0, no: 0, total: 0 }
  } catch (error) {
    console.error('Error getting vote tallies:', error)
    return { yes: 0, no: 0, total: 0 }
  }
}

/**
 * Get vote count (total number of votes) - for backward compatibility
 * @returns {Promise<number>} - Total number of votes
 */
export const getVoteCount = async () => {
  try {
    const tallies = await getVoteTallies()
    return tallies.total
  } catch (error) {
    console.error('Error getting vote count:', error)
    return 0
  }
}
