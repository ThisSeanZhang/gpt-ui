import { defineStore } from 'pinia'
import { computed, ref } from 'vue';
import { ApiKeyPair } from '../api/common';

const API_KEYS = 'api_keys';

function init(): ApiKeyPair[] {
  let keys = localStorage.getItem(API_KEYS);
  if (keys !== null) {
    try {
      return JSON.parse(keys) as ApiKeyPair[]
    } catch(e) {
      console.log(`parse error: ${e}`)
      return []
    }
  } else {
    return []
  }
}

function store_in_local(pairs: ApiKeyPair[]) {
  localStorage.setItem(API_KEYS, JSON.stringify(pairs));
}

const keys = init();
export const useKeyStore = defineStore('key', () => {
  const raw_keys = ref<ApiKeyPair[]>(keys);
  const current = ref<ApiKeyPair>(ApiKeyPair.get_first(keys));

  const first_key = computed(() => ApiKeyPair.get_first(raw_keys.value));
  const all_selects  = computed(() => raw_keys.value.map((e, index) => ({ label: e.label, value: index } )));

  function ADD_KEY(pair: ApiKeyPair) {
    const exsit = raw_keys.value.find(e => e.value === pair.value);
    if (exsit) {
      return;
    }
    raw_keys.value.push(pair)
    current.value = pair;
    store_in_local(raw_keys.value)
  }

  function SELECT(index: number | null) {
    current.value = index !== null && raw_keys.value.length > index ? raw_keys.value[index] : new ApiKeyPair("", "");
  }

  function REMOVE(index?: number) {
    if (index !== undefined && raw_keys.value.length > index) {
      raw_keys.value.splice(index, 1)
      store_in_local(raw_keys.value)
    }
  }

  return {
    current,
    first_key,
    all_selects,
    ADD_KEY,
    SELECT,
    REMOVE,
  };
})

export default useKeyStore;
