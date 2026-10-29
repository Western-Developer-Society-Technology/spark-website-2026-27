import { useEffect, useState } from 'react'

import type { CustomEffectState, Shader } from './types'
import { useWebGPUDevice } from './webgpu'

// The supplied cloud and rock shaders are static, single-pass fills. They render
// directly to the canvas and never sample an input texture.
export function useShaderRuntime({
  canvas,
  shader,
}: {
  canvas: HTMLCanvasElement | null
  shader: Shader
}): { error: Error | null } {
  const { device, error: deviceError } = useWebGPUDevice()
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!canvas || !device) return

    let context: GPUCanvasContext | null = null
    let observer: ResizeObserver | undefined
    const state: Record<string, unknown> = {}

    try {
      context = canvas.getContext('webgpu')
      if (!context) throw new Error('Failed to get WebGPU context.')

      const format = navigator.gpu.getPreferredCanvasFormat()
      context.configure({ device, format, alphaMode: 'premultiplied' })

      const resize = (width: number, height: number) => {
        if (canvas.width === width && canvas.height === height) return false
        if (canvas.width !== width) canvas.width = width
        if (canvas.height !== height) canvas.height = height
        return true
      }
      const bounds = canvas.getBoundingClientRect()
      const renderScale = window.devicePixelRatio || 1
      resize(
        Math.max(1, Math.round(bounds.width * renderScale)),
        Math.max(1, Math.round(bounds.height * renderScale)),
      )

      const frame: CustomEffectState = {
        gpu: { device, context, format },
        input: null,
        output: null,
        time: 0,
        deltaTime: 0,
        frame: 0,
        mousePosition: { x: 0, y: 0, down: false },
        renderScale,
        params: shader.params,
        state,
      }
      shader.setup(device, frame)

      const draw = () => {
        try {
          shader.render(device, {
            ...frame,
            output: context!.getCurrentTexture(),
            renderScale: window.devicePixelRatio || 1,
          })
        } catch (error) {
          console.warn('Failed to render effect', error)
        }
      }
      draw()

      observer = new ResizeObserver((entries) => {
        const scale = window.devicePixelRatio || 1
        for (const entry of entries) {
          const size = entry.contentBoxSize?.[0]
          const width = Math.max(1, Math.round((size?.inlineSize ?? entry.contentRect.width) * scale))
          const height = Math.max(1, Math.round((size?.blockSize ?? entry.contentRect.height) * scale))
          if (resize(width, height)) draw()
        }
      })
      observer.observe(canvas, { box: 'device-pixel-content-box' })
    } catch (error) {
      console.warn('Failed to initialize shader runtime', error)
      setError(error instanceof Error ? error : new Error(String(error)))
    }

    return () => {
      observer?.disconnect()
      // Both supplied shaders own a vertex buffer and a uniform buffer.
      for (const buffer of [state.quad, state.uniformBuf]) {
        if (buffer instanceof GPUBuffer) buffer.destroy()
      }
      context?.unconfigure()
    }
  }, [canvas, device, shader])

  return { error: deviceError ?? error }
}
