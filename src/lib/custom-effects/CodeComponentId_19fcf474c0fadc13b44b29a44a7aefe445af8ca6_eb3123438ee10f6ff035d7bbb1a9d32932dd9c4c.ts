// @ts-nocheck

// Property metadata is only used in Figma Design, so this is a no-op.
function defineProperties(
  _component: unknown,
  _properties: unknown,
): void {}

export default function Effect() { }
export function setup(device, frame) {
    var wgsl = `
diagnostic(off,derivative_uniformity);
struct Uniforms {
  frameData: vec4f,
  inputDimsData: vec4f,
  shadowColor: vec4f,
  baseColor: vec4f,
  highlightColor: vec4f,
  textureScale: vec4f,
  rockLayering: vec4f,
  brushDirection: vec4f,
  brushRoughness: vec4f,
  paintGrain: vec4f,
  contrast: vec4f,
  seed: vec4f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

struct VsIn {
  @location(0) pos: vec2f,
  @location(1) uv: vec2f,
};
struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};

fn rockHash(p: vec2f) -> f32 {

  var q = fract(vec3f(p.x, p.y, p.x) * 0.1031);

  q = q + dot(q, q.yzx + 33.33);

  return fract((q.x + q.y) * q.z);

}

fn rockNoise(p: vec2f) -> f32 {

  let i = floor(p);

  let f = fract(p);

  let s = f * f * (3.0 - 2.0 * f);

  return mix(mix(rockHash(i), rockHash(i + vec2f(1.0, 0.0)), s.x), mix(rockHash(i + vec2f(0.0, 1.0)), rockHash(i + vec2f(1.0, 1.0)), s.x), s.y);

}

fn rockPalette(t: f32, dark: vec3f, middle: vec3f, light: vec3f) -> vec3f {

  return mix(mix(dark, middle, clamp(t * 2.0, 0.0, 1.0)), light, clamp(t * 2.0 - 1.0, 0.0, 1.0));

}

@vertex fn vs_main(in: VsIn) -> VsOut {
  var out: VsOut;
  out.position = vec4f(in.pos, 0.0, 1.0);
  out.uv = in.uv;
  return out;
}

@fragment fn fs_main(@location(0) outputUv_in: vec2f) -> @location(0) vec4f {
  let time = u.frameData.x;
  let outputUv = outputUv_in;
  let dims = max(u.frameData.yz, vec2f(1.0));
  let inputDims = max(u.inputDimsData.xy, vec2f(1.0));
  let inputTexel = vec2f(1.0) / inputDims;
  let uv = outputUv;
  // texel and aspect are input-relative to match uv. Zoom fills rescale texel
  // alongside their uv redefinition below (see zoomLocal).
  let texel = inputTexel;
  let aspect = inputDims.x / max(inputDims.y, 1.0);
  let shadowColor = u.shadowColor;
  let baseColor = u.baseColor;
  let highlightColor = u.highlightColor;
  let textureScale = u.textureScale.x;
  let rockLayering = u.rockLayering.x;
  let brushDirection = u.brushDirection.x;
  let brushRoughness = u.brushRoughness.x;
  let paintGrain = u.paintGrain.x;
  let contrast = u.contrast.x;
  let seed = u.seed.x;
  // Coordinates are isotropic before the elongated painted-stroke transform.
  let pos = (uv - 0.5) * vec2f(aspect, 1.0) / max(textureScale, 0.1);
  let theta = brushDirection * 0.01745329252;
  let p = vec2f(cos(theta) * pos.x - sin(theta) * pos.y, sin(theta) * pos.x + cos(theta) * pos.y);
  let salt = vec2f(seed * 1.731, seed * 0.917);
  let edgeWarp = (rockNoise(p * vec2f(27.0, 12.0) + salt) - 0.5) * 0.08 * brushRoughness;
  let grid = vec2f(p.x + edgeWarp, p.y) * vec2f(8.0, 2.7) + salt;
  let cell = floor(grid);
  var nearest = 100.0;
  var planeTone = 0.5;
  var facePos = 0.0;
  // Large irregular, elongated polygonal rock planes, never a cloudy noise field.
  for (var j = -1; j <= 1; j = j + 1) {
    for (var i = -1; i <= 1; i = i + 1) {
      let id = cell + vec2f(f32(i), f32(j));
      let center = id + vec2f(0.2 + 0.6 * rockHash(id + 9.4), 0.2 + 0.6 * rockHash(id + 31.1));
      let d = grid - center;
      let metric = dot(d, d);
      if (metric < nearest) {
        nearest = metric;
        planeTone = 0.25 + 0.46 * rockHash(id + 67.8);
        facePos = d.x;
      }
    }
  }
  var tone = planeTone + clamp(-facePos * 0.13, -0.08, 0.08);
  // Broad overlapping gouache daubs: long, flat-sided, irregularly capped.
  for (var layer = 0; layer < 6; layer = layer + 1) {
    if (f32(layer) >= rockLayering) { break; }
    let level = f32(layer);
    let frequency = vec2f(9.0 + level * 2.4, 2.8 + level * 0.65);
    let g = p * frequency + salt + vec2f(level * 17.4, level * 9.3);
    let root = floor(g);
    for (var y = -1; y <= 1; y = y + 1) {
      for (var x = -1; x <= 1; x = x + 1) {
        let id = root + vec2f(f32(x), f32(y));
        let h = rockHash(id + 43.7 + level);
        let h2 = rockHash(id + 78.3);
        let center = id + vec2f(0.15 + 0.7 * h, 0.15 + 0.7 * h2);
        let d = g - center;
        let taper = 0.76 + 0.2 * d.y + 0.08 * sin(d.y * 5.0 + h * 20.0);
        let ruffle = (rockNoise(vec2f(d.y * 13.0, id.x * 8.0 + id.y * 3.0)) - 0.5) * 0.13 + (rockNoise(g * vec2f(11.0, 16.0)) - 0.5) * 0.05;
        let width = (0.23 + h2 * 0.21) * taper;
        let side = abs(d.x + d.y * (h - 0.5) * 0.12) - width + brushRoughness * ruffle;
        let endRag = (rockNoise(vec2f(d.x * 18.0 + id.x * 2.0, id.y * 7.0)) - 0.5) * 0.20 * brushRoughness;
        let cap = abs(d.y) - (0.32 + h * 0.24) + endRag;
        let edge = max(side, cap);
        let aa = max(fwidth(edge), 0.007);
        let mask = (1.0 - smoothstep(-aa, aa * 1.7, edge)) * (0.62 + 0.16 * h);
        let daubTone = 0.24 + 0.53 * rockHash(id + 118.2 + level * 3.7);
        // Pigment pools subtly at one side; broad solid paint remains dominant.
        let ridge = 0.035 * (0.5 - d.x / max(width, 0.05));
        tone = mix(tone, daubTone + ridge, mask);
      }
    }
  }
  let dry = rockNoise(p * vec2f(560.0, 155.0) + salt);
  let fine = rockHash(floor(p * 1250.0) + salt);
  tone = clamp(0.5 + (tone - 0.5) * contrast + ((dry - 0.5) * 0.065 + (fine - 0.5) * 0.035) * paintGrain, 0.0, 1.0);
  let rgb = rockPalette(tone, shadowColor.rgb, baseColor.rgb, highlightColor.rgb);
  return vec4f(rgb, 1.0);
}
`;
    frame.state.module = device.createShaderModule({ code: wgsl });
    frame.state.pipeline = null;
    frame.state.pipelineFormat = null;
    frame.state.quad = device.createBuffer({
        size: 6 * 4 * 4,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(frame.state.quad.getMappedRange()).set([
        -1, -1, 0, 1,
        1, -1, 1, 1,
        -1, 1, 0, 0,
        -1, 1, 0, 0,
        1, -1, 1, 1,
        1, 1, 1, 0,
    ]);
    frame.state.quad.unmap();
    frame.state.uniformBuf = device.createBuffer({
        size: 192,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
}
export function render(device, frame) {
    var params = frame.params || {};
    function finiteNumber(value, fallback) {
        var num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }
    function numberParam(name, fallback) {
        return finiteNumber(params[name], fallback);
    }
    function boolParam(name, fallback) {
        if (typeof params[name] === 'boolean')
            return params[name] ? 1 : 0;
        return fallback ? 1 : 0;
    }
    function selectParam(name, count, fallbackIndex) {
        // A select is a numeric dropdown: params[name] is the chosen option's index.
        var index = Math.round(Number(params[name]));
        return Number.isFinite(index) && index >= 0 && index < count ? index : fallbackIndex;
    }
    function colorParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.r, fallback[0]),
            finiteNumber(value.g, fallback[1]),
            finiteNumber(value.b, fallback[2]),
            finiteNumber(value.a, fallback[3]),
        ];
    }
    function pointParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
        ];
    }
    function pointRadiusParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            finiteNumber(value.radius, fallback[2]),
        ];
    }
    function pointPointLineParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            finiteNumber(value.x2, fallback[2]),
            finiteNumber(value.y2, fallback[3]),
        ];
    }
    function pointAngleRadiusParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            finiteNumber(value.radius, fallback[2]),
            finiteNumber(value.angle, fallback[3]),
        ];
    }
    function colorPointParam(name, fallback) {
        var value = params[name] || {};
        var color = value.color || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            0,
            0,
            finiteNumber(color.r, fallback[2]),
            finiteNumber(color.g, fallback[3]),
            finiteNumber(color.b, fallback[4]),
            finiteNumber(color.a, fallback[5]),
        ];
    }
    function gradientParam(name, fallback) {
        var value = params[name] || {};
        var stops = Array.isArray(value.stops) && value.stops.length > 0 ? value.stops : fallback;
        // Layout: 8 stop colors (rgba), then 8 positions packed 4-per-vec4, then the live count.
        var out = new Array(44).fill(0);
        var count = Math.min(stops.length, 8);
        for (var i = 0; i < count; i++) {
            var stop = stops[i] || {};
            var color = stop.color || {};
            out[i * 4] = finiteNumber(color.r, 0);
            out[i * 4 + 1] = finiteNumber(color.g, 0);
            out[i * 4 + 2] = finiteNumber(color.b, 0);
            out[i * 4 + 3] = finiteNumber(color.a, 1);
            out[32 + i] = finiteNumber(stop.position, 0);
        }
        out[40] = count;
        return out;
    }
    var output = frame.output || {};
    var width = Math.max(1, finiteNumber(output.physicalWidth, finiteNumber(output.width, 1)));
    var height = Math.max(1, finiteNumber(output.physicalHeight, finiteNumber(output.height, 1)));
    var time = 0;
    var inputWidth = width;
    var inputHeight = height;
    device.queue.writeBuffer(frame.state.uniformBuf, 0, new Float32Array([
        time, width, height, 0,
        inputWidth, inputHeight, 0, 0,
        ...colorParam("shadowColor", [0.16, 0.17, 0.18, 1]),
        ...colorParam("baseColor", [0.36, 0.37, 0.38, 1]),
        ...colorParam("highlightColor", [0.62, 0.63, 0.63, 1]),
        numberParam("textureScale", 1), 0, 0, 0,
        numberParam("rockLayering", 4), 0, 0, 0,
        numberParam("brushDirection", 8), 0, 0, 0,
        numberParam("brushRoughness", 0.5), 0, 0, 0,
        numberParam("paintGrain", 0.24), 0, 0, 0,
        numberParam("contrast", 1), 0, 0, 0,
        numberParam("seed", 17), 0, 0, 0,
    ]));
    var outputFormat = frame.output.format;
    if (frame.state.pipeline == null || frame.state.pipelineFormat !== outputFormat) {
        frame.state.pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: frame.state.module,
                entryPoint: 'vs_main',
                buffers: [{
                        arrayStride: 16,
                        attributes: [
                            { shaderLocation: 0, format: 'float32x2', offset: 0 },
                            { shaderLocation: 1, format: 'float32x2', offset: 8 },
                        ],
                    }],
            },
            fragment: {
                module: frame.state.module,
                entryPoint: 'fs_main',
                targets: [{ format: outputFormat }],
            },
            primitive: { topology: 'triangle-list' },
        });
        frame.state.pipelineFormat = outputFormat;
    }
    var bindGroup = device.createBindGroup({
        layout: frame.state.pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: frame.state.uniformBuf } },
        ],
    });
    var encoder = device.createCommandEncoder();
    var pass = encoder.beginRenderPass({
        colorAttachments: [{
                view: frame.output.createView(),
                loadOp: 'clear',
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                storeOp: 'store',
            }],
    });
    pass.setPipeline(frame.state.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, frame.state.quad);
    pass.draw(6);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
defineProperties(Effect, {
    "shadowColor": {
        type: "color",
        label: "Shadow color",
        defaultValue: { "r": 0.16, "g": 0.17, "b": 0.18, "a": 1 },
    },
    "baseColor": {
        type: "color",
        label: "Base color",
        defaultValue: { "r": 0.36, "g": 0.37, "b": 0.38, "a": 1 },
    },
    "highlightColor": {
        type: "color",
        label: "Highlight color",
        defaultValue: { "r": 0.62, "g": 0.63, "b": 0.63, "a": 1 },
    },
    "textureScale": {
        type: "number",
        label: "Texture scale",
        defaultValue: 1,
        control: "slider",
        min: 0.1,
        max: 5,
        step: 0.01,
    },
    "rockLayering": {
        type: "number",
        label: "Rock layering",
        defaultValue: 4,
        control: "slider",
        min: 1,
        max: 6,
        step: 1,
    },
    "brushDirection": {
        type: "number",
        label: "Brush direction",
        defaultValue: 8,
        control: "slider",
        min: -180,
        max: 180,
        step: 1,
        unit: "°",
    },
    "brushRoughness": {
        type: "number",
        label: "Brush roughness",
        defaultValue: 0.5,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "paintGrain": {
        type: "number",
        label: "Paint grain",
        defaultValue: 0.24,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "contrast": {
        type: "number",
        label: "Contrast",
        defaultValue: 1,
        control: "slider",
        min: 0,
        max: 2,
        step: 0.01,
    },
    "seed": {
        type: "number",
        label: "Seed",
        defaultValue: 17,
        control: "slider",
        min: 0,
        max: 1000,
        step: 1,
    },
});

export const manifest = {
  "version": 2,
  "name": "Painted mountain rock",
  "isAnimated": false,
  "usesMouse": false
}
