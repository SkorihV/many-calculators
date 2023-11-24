import { useBaseStore } from "@/store/baseStore";
import {storeToRefs} from "pinia";

export default function errorMessage(message) {
  const {devMode} = storeToRefs(useBaseStore())
  if (devMode.value) {
    console.error(message)
  }
}
