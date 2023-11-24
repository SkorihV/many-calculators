import { useBaseStore } from "@/store/baseStore";
import {storeToRefs} from "pinia";

export default function errorMessage(messages, type = 'error') {
  const {devMode} = storeToRefs(useBaseStore())
  if (devMode.value) {
    let message = messages
    if (Array.isArray(messages)) {
      message = messages?.join(' ')
    }

    if (type === 'error') {
      console.error(message)
    } else if (type === 'info') {
      console.info(message)
    } else if (type === 'log') {
      console.log(message)
    }
  }
}
