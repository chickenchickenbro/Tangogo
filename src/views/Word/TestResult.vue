<script setup>
import { useUserStore, useWordStore } from '@/stores'
import router from '@/router'

// 全局数据
const wordStore = useWordStore()
const userStore = useUserStore()
const uid = userStore.userInfo.uid

const goBack = () => {
  wordStore.getWordList(uid, {})
  wordStore.getCount(uid)
  router.push('/word/wordlist')
}
</script>

<template>
  <el-container>
    <!-- 总结 -->
    <el-header>
      <h1>
        Test completed with a total of
        <span>{{ wordStore.testResult.length }}</span> words
      </h1>
    </el-header>
    <!-- 单词 -->
    <el-main>
      <el-scrollbar>
        <el-table
          :show-header="false"
          :data="wordStore.testResult"
          :stripe="true"
          cell-class-name="table-cell"
          table-layout="auto"
        >
          <el-table-column label="word">
            <template #default="scope">
              <span class="table-word">{{ scope.row.word }}</span>
              <span class="table-pronunciation">{{
                scope.row.pronunciation ? `[${scope.row.pronunciation}]` : null
              }}</span>
            </template>
          </el-table-column>
          <el-table-column>
            <template #default="scope">
              <span class="table-paraphrase">{{ scope.row.paraphrase }}</span>
            </template>
          </el-table-column>
          <el-table-column label="status" width="180">
            <template #default="scope">
              <span>{{
                scope.row.testTime
                  ? `Test in ${Math.ceil((scope.row.testTime - Date.now()) / 86400000)} days`
                  : scope.row.status
              }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-main>
    <!-- 操作 -->
    <el-footer>
      <el-button type="primary" @click="goBack">Return to Word list</el-button>
    </el-footer>
  </el-container>
</template>

<style lang="scss" scoped>
.el-container {
  height: 100%;
  background-color: #fff;
  .el-header {
    height: auto;
    h1 {
      padding: 28px;
      text-align: center;
      font-size: 20px;
      font-weight: 400;
      color: #333;
      span {
        color: var(--el-color-primary);
        font-weight: 700;
        font-size: 22px;
      }
    }
  }
  .el-main {
    padding: 0 20px;
    :deep(.table-cell) {
      padding: 20px 0px;
      font-size: 16px;
      .table-word {
        margin-left: 60px;
      }
      .table-pronunciation {
        margin-left: 8px;
        color: #999;
      }
      .table-paraphrase {
        color: #666;
      }
    }
  }
  .el-footer {
    text-align: center;
    padding: 20px;
    height: auto;
    .el-button {
      font-size: 16px;
    }
  }
}
</style>
