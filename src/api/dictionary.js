import axios from 'axios'

export const dictionaryGetWordService = async (word) => {
  try {
    const res = await axios.post('https://jotoba.de/api/search/words', {
      query: word,
      language: 'English',
      no_english: false
    })
    return res
  } catch (error) {
    ElMessage.error(`${error.message}`)
    return Promise.reject(error)
  }
}
