<script setup>
import { ref } from 'vue'
import { wordEditWordService } from '@/api/word'
import { useUserStore, useWordStore } from '@/stores'

// Global data
const userStore = useUserStore()
const wordStore = useWordStore()
const uid = userStore.userInfo.uid

// Form data
const wordForm = ref([])
const rules = ref({
  word: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  paraphrase: [{ required: true, message: '请输入名称', trigger: 'blur' }]
})

// Open dialog
const isVisible = ref(false)
const open = (row) => {
  isVisible.value = true
  wordForm.value = { ...row }
}

// Edit word
const editWord = async () => {
  wordForm.value.editTime = Date.now()
  await wordEditWordService(
    userStore.userInfo.uid,
    wordStore.folderId,
    wordForm.value.id,
    wordForm.value
  )
  ElMessage.success('编辑成功')
  isVisible.value = false
  wordStore.getWordList(uid, {}, wordStore.pageNum)
  wordStore.getCount(uid)
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog v-model="isVisible" title="Edit word" width="500">
    <!-- Form -->
    <el-form
      :model="wordForm"
      :rules="rules"
      :ref="getformRef"
      label-position="top"
      hide-required-asterisk
    >
      <div>
        <div class="word-and-paraphrase">
          <el-form-item prop="word" class="word" label="Word">
            <el-input v-model="wordForm.word"></el-input>
          </el-form-item>
          <el-form-item
            prop="pronunciation"
            class="pronunciation"
            label="pronunciation"
          >
            <el-input v-model="wordForm.pronunciation"></el-input>
          </el-form-item>
        </div>
        <el-form-item prop="paraphrase" label="Definition">
          <el-input v-model="wordForm.paraphrase"></el-input>
        </el-form-item>
        <el-form-item prop="example" label="Example sentence">
          <el-input
            v-model="wordForm.example"
            type="textarea"
            :rows="3"
          ></el-input>
        </el-form-item>
      </div>
    </el-form>

    <!-- Button -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="isVisible = false">Cancle</el-button>
        <el-button type="primary" @click="editWord"> Comfirm </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scpoed>
.word-and-paraphrase {
  display: flex;
  gap: 10px;
  .word {
    flex: 70%;
  }
  .pronunciation {
    flex: 30%;
  }
}
</style>
