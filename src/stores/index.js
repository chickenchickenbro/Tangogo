import { createPinia } from 'pinia'
import Persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(Persist)

export default pinia

export * from './modules/user'
export * from './modules/word'
