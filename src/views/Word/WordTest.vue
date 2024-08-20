<script setup>
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { wordGetTestListService, wordPutTestResultService } from '@/api/word'
import { useUserStore, useWordStore } from '@/stores'
import { ref } from 'vue'
import router from '@/router'

// Global data
const wordStore = useWordStore()
const userStore = useUserStore()
const uid = userStore.userInfo.uid

// Get test list
const isVisible = ref(false)
const testList = ref()
const index = ref(0)
const getTestList = async () => {
  const data = JSON.parse(localStorage.getItem(wordStore.folderId))
  if (data) {
    testList.value = data.testList
    index.value = data.index
  } else {
    const res = await wordGetTestListService(uid, wordStore.folderId)
    testList.value = [...res]
  }
  isVisible.value = true
}
getTestList()

// Score & Change word order
const isChecked = ref(true)
let Score
const recordScore = (s) => {
  isChecked.value = false
  Score = s
}
const markWord = async () => {
  // Score
  testList.value[index.value].stage += Score
  // Change word order
  if (Score < 1) {
    const n = 6
    const l = testList.value.length
    const newIndex = index.value + n <= l - 1 ? index.value + n : l
    testList.value.splice(newIndex, 0, testList.value[index.value])
    testList.value.splice(index.value, 1)
  }
  if (Score === 1) {
    testList.value[index.value].isTested = true
    index.value += 1
  }
  localStorage.setItem(
    wordStore.folderId,
    JSON.stringify({ testList: testList.value, index: index.value })
  )

  // Comit test result to server
  if (index.value >= testList.value.length) {
    isVisible.value = false
    processWord()
    await wordPutTestResultService(uid, wordStore.folderId, testList.value)
    wordStore.setTestResult(testList.value)
    localStorage.removeItem(wordStore.folderId)
    router.push('/word/testresult')
  }
  isChecked.value = true
}

// Batch process words
const processWord = () => {
  const interval = [0, 1, 3, 7, 14, 30]
  testList.value.forEach((item) => {
    if (item.stage < 1) item.stage = 1
    if (item.stage > 5) {
      item.stage = null
      item.testTime = null
      item.status = 'Mastered'
    } else {
      item.stage = Math.floor(item.stage)
      item.testTime = Date.now() + interval[item.stage] * 24 * 3600 * 1000
      item.status = 'In progress'
    }
  })
}

// Exit midway
const quit = async () => {
  await ElMessageBox.confirm(
    'Are you sure to exit? Words that have been tested will be submitted.',
    'Exit the test',
    {
      confirmButtonText: 'Exit',
      cancelButtonText: 'Cancle',
      cancelButtonClass: 'is-plain'
    }
  )
  isVisible.value = false
  processWord()
  await wordPutTestResultService(uid, wordStore.folderId, testList.value)
  localStorage.removeItem(wordStore.folderId)
  router.push('/word/wordlist')
  wordStore.getWordList(uid, {})
  wordStore.getCount(uid)
}

// Mastered word
const Mastered = () => {
  Score = 1
  testList.value[index.value].stage = 5
  markWord()
}
</script>

<template>
  <el-container v-if="isVisible">
    <!-- header -->
    <el-header>
      <el-row align="middle">
        <el-col :span="6">
          <el-button :icon="ArrowLeft" @click="quit" text> Exit </el-button>
        </el-col>
        <el-col :span="13">
          <el-progress
            :percentage="(index / testList.length) * 100"
            :stroke-width="14"
          >
            <span>{{ index }}/{{ testList.length }}</span>
          </el-progress>
        </el-col>
      </el-row>
    </el-header>
    <!-- word content -->
    <el-main>
      <div class="test-content">
        <h1 class="word">{{ testList[index].word }}</h1>
        <span class="pronunciation">[{{ testList[index].pronunciation }}]</span>

        <p class="example">{{ testList[index].example }}</p>
        <p class="paraphrase" v-show="!isChecked">
          {{ testList[index].paraphrase }}
        </p>
      </div>
      <div class="test-button" v-if="isChecked">
        <el-button size="large" plain @click="recordScore(-1.5)"
          >Forgot</el-button
        >
        <el-button size="large" plain @click="recordScore(-1)">Vague</el-button>
        <el-button size="large" plain @click="recordScore(1)"
          >Remembered</el-button
        >
      </div>
      <div class="test-button" v-else>
        <el-button size="large" plain @click="markWord"
          >Next<el-icon class="el-icon--right"><ArrowRight /></el-icon
        ></el-button>
      </div>
    </el-main>
    <el-footer>
      <el-button text bg type="info" @click="Mastered()"
        >This word has been mastered</el-button
      >
    </el-footer>
  </el-container>
  <div v-loading="true" v-else class="loading"></div>
</template>

<style lang="scss" scoped>
.el-container {
  height: 100%;
  // header
  .el-header {
    margin-top: 20px;
    padding: 0;
    .el-button {
      font-size: 16px;
    }
  }
  // word content
  .el-main {
    margin: 16px 0px 0px;
    .test-content {
      min-height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      .word {
        font-weight: 400;
        font-size: 36px;
        color: #333;
      }
      .pronunciation {
        margin-bottom: 20px;
        font-size: 16px;
        color: #999;
      }
      .example {
        text-align: center;
        color: #333;
        font-size: 18px;
        margin-bottom: 20px;
      }
      .paraphrase {
        color: #666;
        font-size: 18px;
        padding: 4px 16px;
        background-color: var(--color-background);
        border-radius: 4px;
        margin-bottom: 20px;
      }
    }
    .test-button {
      display: flex;
      justify-content: center;
      gap: 8px;
      .el-button {
        font-size: 18px;
      }
    }
  }
  // footer
  .el-footer {
    display: flex;
    justify-content: center;
  }
}
.loading {
  width: 100%;
  height: 100%;
}
</style>
