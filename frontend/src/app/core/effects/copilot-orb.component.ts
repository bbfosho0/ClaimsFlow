import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject, signal } from '@angular/core';

@Component({
  selector: 'app-copilot-orb',
  standalone: true,
  templateUrl: './copilot-orb.component.html',
  styleUrl: './copilot-orb.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopilotOrbComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) private canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly zone = inject(NgZone);
  private gl?: WebGLRenderingContext;
  private program?: WebGLProgram;
  private buffer?: WebGLBuffer;
  private timeUniform: WebGLUniformLocation | null = null;
  private resolutionUniform: WebGLUniformLocation | null = null;
  private frameId = 0;
  private startedAt = 0;
  private visible = true;
  private observer?: IntersectionObserver;

  readonly fallback = signal(false);

  private readonly handleContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.zone.run(() => this.fallback.set(true));
  };

  ngAfterViewInit(): void {
    const reducedMotion = typeof globalThis.matchMedia === 'function'
      && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      this.fallback.set(true);
      return;
    }

    try {
      this.initializeRenderer();
      this.observeVisibility();
    } catch {
      this.fallback.set(true);
      this.disposeRenderer();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.stop();
    this.canvasRef?.nativeElement.removeEventListener('webglcontextlost', this.handleContextLost);
    this.disposeRenderer();
  }

  private initializeRenderer(): void {
    const canvas = this.canvasRef.nativeElement;
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    });
    if (!gl) throw new Error('WebGL unavailable');

    const vertexShader = this.compile(gl, gl.VERTEX_SHADER, `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `);
    const fragmentShader = this.compile(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      void main() {
        vec2 uv = (2.0 * gl_FragCoord.xy - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        float radius = length(uv);
        float angle = atan(uv.y, uv.x);
        float wave = sin(angle * 6.0 - u_time * 1.15 + sin(radius * 11.0 - u_time * 0.85) * 1.35);
        float pulse = 0.84 + 0.16 * sin(u_time * 0.72);
        float field = exp(-2.45 * radius * radius) * pulse;
        float core = exp(-13.0 * radius * radius);

        vec3 teal = vec3(0.09, 0.84, 0.69);
        vec3 cyan = vec3(0.14, 0.84, 0.95);
        vec3 violet = vec3(0.45, 0.42, 1.0);
        vec3 color = mix(teal, cyan, 0.5 + 0.5 * wave);
        color = mix(color, violet, smoothstep(0.28, 0.92, radius) * (0.42 + 0.12 * wave));
        color += core * vec3(0.72, 1.0, 0.96);

        float edge = smoothstep(1.08, 0.18, radius);
        float alpha = edge * field * (0.78 + 0.18 * wave);
        gl_FragColor = vec4(color * field * 1.35, alpha);
      }
    `);

    const program = gl.createProgram();
    if (!program) throw new Error('Program allocation failed');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) ?? 'Shader link failed');
    }

    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Buffer allocation failed');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    this.gl = gl;
    this.program = program;
    this.buffer = buffer;
    this.timeUniform = gl.getUniformLocation(program, 'u_time');
    this.resolutionUniform = gl.getUniformLocation(program, 'u_resolution');
    canvas.addEventListener('webglcontextlost', this.handleContextLost);
  }

  private compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('Shader allocation failed');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const detail = gl.getShaderInfoLog(shader) ?? 'Shader compilation failed';
      gl.deleteShader(shader);
      throw new Error(detail);
    }
    return shader;
  }

  private observeVisibility(): void {
    if (typeof globalThis.IntersectionObserver !== 'function') {
      this.start();
      return;
    }
    this.observer = new IntersectionObserver(entries => {
      this.visible = entries.some(entry => entry.isIntersecting);
      if (this.visible) this.start();
      else this.stop();
    }, { threshold: 0.05 });
    this.observer.observe(this.canvasRef.nativeElement);
  }

  private start(): void {
    if (this.frameId || !this.gl || !this.visible || this.fallback()) return;
    this.startedAt = performance.now();
    this.zone.runOutsideAngular(() => {
      const draw = (now: number) => {
        if (!this.gl || !this.program || !this.visible) {
          this.frameId = 0;
          return;
        }
        this.resize();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.program);
        this.gl.uniform1f(this.timeUniform, (now - this.startedAt) / 1000);
        this.gl.uniform2f(this.resolutionUniform, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
        this.frameId = requestAnimationFrame(draw);
      };
      this.frameId = requestAnimationFrame(draw);
    });
  }

  private stop(): void {
    if (!this.frameId) return;
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
  }

  private resize(): void {
    if (!this.gl) return;
    const canvas = this.canvasRef.nativeElement;
    const ratio = Math.min(globalThis.devicePixelRatio || 1, 2);
    const width = Math.max(56, Math.round(canvas.clientWidth * ratio));
    const height = Math.max(56, Math.round(canvas.clientHeight * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    this.gl.viewport(0, 0, width, height);
  }

  private disposeRenderer(): void {
    if (!this.gl) return;
    if (this.buffer) this.gl.deleteBuffer(this.buffer);
    if (this.program) this.gl.deleteProgram(this.program);
    this.buffer = undefined;
    this.program = undefined;
    this.gl = undefined;
  }
}
