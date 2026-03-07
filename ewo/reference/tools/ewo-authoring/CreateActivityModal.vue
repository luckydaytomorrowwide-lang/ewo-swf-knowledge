<template>
  <div v-if="show" class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h2 class="modal-title">Create New Activity</h2>
        <button @click="closeModal" class="close-button">×</button>
      </div>

      <div class="modal-body">
        <!-- Mode Selection -->
        <div class="form-section">
          <label class="form-label">Creation Mode</label>
          <div class="mode-options">
            <label class="mode-option">
              <input type="radio" v-model="mode" value="inline" />
              <span>
                <strong>Inline</strong> (Quick prototype)
                <div class="mode-description">Create in-memory activity for testing</div>
              </span>
            </label>
            <label class="mode-option">
              <input type="radio" v-model="mode" value="file" />
              <span>
                <strong>Generate File</strong> (Production)
                <div class="mode-description">Generate TypeScript file with skeleton</div>
              </span>
            </label>
          </div>
        </div>

        <!-- Basic Info -->
        <div class="form-section">
          <label class="form-label">Name *</label>
          <input 
            v-model="formData.name"
            type="text"
            placeholder="e.g., CalculatePriceAC"
            class="form-input"
            @input="validateName"
          />
          <div v-if="nameError" class="error-message">{{ nameError }}</div>
        </div>

        <div class="form-section" v-if="mode === 'file'">
          <label class="form-label">Scope</label>
          <select v-model="formData.scope" class="form-input">
            <option value="common">common</option>
            <option value="custom">custom</option>
            <option value="system">system</option>
          </select>
        </div>

        <div class="form-section">
          <label class="form-label">Description</label>
          <textarea 
            v-model="formData.description"
            rows="2"
            placeholder="Brief description of what this activity does"
            class="form-input"
          ></textarea>
        </div>

        <!-- Inputs -->
        <div class="form-section">
          <div class="section-header">
            <label class="form-label">Input Parameters</label>
            <button @click="addInput" class="add-button">+ Add Input</button>
          </div>
          <div class="params-list">
            <div 
              v-for="(input, index) in formData.inputs" 
              :key="index"
              class="param-item"
            >
              <input 
                v-model="input.name"
                type="text"
                placeholder="Parameter name"
                class="param-name-input"
              />
              <select v-model="input.type" class="param-type-select">
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="array">array</option>
                <option value="object">object</option>
                <option value="any">any</option>
              </select>
              <label class="param-required">
                <input type="checkbox" v-model="input.required" />
                <span>Required</span>
              </label>
              <button @click="removeInput(index)" class="remove-button">×</button>
            </div>
          </div>
        </div>

        <!-- Outputs -->
        <div class="form-section">
          <div class="section-header">
            <label class="form-label">Output Parameters</label>
            <button @click="addOutput" class="add-button">+ Add Output</button>
          </div>
          <div class="params-list">
            <div 
              v-for="(output, index) in formData.outputs" 
              :key="index"
              class="param-item"
            >
              <input 
                v-model="output.name"
                type="text"
                placeholder="Parameter name"
                class="param-name-input"
              />
              <select v-model="output.type" class="param-type-select">
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="array">array</option>
                <option value="object">object</option>
                <option value="any">any</option>
              </select>
              <button @click="removeOutput(index)" class="remove-button">×</button>
            </div>
          </div>
        </div>

        <!-- Inline Code (only for inline mode) -->
        <div v-if="mode === 'inline'" class="form-section">
          <label class="form-label">Implementation (JavaScript)</label>
          <textarea 
            v-model="formData.code"
            rows="8"
            placeholder="// Implement your logic here&#10;return {&#10;  outputParam: value&#10;}"
            class="form-input code-input"
          ></textarea>
          <div class="hint-text">
            Available: <code>payload</code> (inputs), <code>console.log</code>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="cancel-button">Cancel</button>
        <button 
          @click="createActivity" 
          class="create-button"
          :disabled="!isValid"
        >
          {{ mode === 'inline' ? 'Create Inline Activity' : 'Generate File' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  show: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'create'])

const mode = ref<'inline' | 'file'>('inline')
const nameError = ref('')

const formData = ref({
  name: '',
  scope: 'custom',
  description: '',
  inputs: [] as Array<{ name: string; type: string; required: boolean }>,
  outputs: [] as Array<{ name: string; type: string }>,
  code: `return { /* TODO */ }`
})

const isValid = computed(() => {
  return formData.value.name && 
         !nameError.value &&
         formData.value.inputs.length > 0 &&
         formData.value.outputs.length > 0
})

const validateName = () => {
  const name = formData.value.name
  if (!name) {
    nameError.value = ''
    return
  }
  if (!/^[A-Z][a-zA-Z0-9]*AC$/.test(name)) {
    nameError.value = 'Name should start with capital letter and end with "AC"'
  } else {
    nameError.value = ''
  }
}

const addInput = () => {
  formData.value.inputs.push({ name: '', type: 'string', required: false })
}

const removeInput = (index: number) => {
  formData.value.inputs.splice(index, 1)
}

const addOutput = () => {
  formData.value.outputs.push({ name: '', type: 'string' })
}

const removeOutput = (index: number) => {
  formData.value.outputs.splice(index, 1)
}

const closeModal = () => {
  emit('close')
}

const createActivity = () => {
  if (!isValid.value) return
  
  emit('create', {
    mode: mode.value,
    ...formData.value
  })
  
  // Reset form
  formData.value = {
    name: '',
    scope: 'custom',
    description: '',
    inputs: [],
    outputs: [],
    code: `return { /* TODO */ }`
  }
  
  closeModal()
}

// Watch for modal open/close
watch(() => props.show, (newVal) => {
  if (newVal) {
    // Reset on open
    mode.value = 'inline'
    nameError.value = ''
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 28px;
  cursor: pointer;
  border-radius: 6px;
  line-height: 1;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f3f4f6;
  color: #111827;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.code-input {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-option {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.mode-option input[type="radio"]:checked + span {
  color: #1e40af;
}

.mode-option input[type="radio"] {
  margin-top: 2px;
}

.mode-description {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.add-button {
  padding: 4px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.add-button:hover {
  background: #2563eb;
}

.params-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.param-name-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
}

.param-name-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.param-type-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  cursor: pointer;
}

.param-type-select:focus {
  outline: none;
  border-color: #3b82f6;
}

.param-required {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
}

.param-required input[type="checkbox"] {
  cursor: pointer;
}

.remove-button {
  width: 24px;
  height: 24px;
  border: none;
  background: #ef4444;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: background 0.2s;
}

.remove-button:hover {
  background: #dc2626;
}

.hint-text {
  font-size: 11px;
  color: #6b7280;
  margin-top: 6px;
}

.hint-text code {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Courier New', monospace;
}

.error-message {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button {
  padding: 8px 20px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.create-button {
  padding: 8px 20px;
  border: none;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-button:hover:not(:disabled) {
  background: #2563eb;
}

.create-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>
