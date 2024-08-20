import { db, auth, storage } from '@/utils/firebase'
import { setDoc, doc } from 'firebase/firestore'
import {
  updateProfile,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// login & signup
export const UserSignupService = async (email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password)
    return res
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      ElMessage.error('This account already in use, please change')
    } else {
      ElMessage.error(`${error.message}`)
    }
    return Promise.reject(error)
  }
}
export const UserLoginService = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password)
    return res
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const UserAddUserService = async (id, userData) => {
  try {
    await setDoc(doc(db, 'users', id), userData)
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}

// user information
export const userUpdateProfileService = async (displayName, photoURL) => {
  try {
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL
    })
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const userUploadAvatarService = async (name, file) => {
  try {
    const storageRef = ref(storage, `avatar/${name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    return url
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const userResetPasswordService = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
