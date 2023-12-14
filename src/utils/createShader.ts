/**
 * Creates a new WebGL Shader
 * @param gl - WebGL Context
 * @param type - Shader Type
 * @param source - Shader Source Code
 */
export default function createShader(gl: WebGLRenderingContext, type: number, source: string) {

    // Create Shader
    const shader = gl.createShader(type);
    if (!shader)
        return;

    // Compile Shader
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Handle Success
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success)
        return shader;

    // Handle Error
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}