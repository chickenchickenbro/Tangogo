<script setup>
import { Edit } from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
import { ref } from 'vue'
import { useUserStore } from '@/stores'
import { userUpdateProfileService, userUploadAvatarService } from '@/api/user'
import { ElMessage } from 'element-plus'
import { auth } from '@/utils/firebase'

// Global data
const userStore = useUserStore()
const uid = userStore.userInfo.uid

// Form data
const form = ref({
  displayName: '',
  email: '',
  avatar: ''
})
const rule = ref({
  displayName: [
    { required: true, message: 'Please enter your nickname', trigger: 'blur' },
    {
      max: 15,
      message: 'Nickname must be less than 16 characters.',
      trigger: 'blur'
    }
  ],
  email: [
    {
      required: true,
      message: 'Please enter your email address',
      trigger: 'blur'
    },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
  ]
})

// Open dialog
const isVisible = ref(false)
const open = () => {
  avatarUrl.value = userStore.userInfo.photoURL
  form.value.displayName = userStore.userInfo.displayName
  form.value.email = userStore.userInfo.email
  isVisible.value = true
}

// Upload avatar
const avatarUrl = ref()
const uploadAvatar = (file) => {
  avatarUrl.value = URL.createObjectURL(file.raw)
  form.value.avatar = file.raw
}

// Submit data
const formRef = ref()
const isLoading = ref(false)
const updateUserInfo = async () => {
  await formRef.value.validate()
  isLoading.value = true
  let url = userStore.userInfo.photoURL
  if (form.value.avatar) {
    url = await userUploadAvatarService(uid, form.value.avatar)
  }
  await userUpdateProfileService(form.value.displayName, url).catch(() => {
    isLoading.value = false
  })
  const user = auth.currentUser
  userStore.setUserInfo(user)
  ElMessage.success('Save successfully')
  isLoading.value = false
  isVisible.value = false
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    v-model="isVisible"
    title="Edit profile"
    width="360"
    destroy-on-close
  >
    <el-form
      :model="form"
      :rules="rule"
      ref="formRef"
      hide-required-asterisk
      label-position="top"
      v-loading="isLoading"
    >
      <div class="avatar">
        <el-avatar
          :size="120"
          :src="avatarUrl || userStore.userInfo.photoURL || avatar"
        />
        <el-upload
          :show-file-list="false"
          :auto-upload="false"
          :on-change="uploadAvatar"
        >
          <template #trigger>
            <el-button :icon="Edit" round>Upload avatar</el-button>
          </template>
        </el-upload>
      </div>
      <el-form-item label="Nickname" prop="displayName">
        <el-input v-model="form.displayName"> </el-input>
      </el-form-item>
      <el-form-item label="Email address" prop="email">
        <el-input v-model="form.email" disabled> </el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="updateUserInfo" :loading="isLoading">
          Save edits
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.avatar {
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0px;
  gap: 6px;
}
.dialog-footer {
  display: flex;
  justify-content: center;
  .el-button {
    width: 100%;
  }
}
</style>
