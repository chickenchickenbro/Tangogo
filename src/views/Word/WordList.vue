<script setup>
import { Edit, Delete, Search, Reading, Plus } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import AddWord from './components/AddWord.vue'
import EditWord from './components/EditWord.vue'
import { useUserStore, useWordStore } from '@/stores'
import { wordDeleteWordService } from '@/api/word'
import router from '@/router'
onMounted(() => {
  // event-listening
  window.addEventListener('clearSearch', clearSearch)
})

// Global data
const wordStore = useWordStore()
const userStore = useUserStore()
const uid = userStore.userInfo.uid

// Bulk Add words
const addWordRef = ref()
const openWordForm = () => {
  addWordRef.value.open()
}
const handleSuccess = () => {
  wordStore.getWordList(uid, {})
  wordStore.getCount(uid)
}

// Edit word
const editWordRef = ref()
const openEditWord = (row) => {
  editWordRef.value.open(row)
}

// Delete word
const popComfirm = async (row) => {
  await wordDeleteWordService(uid, wordStore.folderId, row.id)
  ElMessage.success('Delete successfully')
  wordStore.getWordList(uid, {}, wordStore.pageNum)
  wordStore.getCount(uid)
}

// Filter word list
const statusFilter = ref()
const wordFilter = ref()
const handleFilter = () => {
  const data = {
    status: statusFilter.value,
    word: wordFilter.value
  }
  wordStore.getWordList(uid, data)
}

// Clear filter conditions
const clearSearch = () => {
  statusFilter.value = ''
  wordFilter.value = ''
}

// Start test
const studyWord = () => {
  router.push('/word/wordtest')
}

// Calculate next test date
const testDay = (row) => {
  const now = Date.now()
  if (!row.testTime) {
    return row.status
  } else if (row.testTime <= now) {
    return 'Test today'
  } else {
    return `Test in ${Math.ceil((row.testTime - Date.now()) / 86400000)}days`
  }
}

// Handle pagination
const changePage = (n) => {
  wordStore.changePage(n)
}
</script>

<template>
  <div class="page-wrapper">
    <!-- header -->
    <div class="word-header" v-loading="wordStore.countIsLoading">
      <el-statistic title="All words" :value="wordStore.count.total" />
      <el-statistic
        title="Mastered words"
        :value="wordStore.count.understood"
      />
      <el-statistic title="Words in progress" :value="wordStore.count.study" />
      <el-statistic
        title="Word test today"
        :value="wordStore.count.test"
        value-style="color:var(--el-color-primary);font-weight:700;"
      />
      <el-button
        type="primary"
        @click="studyWord"
        :disabled="wordStore.count.test === 0"
        :icon="Reading"
        >Start test</el-button
      >
    </div>

    <!-- search bar -->
    <div class="word-bar">
      <el-form inline>
        <el-form-item label="Learning status">
          <el-select
            placeholder="All"
            style="width: 120px"
            v-model="statusFilter"
          >
            <el-option label="All"></el-option>
            <el-option label="Not started" value="Not started"></el-option>
            <el-option label="In progress" value="In progress"></el-option>
            <el-option label="Mastered" value="Mastered"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            style="width: 240px"
            placeholder="Please enter the word"
            :prefix-icon="Search"
            v-model="wordFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button plain @click="handleFilter" :icon="Search"
            >Search</el-button
          >
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="openWordForm" :icon="Plus"
        >Bulk Add words</el-button
      >
    </div>

    <!-- word list -->
    <el-table
      :show-header="false"
      :data="wordStore.currentList"
      :stripe="true"
      table-layout="auto"
      cell-class-name="word-list-cell"
      v-loading="wordStore.tableIsLoading"
    >
      <el-table-column label="word">
        <template #default="scope">
          <div>
            <span>{{ scope.row.word }}</span>
            <span class="table-pronunciation">{{
              scope.row.pronunciation ? `[${scope.row.pronunciation}]` : null
            }}</span>
          </div>
          <span class="table-paraphrase">{{ scope.row.paraphrase }}</span>
        </template>
      </el-table-column>
      <el-table-column label="example">
        <template #default="scope">
          <span>{{ scope.row.example }}</span>
        </template>
      </el-table-column>
      <el-table-column label="status">
        <template #default="{ row }">
          <span>{{ testDay(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="operation" width="100">
        <template #default="{ row }">
          <el-button
            :icon="Edit"
            circle
            plain
            @click="openEditWord(row)"
          ></el-button>
          <el-popconfirm
            title="Are you sure to delete?"
            confirm-button-text="Comfirm"
            cancel-button-text="Cancle"
            @confirm="popComfirm(row)"
            :width="400"
            hide-icon
            hide-after="0"
            placement="top-end"
          >
            <template #reference>
              <el-button :icon="Delete" circle plain></el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty
          description="Nothing at all. Please add a word first"
          image-size="100"
        />
      </template>
    </el-table>
    <div class="pagination">
      <el-pagination
        layout="prev, pager, next"
        background
        :page-size="wordStore.pageSize"
        v-model:current-page="wordStore.pageNum"
        :total="wordStore.wordList.length"
        @current-change="changePage"
      />
    </div>
  </div>
  <!-- add-word dialog -->
  <add-word ref="addWordRef" @success="handleSuccess"></add-word>

  <!-- edit-word dialog -->
  <edit-word ref="editWordRef" @success="handleSuccess"></edit-word>
</template>

<style lang="scss" scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  // header
  .word-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px 24px;
    border-bottom: var(--color-line) 1px solid;
  }
  // search bar
  .word-bar {
    background-color: #ffffff;
    padding: 16px 8px 16px;
    display: flex;
    justify-content: space-between;
    .el-form-item {
      margin: 0;
      margin-right: 16px;
    }
  }
  // word list
  :deep(.word-list-cell) {
    padding: 20px 0px;
    font-size: 14px;
    .table-paraphrase {
      color: #999;
    }
    .table-pronunciation {
      margin-left: 8px;
      color: #999;
    }
  }
  .pagination {
    display: flex;
    justify-content: end;
    padding: 12px 12px;
    background-color: #fff;
  }
}
</style>
