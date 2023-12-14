import createProgram from "./createProgram.ts";
import vertexShaderSource from "../shaders/passthrough.vert";
import fragmentShaderSource from "../shaders/passthrough.frag";
import resizeCanvasToDisplaySize from "./resizeCanvasToDisplaySize.ts";
import M4 from "./m4.ts";
import { degToRad } from "./math.ts";
import bufferTestMesh, { bufferTestMeshNormals } from "./bufferTestMesh.ts";
import FlappyBird from "./game/FlappyBird.ts";

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
    const worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
    const lightWorldPosition = gl.getUniformLocation(program, "u_lightWorldPos");
    const worldLocation = gl.getUniformLocation(program, "u_world");
    const viewInverseLocation = gl.getUniformLocation(program, "u_viewInverse");
    const worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
    const lightColorLocation = gl.getUniformLocation(program, "u_lightColor");
    const baseColorLocation = gl.getUniformLocation(program, "u_colorMult");
    const diffuseColorLocation = gl.getUniformLocation(program, "u_diffuse");
    const specularColorLocation = gl.getUniformLocation(program, "u_specular");
    const shininessLocation = gl.getUniformLocation(program, "u_shininess");
    const specularStrengthLocation = gl.getUniformLocation(program, "u_specularFactor");

    if (positionLocation < 0 ||
        normalLocation < 0 ||
        !lightWorldPosition ||
        !viewInverseLocation ||
        !lightColorLocation ||
        !baseColorLocation ||
        !diffuseColorLocation ||
        !specularColorLocation ||
        !shininessLocation ||
        !specularStrengthLocation ||
        !worldViewProjectionLocation ||
        !worldLocation ||
        !worldInverseTransposeLocation)
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

    // Create Game
    const game = new FlappyBird();

    // Draw the scene.
    let lastFrameTime = performance.now();
    let averageFPS = 0;
    const drawScene = () => {
        resizeCanvasToDisplaySize(canvas);
        const fps = 1 / ((performance.now() - lastFrameTime) / 1000);
        lastFrameTime = performance.now();
        averageFPS = (averageFPS + fps) / 2;
        console.log("FPS:" + fps.toFixed(2), "AVG:" + averageFPS.toFixed(2));

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        // Compute the projection matrix
        const fieldOfViewRadians = degToRad(60);
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const projectionMatrix = M4.perspective(fieldOfViewRadians, aspect, 1, 2000);

        // Compute the camera's matrix using look at.
        const cameraMatrix = M4.lookAt(
            [0, 0, -400],
            [0, 0, 0],
            [0, 1, 0]
        );

        // Make a view matrix from the camera matrix.
        const viewMatrix = M4.inverse(cameraMatrix);
        const viewProjectionMatrix = M4.multiply(projectionMatrix, viewMatrix);

        gl.useProgram(program);

        // Set Attribute Locations
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(normalLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

        // Bind the indices.
        //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Set the uniforms that are the same for all objects.
        gl.uniform3fv(lightWorldPosition, [-50, 30, 100]);
        gl.uniform4fv(lightColorLocation, [1, 1, 1, 1]);
        gl.uniformMatrix4fv(viewInverseLocation, false, M4.inverse(viewMatrix));

        // Update Game
        game.update();

        // Draw objects
        const objects = game.getRenderables();
        objects.forEach((object) => {

            // Compute a position for this object based on the time.
            let worldMatrix = M4.xRotation(object.rotation[0]);
            worldMatrix = M4.yRotate(worldMatrix, object.rotation[1]);
            worldMatrix = M4.zRotate(worldMatrix, object.rotation[2]);
            worldMatrix = M4.translate(worldMatrix, object.position[0], object.position[1], object.position[2]);
            worldMatrix = M4.scale(worldMatrix, object.scale[0], object.scale[1], object.scale[2]);

            // Multiply the matrices.
            const worldViewProjectionMatrix = M4.multiply(viewProjectionMatrix, worldMatrix);
            const worldInverseTransposeMatrix = M4.transpose(M4.inverse(worldMatrix));

            // Set the uniforms we just computed
            gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
            gl.uniformMatrix4fv(worldLocation, false, worldMatrix);
            gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);

            // Set the uniforms that are specific to this object.
            gl.uniform4fv(baseColorLocation, object.baseColor);
            gl.uniform4fv(diffuseColorLocation, object.diffuseColor);
            gl.uniform4fv(specularColorLocation, object.specularColor);
            gl.uniform1f(shininessLocation, object.shininess);
            gl.uniform1f(specularStrengthLocation, object.specularStrength);

            // Draw the geometry.
            //gl.drawElements(gl.TRIANGLES, buffers.numElements, gl.UNSIGNED_SHORT, 0);
            gl.drawArrays(
                gl.TRIANGLES, // Primitive Type
                0, // Offset
                16 * 6 // Count
            );
        });

        requestAnimationFrame(drawScene);
    }

    requestAnimationFrame(drawScene);
}

main();