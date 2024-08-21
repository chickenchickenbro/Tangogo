<script setup>
import { ref } from 'vue'
import { wordAddFolderService, wordEditFolderService } from '@/api/word'
import { useUserStore } from '@/stores'

// Global data
const userStore = useUserStore()
const uid = userStore.userInfo.uid

// Form data
const folderForm = ref({
  folderName: ''
})
const folderRule = ref({
  folderName: [
    {
      required: true,
      message: 'Please enter the name of word list',
      trigger: 'blur'
    }
  ]
})

// Open dialog
const isVisible = ref(false)
const open = (data) => {
  isVisible.value = true
  folderForm.value = { ...data }
}

// hanndle add/edit wordlist
const emit = defineEmits(['success'])
const formRef = ref()
const handleAddFolder = async () => {
  await formRef.value.validate()
  if (folderForm.value.id) {
    folderForm.value.editTime = Date.now()
    await wordEditFolderService(uid, folderForm.value)
    ElMessage.success('Edit successfully')
    emit('success', 'edit')
  } else {
    folderForm.value.creatTime = Date.now()
    await wordAddFolderService(uid, folderForm.value)
    ElMessage.success('Add successfully')
    emit('success', 'add')
  }
  isVisible.value = false
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    v-model="isVisible"
    :title="folderForm.id ? 'Edit word list' : 'Add word list'"
    width="472"
    destroy-on-close
  >
    <el-form
      :model="folderForm"
      :rules="folderRule"
      ref="formRef"
      label-position="top"
      hide-required-asterisk
    >
      <el-form-item label="Name of word list" prop="folderName">
        <el-input v-model="folderForm.folderName" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button plain @click="isVisible = false">Cancle</el-button>
        <el-button type="primary" @click="handleAddFolder"> Comfirm </el-button>
      </div>
    </template>
  </el-dialog>
</template>
