export type MousePosition = {
  x: number
  y: number
  down: boolean
}

export type GpuState = {
  device: GPUDevice
  context: GPUCanvasContext
  format: GPUTextureFormat
}

export interface CustomEffectState {
  gpu: GpuState
  input: GPUTexture | null
  output: GPUTexture | null
  readonly time: number
  readonly deltaTime: number
  readonly frame: number
  readonly mousePosition: MousePosition
  readonly renderScale: number
  params: Record<string, unknown>
  state: Record<string, unknown>
}

export type Manifest = {
  version: number
  isAnimated: boolean
  usesMouse: boolean
  name: string
}

export type Shader = {
  setup: (device: GPUDevice, frame: CustomEffectState) => void
  render: (device: GPUDevice, frame: CustomEffectState) => void
  params: Record<string, unknown>
  manifest?: Manifest
}
