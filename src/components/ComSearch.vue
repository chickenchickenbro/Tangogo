<script setup>
import { Search } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'

//
const inputValue = ref()
const isVisible = ref(false)
const emit = defineEmits(['handleSearch'])
const handleSearch = (event) => {
  event.stopPropagation()
  emit('handleSearch', inputValue.value)
  isVisible.value = true
}

// Search word in dictionary
const cardRef = ref()
const handleClickOutside = (event) => {
  if (cardRef.value && !cardRef.value.$el.contains(event.target)) {
    isVisible.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// Stop event propagation
const handleClick = (event) => {
  event.stopPropagation()
}

// Expose function
const closeSearch = () => {
  isVisible.value = false
}
const resetInputValue = () => {
  inputValue.value = ''
}

// automatically focus search input
const inputRef = ref()
const focusInput = () => {
  inputRef.value.focus()
}

defineExpose({
  handleClickOutside,
  closeSearch,
  resetInputValue,
  focusInput
})
</script>

<template>
  <div class="search">
    <el-input
      size="large"
      style="max-width: 600px"
      placeholder="Search and Add a word in dictionary"
      v-model="inputValue"
      @click="handleClick"
      @keyup.enter="handleSearch"
      ref="inputRef"
      focused
    >
      <template #append>
        <el-button :icon="Search" @click="handleSearch" />
      </template>
    </el-input>
    <el-card v-show="isVisible" ref="cardRef">
      <slot></slot>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.search {
  position: relative;
  .el-card {
    transform: translateY(8px);
    width: 100%;
    position: absolute;
    z-index: 1;
  }
}
</style>
