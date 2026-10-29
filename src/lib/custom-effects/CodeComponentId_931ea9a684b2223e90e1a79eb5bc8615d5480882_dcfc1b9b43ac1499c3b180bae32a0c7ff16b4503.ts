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
  cloudColor: vec4f,
  shadowColor: vec4f,
  opacity: vec4f,
  cloudScale: vec4f,
  coverage: vec4f,
  edgeSoftness: vec4f,
  fadeWidth: vec4f,
  paintTexture: vec4f,
  pigmentVariation: vec4f,
  brushDirection: vec4f,
  brushStretch: vec4f,
  cloudPosition: vec4f,
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

fn paintHash(p: vec2f) -> f32 {

  var q = fract(vec3f(p.x, p.y, p.x) * 0.1031);

  q = q + dot(q, q.yzx + vec3f(33.33));

  return fract((q.x + q.y) * q.z);

}

fn washNoise(p: vec2f) -> f32 {

  let cell = floor(p);

  let f = fract(p);

  let w = f * f * (3.0 - 2.0 * f);

  return mix(mix(paintHash(cell), paintHash(cell + vec2f(1.0, 0.0)), w.x),

             mix(paintHash(cell + vec2f(0.0, 1.0)), paintHash(cell + vec2f(1.0)), w.x), w.y);

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
  let cloudColor = u.cloudColor;
  let shadowColor = u.shadowColor;
  let opacity = u.opacity.x;
  let cloudScale = u.cloudScale.x;
  let coverage = u.coverage.x;
  let edgeSoftness = u.edgeSoftness.x;
  let fadeWidth = u.fadeWidth.x;
  let paintTexture = u.paintTexture.x;
  let pigmentVariation = u.pigmentVariation.x;
  let brushDirection = u.brushDirection.x;
  let brushStretch = u.brushStretch.x;
  let cloudPosition = u.cloudPosition.xy;
  let seed = u.seed.x;
  // All geometry uses isotropic layer-relative coordinates: no stretched circles.
  let shorterSide = max(min(dims.x, dims.y), 1.0);
  let local = (uv - cloudPosition / 100.0) * dims / shorterSide / max(cloudScale, 0.01);
  let radians = brushDirection * 0.01745329252;
  let cs = cos(radians);
  let sn = sin(radians);
  let p = vec2f(cs * local.x + sn * local.y, -sn * local.x + cs * local.y);
  let seedOffset = vec2f(seed * 1.713, seed * 0.917);
  let spread = mix(0.66, 1.20, coverage);
  let feather = mix(0.12, 0.65, edgeSoftness);
  var transmission = 1.0;
  var accumulatedTone = 0.0;
  var accumulatedWeight = 0.0;
  // A handful of elongated hand-laid washes, not volumetric cloud turbulence.
  for (var i = 0; i < 9; i = i + 1) {
    let fi = f32(i);
    let h = paintHash(vec2f(fi * 7.31, seed + 0.35));
    let h2 = paintHash(vec2f(fi + 42.0, seed * 0.81));
    let x = (fi / 8.0 - 0.5) * 1.16 * spread;
    let y = sin(fi * 1.8 + 0.5) * 0.115 + (h - 0.5) * 0.12;
    let center = vec2f(x, y);
    let size = vec2f((0.24 + 0.07 * h) * brushStretch, 0.17 + 0.09 * h2) * spread;
    let offset = p - center;
    let curved = vec2f(offset.x, offset.y + sin(offset.x * 5.0 + fi) * 0.022);
    let radial = length(curved / size);
    let edge = (washNoise(p * 7.0 + seedOffset + vec2f(fi * 2.3)) - 0.5) * 0.15;
    let wash = 1.0 - smoothstep(1.0 - feather, 1.08, radial + edge);
    let washStrength = wash * (0.40 + h * 0.13);
    transmission = transmission * (1.0 - washStrength);
    accumulatedTone = accumulatedTone + washStrength * (0.32 + h2 * 0.55);
    accumulatedWeight = accumulatedWeight + washStrength;
  }
  let coarse = washNoise(p * 9.0 + seedOffset);
  let medium = washNoise(p * vec2f(24.0, 38.0) + seedOffset + vec2f(19.0));
  let fine = washNoise(p * 115.0 + seedOffset + vec2f(8.0));
  let pigment = (coarse - 0.5) * 0.52 + (medium - 0.5) * 0.30;
  let baseTone = accumulatedTone / max(accumulatedWeight, 0.001);
  let tone = clamp(baseTone + pigment * pigmentVariation * 1.35, 0.0, 1.0);
  let tint = mix(shadowColor, cloudColor, tone);
  // Quiet paper/pigment texture modulates wash density without speckled holes.
  let textureDensity = clamp(1.0 + paintTexture * ((medium - 0.5) * 0.36 + (fine - 0.5) * 0.25), 0.0, 1.2);
  // Transparent margin is relative to the rectangular raster, not arbitrary vector edges.
  let boundary = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  let marginFade = smoothstep(0.015, 0.015 + fadeWidth / 100.0, boundary);
  let alpha = clamp((1.0 - transmission) * textureDensity * opacity * tint.a * marginFade, 0.0, 1.0);
  return vec4f(tint.rgb, alpha);
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
        size: 240,
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
    var width = Math.max(1, finiteNumber(output.width, 1));
    var height = Math.max(1, finiteNumber(output.height, 1));
    var time = 0;
    var inputWidth = width;
    var inputHeight = height;
    device.queue.writeBuffer(frame.state.uniformBuf, 0, new Float32Array([
        time, width, height, 0,
        inputWidth, inputHeight, 0, 0,
        ...colorParam("cloudColor", [0.4, 0.61, 0.62, 1]),
        ...colorParam("shadowColor", [0.18, 0.33, 0.37, 1]),
        numberParam("opacity", 0.78), 0, 0, 0,
        numberParam("cloudScale", 1), 0, 0, 0,
        numberParam("coverage", 0.56), 0, 0, 0,
        numberParam("edgeSoftness", 0.64), 0, 0, 0,
        numberParam("fadeWidth", 18), 0, 0, 0,
        numberParam("paintTexture", 0.22), 0, 0, 0,
        numberParam("pigmentVariation", 0.38), 0, 0, 0,
        numberParam("brushDirection", -8), 0, 0, 0,
        numberParam("brushStretch", 1.35), 0, 0, 0,
        ...pointParam("cloudPosition", [50, 50]), 0, 0,
        numberParam("seed", 7), 0, 0, 0,
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
    "cloudColor": {
        type: "color",
        label: "Cloud color",
        defaultValue: { "r": 0.4, "g": 0.61, "b": 0.62, "a": 1 },
    },
    "shadowColor": {
        type: "color",
        label: "Shadow color",
        defaultValue: { "r": 0.18, "g": 0.33, "b": 0.37, "a": 1 },
    },
    "opacity": {
        type: "number",
        label: "Opacity",
        defaultValue: 0.78,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "cloudScale": {
        type: "number",
        label: "Cloud scale",
        defaultValue: 1,
        control: "slider",
        min: 0.25,
        max: 2,
        step: 0.01,
    },
    "coverage": {
        type: "number",
        label: "Coverage",
        defaultValue: 0.56,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "edgeSoftness": {
        type: "number",
        label: "Edge softness",
        defaultValue: 0.64,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "fadeWidth": {
        type: "number",
        label: "Fade width",
        defaultValue: 18,
        control: "slider",
        min: 2,
        max: 45,
        step: 1,
        unit: "%",
    },
    "paintTexture": {
        type: "number",
        label: "Paint texture amount",
        defaultValue: 0.22,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "pigmentVariation": {
        type: "number",
        label: "Pigment variation",
        defaultValue: 0.38,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "brushDirection": {
        type: "number",
        label: "Brush direction",
        defaultValue: -8,
        control: "slider",
        min: -180,
        max: 180,
        step: 1,
        unit: "°",
    },
    "brushStretch": {
        type: "number",
        label: "Brush stretch",
        defaultValue: 1.35,
        control: "slider",
        min: 0.5,
        max: 2.5,
        step: 0.01,
    },
    "cloudPosition": {
        type: "point",
        label: "Cloud position",
        defaultValue: { "x": 50, "y": 50 },
        control: "point",
        mode: "canvas_and_ui",
        unit: "%",
    },
    "seed": {
        type: "number",
        label: "Seed",
        defaultValue: 7,
        control: "input",
        min: 0,
        max: 10000,
        step: 1,
    },
});

export const manifest = {
  "version": 2,
  "name": "Watercolor cloud",
  "isAnimated": false,
  "usesMouse": false
}


