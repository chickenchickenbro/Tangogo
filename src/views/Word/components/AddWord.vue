<script setup>
import { Plus, Close } from '@element-plus/icons-vue'
import { ref, watch, onBeforeUpdate } from 'vue'
import { wordAddWordService } from '@/api/word'
import { useUserStore, useWordStore } from '@/stores'
import { dictionaryGetWordService } from '@/api/dictionary'
import { ElMessage } from 'element-plus'

// Global data
const userStore = useUserStore()
const uid = userStore.userInfo.uid
const wordStore = useWordStore()

// Open dialog
const isVisible = ref(false)
const open = () => {
  isVisible.value = true
}

// Form data
const wordForm = ref([])
const rules = ref({
  word: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  paraphrase: [{ required: true, message: '请输入名称', trigger: 'blur' }]
})

// Add/Delete a word
const addForm = (word, paraphrase, pronunciation, example) => {
  wordForm.value.push({
    word,
    paraphrase,
    pronunciation,
    example
  })
  setTimeout(() => {
    automaticScroll()
  }, 100)
}
const removeForm = (index) => {
  wordForm.value.splice(index, 1)
}
const iconIsVisible = ref()

// Bulk Add
const isLoading = ref(false)
const formRef = ref([])
const getformRef = (el) => {
  formRef.value.push(el)
}
watch(
  wordForm,
  () => {
    formRef.value = []
  },
  { deep: true }
)
const submitForm = async () => {
  if (!wordForm.value[0]) {
    ElMessage.error('Please add a word first')
    return
  }
  await Promise.all(
    formRef.value.map(async (item) => {
      await item.validate()
    })
  )
  isLoading.value = true
  await wordAddWordService(uid, wordStore.folderId, wordForm.value).catch(
    () => {
      isLoading.value = false
    }
  )
  wordForm.value = []
  ElMessage.success('Bulk Add successfully')
  isLoading.value = false
  isVisible.value = false
  wordStore.getWordList(uid, {})
  wordStore.getCount(uid)
}

// Exit Bulk Add
const handleCancle = async () => {
  await ElMessageBox.confirm(
    'Are you sure you want to exit? It will clear all words that have been created',
    'Exit Bulk Add',
    {
      confirmButtonText: 'Comfirm',
      cancelButtonText: 'Cancle',
      cancelButtonClass: 'is-plain'
    }
  )
  wordForm.value = []
  isVisible.value = false
}

// Search word in dictionary
const searchResult = ref({})
const isShow = ref(0)
const handleSearch = async (data) => {
  isShow.value = 0
  const res = await dictionaryGetWordService(data)
  if (!res.data.words[0]) {
    isShow.value = null
    return
  }
  searchResult.value = res.data.words[0]
  isShow.value = 1
  checkList.value = []
}
const searchRef = ref()

// Add search result
const checkList = ref([])
const addWordToList = () => {
  const word =
    searchResult.value.reading.kanji || searchResult.value.reading.kana
  const paraphrase = checkList.value.join(';')
  const pronunciation = searchResult.value.reading.kana
  const example = ''
  addForm(word, paraphrase, pronunciation, example)
  searchRef.value.closeSearch()
}

// Automatically scroll to bottom after add word
const automaticScroll = () => {
  const model = document.querySelector('.el-drawer__body')
  model.scrollTop = model.scrollHeight
}

// Clear search bar when close dialog
onBeforeUpdate(() => {
  searchRef.value.resetInputValue()
})

defineExpose({
  open
})
</script>

<template>
  <el-drawer
    v-model="isVisible"
    :size="500"
    :show-close="false"
    @click="searchRef.handleClickOutside()"
  >
    <!-- Search bar -->
    <template #header>
      <com-search @handleSearch="handleSearch" ref="searchRef">
        <div v-loading="true" v-if="isShow === 0" style="height: 24px"></div>
        <div v-else-if="isShow === 1">
          <div class="result-header">
            <div>
              <span>{{
                searchResult.reading?.kanji || searchResult.reading?.kana
              }}</span>
              <span class="result-header-pronunciation"
                >[{{ searchResult.reading?.kana }}]</span
              >
            </div>
          </div>
          <div style="color: #999">Please select the definition you need</div>
          <el-scrollbar max-height="300px">
            <el-checkbox-group v-model="checkList">
              <el-checkbox
                :value="item.glosses.join('/ ')"
                :label="item.glosses.join('/ ')"
                size="large"
                class="result-paraphrase"
                v-for="(item, index) in searchResult.senses"
                :key="index"
                border
              />
            </el-checkbox-group>
          </el-scrollbar>
          <el-button
            :icon="Plus"
            type="primary"
            @click="addWordToList"
            style="margin-top: 24px; width: 100%"
            >Add this word</el-button
          >
        </div>
        <el-empty description="No search results" v-else image-size="50" />
      </com-search>
    </template>

    <!-- Word form -->
    <div
      v-for="(item, index) in wordForm"
      :key="index"
      class="word-card"
      @mouseover="iconIsVisible = index"
      @mouseleave="iconIsVisible = null"
    >
      <el-form
        :model="item"
        :rules="rules"
        :ref="getformRef"
        label-position="top"
        hide-required-asterisk
      >
        <div>
          <div class="word-and-paraphrase">
            <el-form-item prop="word" class="Word" label="word">
              <el-input v-model="item.word"></el-input>
            </el-form-item>
            <el-form-item
              prop="Pronunciation"
              label="pronunciation"
              class="pronunciation"
            >
              <el-input v-model="item.pronunciation"></el-input>
            </el-form-item>
          </div>
          <el-form-item prop="paraphrase" label="Definition">
            <el-input v-model="item.paraphrase"></el-input>
          </el-form-item>
          <el-form-item prop="example" label="Example sentence">
            <el-input
              v-model="item.example"
              type="textarea"
              :rows="3"
            ></el-input>
          </el-form-item>
          <el-button
            @click="removeForm(index)"
            class="delete-word-card"
            plain
            circle
            v-show="iconIsVisible === index"
            ><el-icon :size="16"><Close /></el-icon
          ></el-button>
        </div>
      </el-form>
    </div>
    <el-button
      :icon="Plus"
      @click="addForm('', '', '', '')"
      class="add-word-card"
      size="large"
      plain
      >Add a word</el-button
    >

    <!-- 底部按钮 -->
    <template #footer>
      <el-button @click="handleCancle">Cancle</el-button>
      <el-button type="primary" @click="submitForm" :loading="isLoading"
        >Bulk Add</el-button
      >
    </template>
  </el-drawer>
</template>

<style lang="scss" scoped>
// Search bar
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  &-pronunciation {
    color: #999;
    margin-left: 8px;
  }
}
.result-paraphrase {
  border-radius: 4px;
  margin-top: 12px;
  white-space: normal;
  margin-right: 0;
  width: 100%;
}

// Word
.word-card {
  position: relative;
  padding: 16px;
  background-color: var(--color-background);
  border-radius: 4px;
  margin-bottom: 15px;
  .word-and-paraphrase {
    display: flex;
    gap: 8px;
    .word {
      flex: 50%;
    }
    .pronunciation {
      flex: 50%;
    }
  }
  .delete-word-card {
    position: absolute;
    top: -12px;
    right: -12px;
  }
}
.add-word-card {
  width: 100%;
}
</style>
<style lang="scss">
.el-drawer__header {
  padding-bottom: 16px;
  margin-bottom: 0;
}
</style>
