export default interface RenderObject {
    // Transform
    position: number[];
    rotation: number[];
    scale: number[];

    // Color
    baseColor: number[];
    diffuseColor: number[];
    specularColor: number[];
    shininess: number;
    specularStrength: number;
}