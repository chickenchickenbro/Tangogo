<script setup>
import {
  User,
  SwitchButton,
  Plus,
  MoreFilled,
  Edit,
  Delete,
  Collection,
  Lock
} from '@element-plus/icons-vue'
import avatar from '@/assets/default.png'
import { signOut } from 'firebase/auth'
import { auth } from '@/utils/firebase'
import router from '@/router'
import { useUserStore, useWordStore } from '@/stores'
import { ref } from 'vue'
import { wordGetFolderService, wordDeleteFolderService } from '@/api/word'
import { ElMessage } from 'element-plus'
import AddFolder from './components/AddFolder.vue'
import UserProfile from './components/UserProfile.vue'

// Global data
const userStore = useUserStore()
const uid = userStore.userInfo.uid

// Render word lists
const folderList = ref([])
const isLoading = ref(false)
const getFolderList = async () => {
  isLoading.value = true
  const res = await wordGetFolderService(uid)
  folderList.value = [...res]
  isLoading.value = false
}

// Select word list
const clearSearch = () => {
  // Trigger event-listening of child component
  window.dispatchEvent(new Event('clearSearch'))
}
const wordStore = useWordStore()
const folderIsActive = ref()
// word list page title
const pageTitle = ref('')
const selectFolder = (folderId, index) => {
  clearSearch()
  pageTitle.value = folderList.value[index].folderName
  folderIsActive.value = index
  wordStore.setfolderId(folderId)
  localStorage.setItem('folder', JSON.stringify({ folderId, index }))
  router.push('/word/wordlist')
  wordStore.getWordList(uid, {})
  wordStore.getCount(uid)

  // Continue test
  if (localStorage.getItem(folderId)) {
    ElMessageBox.confirm(
      'You have an incomplete test, Would you like to continue the previous test?',
      'Incomplete test',
      {
        confirmButtonText: 'Continue',
        cancelButtonText: 'Abandoned'
      }
    )
      .then(() => {
        router.push('/word/wordtest')
      })
      .catch(() => {
        localStorage.removeItem(folderId)
        ElMessage.success('Test have been abandoned')
      })
  }
}

// Automatically select the most recently chosen
const automaticSelectFolder = async () => {
  await getFolderList()
  if (!folderList.value[0]) {
    router.push('/empty')
    return
  }
  if (localStorage.getItem('folder')) {
    const { folderId, index } = JSON.parse(localStorage.getItem('folder'))
    selectFolder(folderId, index)
  } else {
    selectFolder(folderList.value[0].id, 0)
  }
}
automaticSelectFolder()

// Add/edit word list
const folderFormRef = ref()
const openFolderForm = (data) => {
  folderFormRef.value.open(data)
}
const handleSuccess = async (data) => {
  if (data === 'add') {
    await getFolderList()
    selectFolder(folderList.value[0].id, 0)
  } else if (data === 'edit') {
    automaticSelectFolder()
  }
}

// Delete word list
const deleteFolder = async (folderId) => {
  await ElMessageBox.confirm(
    'Are you sure to delete this word list and all words in it?',
    'Delete word list',
    {
      confirmButtonText: 'Comfirm',
      cancelButtonText: 'Cancle',
      cancelButtonClass: 'is-plain'
    }
  )
  await wordDeleteFolderService(uid, folderId)
  ElMessage.success('Delete successfully')
  await getFolderList()
  if (!folderList.value[0]) {
    router.push('/empty')
    return
  }
  const { index } = JSON.parse(localStorage.getItem('folder'))
  const newIndex = index - 1 < 0 ? 0 : index - 1
  selectFolder(folderList.value[newIndex].id, newIndex)
}

// Log out
const handleLogout = async () => {
  await signOut(auth)
  localStorage.removeItem('folder')
  wordStore.removeCurrentList()
  wordStore.removeCount()
  userStore.removeToken()
  userStore.setUserInfo({})
  ElMessage.success('Log out successfully')
  router.push('/login')
}

// More option for word list
const iconIsVisible = ref()
const iconIsSelected = ref(null)
const popoverShow = (index) => {
  iconIsSelected.value = index
}
const popoverHide = () => {
  iconIsSelected.value = null
}

// Dialog of edit profile
const userProfileRef = ref()
const openUserProfile = () => {
  userProfileRef.value.open()
}

// Dialog of reset password
const resetPasswordRef = ref()
const openResetPassword = () => {
  resetPasswordRef.value.open()
}
</script>

<template>
  <el-container class="layout-container">
    <!-- aside -->
    <el-aside width="200px" v-loading="isLoading">
      <div class="logo">
        <span>Tangogo</span>
      </div>
      <el-menu :default-openeds="['word']" router>
        <el-sub-menu index="word">
          <template #title>
            <div class="word-book">
              <el-icon><Collection /></el-icon>
              <span>Word lists</span>
            </div>
          </template>
          <el-menu-item v-for="(item, index) in folderList" :key="item.id">
            <div
              @mouseenter="iconIsVisible = index"
              @mouseleave="iconIsVisible = null"
              @click="selectFolder(item.id, index)"
              :class="{
                'folder-active': folderIsActive === index,
                'word-card': true
              }"
            >
              <el-text truncated>{{ item.folderName }}</el-text>
              <el-popover
                placement="right-start"
                trigger="click"
                :show-arrow="false"
                offset="0"
                hide-after="0"
                @show="popoverShow(index)"
                @before-leave="popoverHide"
              >
                <template #reference>
                  <el-icon
                    @click.stop
                    :class="{ 'icon-avitive': iconIsSelected === index }"
                    v-if="iconIsVisible === index || iconIsSelected === index"
                    ><MoreFilled
                  /></el-icon>
                </template>
                <el-button text :icon="Edit" @click="openFolderForm(item)"
                  >Edit</el-button
                >
                <el-button text :icon="Delete" @click="deleteFolder(item.id)"
                  >Delete</el-button
                >
              </el-popover>
            </div>
          </el-menu-item>
          <el-menu-item>
            <el-button plain @click="openFolderForm({})"
              ><el-icon><Plus /></el-icon>Add word list</el-button
            >
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    <el-container>
      <!-- word list header -->
      <el-header>
        <h1 class="pageTitle">{{ pageTitle }}</h1>

        <el-popover
          placement="bottom-end"
          trigger="click"
          :show-arrow="false"
          offset="8"
          hide-after="0"
        >
          <template #reference>
            <div class="user-profile">
              <strong class="nickname"
                >Hi、{{
                  userStore.userInfo.displayName || userStore.userInfo.email
                }}</strong
              >
              <el-avatar :src="userStore.userInfo.photoURL || avatar" />
            </div>
          </template>
          <el-button text :icon="User" @click="openUserProfile"
            >Edit profile</el-button
          >
          <el-button text :icon="Lock" @click="openResetPassword"
            >Reset password</el-button
          >
          <el-button
            text
            @click="handleLogout"
            :icon="SwitchButton"
            class="logout"
            >Log out</el-button
          >
        </el-popover>
      </el-header>
      <!-- word list main -->
      <el-main>
        <router-view @openFolderForm="openFolderForm"></router-view>
      </el-main>
    </el-container>
  </el-container>
  <!-- Dialog -->
  <add-folder ref="folderFormRef" @success="handleSuccess"></add-folder>
  <user-profile ref="userProfileRef"></user-profile>
  <reset-password ref="resetPasswordRef"></reset-password>
</template>

<style lang="scss" scoped>
.el-popper {
  .el-button.is-text {
    justify-content: left;
    margin: 0;
    width: 100%;
  }
}
@import url('https://fonts.googleapis.com/css2?family=Capriola&display=swap');
.layout-container {
  height: 100vh;
  .el-aside {
    background-color: #ffffff;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.16);
    z-index: 1;
    .logo {
      padding-left: 16px;
      margin-bottom: 8px;
      display: flex;
      justify-content: left;
      align-items: center;
      height: 60px;
      font-family: 'Capriola', sans-serif;
      font-style: normal;
      font-size: 32px;
      color: var(--el-color-primary);
    }
    .el-menu {
      border-right: none;
      .word-book {
        display: flex;
        align-items: center;
        font-size: 16px;
        color: #333;
        .el-icon {
          color: #666;
        }
      }
      .el-menu-item {
        padding: 8px 16px;
        height: 100%;
        line-height: 28px;
        &:hover {
          background-color: #fff;
        }
        .word-card {
          transition: all 0.1s;
          padding: 8px 8px 8px 28px;
          width: 100%;
          border-radius: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          &:hover {
            background-color: var(--color-background);
          }
          .el-text {
            color: #333;
          }
          .el-icon {
            margin: 0px;
            padding: 4px;
            color: #666;
            width: 24px;
            height: 24px;
            border-radius: 4px;
            &:hover {
              background-color: #d9d9d9;
            }
          }
          .icon-avitive {
            background-color: #d9d9d9;
          }
        }
        .folder-active {
          background-color: var(--color-background);
          .el-text {
            color: var(--el-color-primary);
          }
        }
        .el-button {
          margin-top: 4px;
          width: 100%;
          height: 40px;
        }
      }
    }
  }
  .el-header {
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
    margin: 0 20px;
    border-bottom: var(--color-line) 1px solid;
    height: 60px;
    .pageTitle {
      color: #666;
      font-weight: 400;
      font-size: 20px;
    }
    .user-profile {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      .nickname {
        font-size: 16px;
        font-weight: 400;
        color: #666;
      }
      .el-avatar {
        width: 36px;
        height: 36px;
      }
    }
  }
  .el-main {
    padding-bottom: 0;
  }
}
</style>
<style lang="scss">
.el-sub-menu__title {
  padding: 16px 16px !important;
  height: 100%;
  line-height: normal;
  &:hover {
    background-color: #fff;
  }
}
</style>
