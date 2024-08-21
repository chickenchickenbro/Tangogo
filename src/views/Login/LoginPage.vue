<script setup>
import { ref } from 'vue'
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth'
import { auth } from '@/utils/firebase'
import router from '@/router'
import { useUserStore } from '@/stores'
import { ElMessage } from 'element-plus'
import {
  UserAddUserService,
  UserSignupService,
  UserLoginService
} from '@/api/user'
import google from '@/assets/google.png'

// form data
const formModel = ref({
  email: '',
  password: '',
  repassword: ''
})
const rules = {
  email: [
    {
      required: true,
      message: 'Please enter your email address',
      trigger: 'blur'
    },
    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message:
        'Password cannot contain spaces and must be longer than 5 characters',
      trigger: 'blur'
    }
  ],
  repassword: [
    {
      required: true,
      message: 'Please enter your password again',
      trigger: 'blur'
    },
    {
      pattern: /^\S{6,15}$/,
      message:
        'Password cannot contain spaces and must be longer than 5 characters',
      trigger: 'blur'
    },
    {
      validator: (rule, value, callback) => {
        if (value !== formModel.value.password) {
          callback(new Error('Passwords do not match'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// Switch login/signup
const isLogin = ref(true)
const changeContent = () => {
  formModel.value = {
    email: '',
    password: '',
    repassword: ''
  }
  isLogin.value = !isLogin.value
}

// login
const isLoading = ref(false)
const formRef = ref()
const userstore = useUserStore()
const handleLogin = async () => {
  await formRef.value.validate()
  isLoading.value = true
  const res = await UserLoginService(
    formModel.value.email,
    formModel.value.password
  )
  // Save token locally
  const token = await res.user.getIdToken()
  userstore.setToken(token)
  router.push('/')
  ElMessage.success('Login successfully')
}

// signup
const handleSignUp = async () => {
  await formRef.value.validate()
  isLoading.value = true
  const {
    user: { displayName, email, uid }
  } = await UserSignupService(formModel.value.email, formModel.value.password)
  ElMessage.success('Sign up successfully, you wii be loged in automatically')
  const user = { displayName, email }
  await UserAddUserService(uid, user)
  await handleLogin()
}

// login with google
const provider = new GoogleAuthProvider()
const loginByGoogle = async () => {
  isLoading.value = true
  const res = await signInWithRedirect(auth, provider).cath((error) => {
    console.log(error)
  })
  console.log(123)

  const credential = GoogleAuthProvider.credentialFromResult(res)
  const token = await credential.accessToken
  const {
    user: { displayName, email, uid }
  } = res
  const user = { displayName, email }
  await UserAddUserService(uid, user)
  userstore.setToken(token)
  router.push('/')
  ElMessage.success('Login successfully')
}
</script>

<template>
  <div class="login-page">
    <div class="header">Tangogo</div>
    <div class="main" v-loading="isLoading">
      <el-form ref="formRef" v-if="isLogin" :model="formModel" :rules="rules">
        <h1>Log in</h1>
        <el-form-item prop="email">
          <el-input
            placeholder="
Please enter your email address"
            v-model="formModel.email"
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            name="password"
            type="password"
            placeholder="Please enter your password"
            size="large"
            v-model="formModel.password"
            show-password
          ></el-input>
        </el-form-item>
        <el-button
          class="primary-btn"
          type="primary"
          @click="handleLogin"
          size="large"
          >Log in</el-button
        >
        <el-divider>or</el-divider>
        <el-button plain @click="loginByGoogle" size="large">
          <img :src="google" width="24" style="margin-right: 8px" />
          Log in with Google</el-button
        >
        <div class="secondary-btn">
          <span style="margin-right: 4px">Don't have an account?</span>
          <el-link type="primary" :underline="false" @click="changeContent">
            Sign up</el-link
          >
        </div>
      </el-form>
      <el-form ref="formRef" v-else :model="formModel" :rules="rules">
        <h1>Sign up</h1>
        <el-form-item prop="email">
          <el-input
            placeholder="Please enter your email address"
            v-model="formModel.email"
            size="large"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            placeholder="Please enter your password"
            v-model="formModel.password"
            size="large"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            type="password"
            placeholder="Please enter your password again"
            v-model="formModel.repassword"
            size="large"
            show-password
          ></el-input>
        </el-form-item>
        <el-button
          class="primary-btn"
          type="primary"
          auto-insert-space
          @click="handleSignUp"
          size="large"
        >
          Sign up
        </el-button>
        <div class="secondary-btn">
          <span style="margin-right: 4px">Already have an account?</span>
          <el-link type="primary" :underline="false" @click="changeContent"
            >Log in
          </el-link>
        </div>
      </el-form>
    </div>
    <div class="footer">©2024 Created by Siryou</div>
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Capriola&display=swap');
.login-page {
  height: 100vh;
  background-color: #f9f0ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  // logo
  .header {
    margin-bottom: 8px;
    font-family: 'Capriola', sans-serif;
    font-size: 40px;
    margin: 48px 0 40px;
    color: var(--el-color-primary);
  }

  // form
  .main {
    border-radius: 8px;
    width: 400px;
    padding: 20px;
    background-color: #fff;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.18);
    .el-form {
      display: flex;
      flex-direction: column;
      align-items: center;
      h1 {
        color: #666;
        text-align: center;
        font-size: 24px;
        font-weight: 400;
        margin: 4px 0px 24px;
      }
      .el-button {
        width: 100%;
        margin-left: 0;
        font-size: 16px;
      }
      .el-form-item {
        width: 100%;
      }
      .primary-btn {
        margin-top: 8px;
      }
      .secondary-btn {
        margin: 28px 0 8px;
        display: flex;
        align-items: center;
      }
      span {
        color: #666;
      }
      .el-link {
        font-weight: 400;
      }
    }
  }
  .footer {
    font-size: 14px;
    margin-top: 80px;
    color: #999;
  }
}
</style>
