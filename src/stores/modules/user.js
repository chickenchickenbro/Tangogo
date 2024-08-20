import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    // token
    const token = ref('')
    const setToken = (newToken) => {
      token.value = newToken
    }
    const removeToken = () => {
      token.value = ''
    }

    // user info
    const userInfo = ref({})
    const setUserInfo = (user) => {
      userInfo.value = { ...user }
    }
    return {
      token,
      setToken,
      removeToken,
      userInfo,
      setUserInfo
    }
  },
  {
    persist: true
  }
)
