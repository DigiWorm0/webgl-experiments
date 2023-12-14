import createShader from "./createShader.ts";

/**
 * Creates a WebGL Program from a Vertex and Fragment Shader
 * @param gl - WebGL Context
 * @param vertexShaderSrc - Vertex Shader
 * @param fragmentShaderSrc - Fragment Shader
 */
export default function createProgram(gl: WebGLRenderingContext, vertexShaderSrc: string, fragmentShaderSrc: string) {

    // Create Shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
    if (!vertexShader || !fragmentShader)
        return;

    // Create Program
    const program = gl.createProgram();
    if (!program)
        return;

    // Attach Shaders
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // Handle Success
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success)
        return program;

    // Handle Error
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}