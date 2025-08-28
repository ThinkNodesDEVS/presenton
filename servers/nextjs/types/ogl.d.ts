declare module "ogl" {
  export class Renderer {
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    constructor(options?: {
      alpha?: boolean;
      premultipliedAlpha?: boolean;
      antialias?: boolean;
    });
    setSize(width: number, height: number): void;
    render(options: { scene: Mesh }): void;
  }

  export class Program {
    uniforms: Record<string, { value: any }>;
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options: {
        vertex: string;
        fragment: string;
        uniforms?: Record<string, { value: any }>;
      }
    );
  }

  export class Mesh {
    constructor(
      gl: WebGLRenderingContext | WebGL2RenderingContext,
      options: {
        geometry: Triangle;
        program: Program;
      }
    );
  }

  export class Color {
    r: number;
    g: number;
    b: number;
    constructor(hex: string);
  }

  export class Triangle {
    attributes: Record<string, any>;
    constructor(gl: WebGLRenderingContext | WebGL2RenderingContext);
  }
}
