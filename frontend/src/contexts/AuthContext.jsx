import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Send email verification
    if (userCredential.user) {
      await sendEmailVerification(userCredential.user)
    }
    return userCredential
  }

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    // Check if email is verified, if not, send verification email
    if (userCredential.user && !userCredential.user.emailVerified) {
      await sendEmailVerification(userCredential.user)
    }
    return userCredential
  }

  function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    signup,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

