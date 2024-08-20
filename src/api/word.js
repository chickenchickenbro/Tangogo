import { db, userStateMonitor } from '@/utils/firebase'
import { ElMessage } from 'element-plus'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  where,
  writeBatch,
  getCountFromServer
} from 'firebase/firestore'

// word list
export const wordAddFolderService = async (uId, data) => {
  try {
    await userStateMonitor()
    await addDoc(collection(db, 'users', uId, 'wordfolders'), data)
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordGetFolderService = async (uId) => {
  try {
    const q = query(
      collection(db, 'users', uId, 'wordfolders'),
      orderBy('creatTime', 'desc')
    )
    const res = await getDocs(q)
    const arr = []
    res.forEach((item) => {
      arr.push({
        id: item.id,
        ...item.data()
      })
    })
    return arr
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordEditFolderService = async (uId, data) => {
  try {
    await userStateMonitor()
    await updateDoc(doc(db, 'users', uId, 'wordfolders', data.id), data)
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordDeleteFolderService = async (uId, folderId) => {
  try {
    await userStateMonitor()
    await deleteDoc(doc(db, 'users', uId, 'wordfolders', folderId))
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}

// word
export const wordGetWordListService = async (uId, folderId, data) => {
  try {
    const col = collection(db, 'users', uId, 'wordfolders', folderId, 'words')
    const wh1 = where('status', '==', data.status)
    const wh2 = where('word', '==', data.word)
    const ord = orderBy('creatTime', 'desc')
    const queryArr = [col, ord]
    if (data.status) queryArr.push(wh1)
    if (data.word) queryArr.push(wh2)
    const q = query(...queryArr)
    const res = await getDocs(q)
    const arr = []
    res.forEach((item) => {
      arr.push({
        id: item.id,
        ...item.data()
      })
    })
    return arr
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordAddWordService = async (uId, folderId, data) => {
  try {
    const batch = writeBatch(db)
    data.forEach(async (item) => {
      const d = doc(
        collection(db, 'users', uId, 'wordfolders', folderId, 'words')
      )
      item.testTime = 0
      item.creatTime = Date.now()
      item.stage = 0
      item.status = 'Not started'
      batch.set(d, item)
    })
    await batch.commit()
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordDeleteWordService = async (uId, folderId, wordId) => {
  try {
    await deleteDoc(
      doc(db, 'users', uId, 'wordfolders', folderId, 'words', wordId)
    )
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordEditWordService = async (uId, folderId, wordId, data) => {
  try {
    await updateDoc(
      doc(db, 'users', uId, 'wordfolders', folderId, 'words', wordId),
      data
    )
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}

// wordCount
export const wordGetSumOfTotalService = async (uId, folderId) => {
  try {
    const res = await getCountFromServer(
      collection(db, 'users', uId, 'wordfolders', folderId, 'words')
    )
    return res
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordGetSumOfStudyService = async (uId, folderId) => {
  try {
    const q = query(
      collection(db, 'users', uId, 'wordfolders', folderId, 'words'),
      where('status', '==', 'In progress')
    )
    const res = await getCountFromServer(q)
    return res
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordGetSumOfUnderstoodService = async (uId, folderId) => {
  try {
    const q = query(
      collection(db, 'users', uId, 'wordfolders', folderId, 'words'),
      where('status', '==', 'Mastered')
    )
    const res = await getCountFromServer(q)
    return res
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
const now = new Date()
const endOfDay = now.setHours(23, 59, 59, 999)
export const wordGetSumOfTestService = async (uId, folderId) => {
  try {
    const col = collection(db, 'users', uId, 'wordfolders', folderId, 'words')
    const q = query(col, where('testTime', '<=', endOfDay))
    const res = await getCountFromServer(q)
    return res
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}

// wordTest
export const wordGetTestListService = async (uId, folderId) => {
  try {
    const col = collection(db, 'users', uId, 'wordfolders', folderId, 'words')
    const q = query(
      col,
      where('testTime', '<=', endOfDay),
      orderBy('creatTime', 'desc')
    )
    const res = await getDocs(q)
    const arr = []
    res.forEach((item) => {
      arr.push({
        id: item.id,
        ...item.data()
      })
    })
    arr.forEach((item) => {
      item.isTested = false
    })
    return arr
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
export const wordPutTestResultService = async (uId, folderId, data) => {
  try {
    const batch = writeBatch(db)
    data.forEach(async (item) => {
      if (item.isTested === true) {
        const d = doc(
          db,
          'users',
          uId,
          'wordfolders',
          folderId,
          'words',
          item.id
        )
        batch.update(d, item)
      }
    })
    await batch.commit()
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
