<script setup>
import { ref } from 'vue'
import { userResetPasswordService } from '@/api/user'
import { useUserStore } from '@/stores'

// Global data
const userStore = useUserStore()

// Form data
const form = ref({
  email: ''
})
const rule = ref({
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
const isSend = ref(true)
const open = () => {
  isSend.value = true
  form.value.email = userStore.userInfo.email
  isVisible.value = true
}

// Send email
const isLoading = ref(false)
const time = ref()
const isDisabled = ref(false)
const timer = () => {
  time.value = 60
  isDisabled.value = true
  const n = setInterval(() => {
    time.value--
    if (time.value < 1) {
      clearInterval(n)
      isDisabled.value = false
    }
  }, 1000)
}
const sendEmail = async () => {
  timer()
  isLoading.value = true
  await userResetPasswordService(userStore.userInfo.email).catch(() => {
    isLoading.value = false
  })
  isLoading.value = false
  isSend.value = false
}

defineExpose({
  open
})
</script>

<template>
  <el-dialog
    v-model="isVisible"
    title="Reset password"
    width="400"
    destroy-on-close
  >
    <el-form
      :model="form"
      :rules="rule"
      ref="formRef"
      hide-required-asterisk
      label-position="top"
      v-if="isSend"
    >
      <el-form-item
        label="Password reset email will be sent to this address"
        prop="email"
      >
        <el-input v-model="form.email" style="max-width: 600px" disabled>
        </el-input>
      </el-form-item>
    </el-form>
    <div v-else>
      Send successfully, Please rest your password through the email
      <el-button text type="primary" :disabled="isDisabled" @click="sendEmail">
        Resend email<span v-show="isDisabled">({{ time }}s)</span></el-button
      >
    </div>
    <template #footer>
      <div v-if="isSend">
        <el-button
          type="primary"
          @click="sendEmail"
          :loading="isLoading"
          :disabled="isDisabled"
          >Send email<span v-show="isDisabled">({{ time }})</span>
        </el-button>
      </div>
      <div v-else>
        <el-button type="primary" @click="isVisible = false">
          Understood
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
