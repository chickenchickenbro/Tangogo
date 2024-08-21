import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useUserStore } from '@/stores'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyAMbufu6ilFOLksTAXlhSZXirRWk_AM2KM',
  authDomain: 'onomatope-siryou.firebaseapp.com',
  projectId: 'onomatope-siryou',
  storageBucket: 'onomatope-siryou.appspot.com',
  messagingSenderId: '674008786652',
  appId: '1:674008786652:web:0478e90e7c87e97bc43619',
  measurementId: 'G-PYVGTCNY0E'
}

// Register service
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage()

// Monitor user
onAuthStateChanged(auth, (user) => {
  const userStore = useUserStore()
  if (user) {
    userStore.setUserInfo(user)
  } else {
    userStore.setUserInfo({})
  }
})
