/**
 * Appends a rectangle to WebGL's current buffer
 * @param gl
 * @param x
 * @param y
 * @param width
 * @param height
 */
export default function bufferRectangle(
    gl: WebGLRenderingContext,
    x: number,
    y: number,
    width: number,
    height: number) {

    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2]), gl.STATIC_DRAW);
}