import createProgram from "./createProgram.ts";
import vertexShaderSource from "../shaders/passthrough.vert";
import fragmentShaderSource from "../shaders/passthrough.frag";
import bufferTestMesh, { bufferTestMeshNormals } from "./bufferTestMesh.ts";
import resizeCanvasToDisplaySize from "./resizeCanvasToDisplaySize.ts";
import M4 from "./m4.ts";
import { degToRad } from "./math.ts";

function main() {

    // Get Canvas
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

    // Get Context
    const gl = canvas.getContext("webgl");
    if (!gl)
        return;

    // Create Program
    const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
    if (!program)
        return;


    // Get Attribute Locations
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const normalLocation = gl.getAttribLocation(program, "a_normal");
    const mvpLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    const worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    const colorLocation = gl.getUniformLocation(program, "u_color");
    const reverseLightDirectionLocation = gl.getUniformLocation(program, "u_reverseLightDirection");
    if (positionLocation < 0 ||
        normalLocation < 0 ||
        !mvpLocation ||
        !worldInverseTransposeLocation ||
        !colorLocation ||
        !reverseLightDirectionLocation)
        return;

    // Buffer Mesh
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    bufferTestMesh(gl);
    if (!positionBuffer)
        return;

    // Buffer Normals
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    bufferTestMeshNormals(gl);
    if (!normalBuffer)
        return;

    const drawScene = () => {

        // Set Canvas Size
        const canvas = gl.canvas as HTMLCanvasElement;
        resizeCanvasToDisplaySize(canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // WebGL Setup
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas
        gl.enable(gl.CULL_FACE); // Cull back faces.
        gl.enable(gl.DEPTH_TEST); // Enable the depth buffer

        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);

        // Enable the position attribute
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(
            positionLocation,
            3, // size
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );

        // Enable the color attribute
        gl.enableVertexAttribArray(normalLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(
            normalLocation,
            3, // size
            gl.FLOAT, // type
            false, // normalize
            0, // stride
            0 // offset
        );

        // Get Transformations
        const translation = [0, 0, -360];
        const rotation = [degToRad(0), degToRad(0), degToRad(0)];
        const scale = [1, 1, 1];
        const fieldOfViewRadians = degToRad(60);

        // Projection
        let projectionMatrix = M4.perspective(
            fieldOfViewRadians,
            canvas.clientWidth / canvas.clientHeight, // aspect
            1, // near
            2000 // far
        );
        projectionMatrix = M4.translate(projectionMatrix, translation[0], translation[1], translation[2]);
        projectionMatrix = M4.xRotate(projectionMatrix, rotation[0]);
        projectionMatrix = M4.yRotate(projectionMatrix, rotation[1]);
        projectionMatrix = M4.zRotate(projectionMatrix, rotation[2]);
        projectionMatrix = M4.scale(projectionMatrix, scale[0], scale[1], scale[2]);

        // Camera
        const cameraMatrix = M4.lookAt(
            [0, 0, 100], // Camera Position
            [0, 0, 0], // Target
            [0, 1, 0] // Up
        );

        // View
        const vMatrix = M4.inverse(cameraMatrix);
        const vpMatrix = M4.multiply(projectionMatrix, vMatrix);
        const worldMatrix = M4.yRotation(0);
        const mvpMatrix = M4.multiply(vpMatrix, worldMatrix);
        const worldInverseMatrix = M4.inverse(worldMatrix);
        const worldInverseTransposeMatrix = M4.transpose(worldInverseMatrix);

        // Set the matrices
        gl.uniformMatrix4fv(mvpLocation, false, mvpMatrix);
        gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);

        // Set Color
        gl.uniform4fv(colorLocation, [0.2, 1, 0.2, 1]); // green

        // Set Light Direction
        gl.uniform3fv(reverseLightDirectionLocation, M4.normalize([-0.5, -0.5, -0.5]));

        // Draw the geometry.
        gl.drawArrays(
            gl.TRIANGLES, // Primitive Type
            0, // Offset
            16 * 6 // Count
        );
    }

    // Draw Scene
    drawScene();
}

main();