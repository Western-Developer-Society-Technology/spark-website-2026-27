import { useState, type JSX } from 'react'

import type { Shader } from '../types'
import { useShaderRuntime } from '../useShaderRuntime'

type ShaderFillProps = {
  shader: Shader
  className?: string
  // A CSS `mask` value (e.g. `url("…")`) clipping the canvas to the node's vector shape.
  mask?: string
}

export function ShaderFill({
  shader,
  className,
  mask,
}: ShaderFillProps): JSX.Element | null {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  const { error } = useShaderRuntime({ canvas, shader })
  return error !== null ? null : (
    <canvas
      className={className}
      style={{
        display: 'block',
        mask,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      ref={setCanvas}
    />
  )
}
