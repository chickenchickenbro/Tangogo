import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  wordGetWordListService,
  wordGetSumOfTotalService,
  wordGetSumOfStudyService,
  wordGetSumOfTestService,
  wordGetSumOfUnderstoodService
} from '@/api/word'

export const useWordStore = defineStore(
  'word',
  () => {
    // word list
    const tableIsLoading = ref(false)
    const wordList = ref([])
    const folderId = ref()
    const setfolderId = (fId) => {
      folderId.value = fId
    }
    const pageNum = ref()
    const getWordList = async (uId, data, n = 1) => {
      tableIsLoading.value = true
      const res = await wordGetWordListService(uId, folderId.value, data)
      wordList.value = [...res]
      pageNum.value = n
      changePage(n)
      tableIsLoading.value = false
    }
    const pageSize = ref(15)
    const currentList = ref([])
    const changePage = (n) => {
      currentList.value = wordList.value.slice(
        (n - 1) * pageSize.value,
        n * pageSize.value
      )
    }
    const removeCurrentList = () => {
      currentList.value = []
    }

    // word count
    const count = ref({})
    const countIsLoading = ref(false)
    const getCount = async (uId) => {
      countIsLoading.value = true
      const resTotal = await wordGetSumOfTotalService(uId, folderId.value)
      count.value.total = resTotal.data().count
      const resStudy = await wordGetSumOfStudyService(uId, folderId.value)
      count.value.study = resStudy.data().count
      const resUnderstood = await wordGetSumOfUnderstoodService(
        uId,
        folderId.value
      )
      count.value.understood = resUnderstood.data().count
      const resTest = await wordGetSumOfTestService(uId, folderId.value)
      count.value.test = resTest.data().count
      countIsLoading.value = false
    }
    const removeCount = () => {
      count.value = []
    }

    // word test
    const testResult = ref([])
    const setTestResult = (data) => {
      testResult.value = data
    }
    return {
      wordList,
      tableIsLoading,
      countIsLoading,
      folderId,
      count,
      pageSize,
      currentList,
      pageNum,
      setfolderId,
      getWordList,
      getCount,
      changePage,
      removeCurrentList,
      removeCount,
      testResult,
      setTestResult
    }
  },
  {
    persist: true
  }
)
