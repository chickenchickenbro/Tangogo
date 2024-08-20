<script setup>
import { Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['openFolderForm'])
const openFolderForm = () => {
  emit('openFolderForm')
}
</script>

<template>
  <el-empty>
    <template #description>
      <p>Nothing at all. Please Add a word list first</p>
    </template>
    <el-button type="primary" :icon="Plus" @click="openFolderForm"
      >Add word list</el-button
    >
  </el-empty>
</template>

<style lang="scss" scoped></style>
