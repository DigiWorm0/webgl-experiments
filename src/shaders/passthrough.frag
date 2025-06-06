//precision highp float; // <-- Uncomment to test
precision lowp float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;

uniform vec4 u_lightColor;
uniform vec4 u_colorMult;
uniform vec4 u_diffuse;
uniform vec4 u_specular;
uniform float u_shininess;
uniform float u_specularFactor;

vec4 lit(float l, float h, float m) {
    return vec4(1.0,
    abs(l),
    (l > 0.0) ? pow(max(0.0, h), m) : 0.0,
    1.0);
}

void main() {
    //vec4 diffuseColor = texture2D(u_diffuse, v_texCoord);
    vec4 diffuseColor = u_diffuse;
    vec3 a_normal = normalize(v_normal);
    vec3 surfaceToLight = normalize(v_surfaceToLight);
    vec3 surfaceToView = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLight + surfaceToView);
    vec4 litR = lit(dot(a_normal, surfaceToLight),
    dot(a_normal, halfVector), u_shininess);
    vec4 outColor = vec4((
    u_lightColor * (diffuseColor * litR.y * u_colorMult +
    u_specular * litR.z * u_specularFactor)).rgb,
    diffuseColor.a);
    gl_FragColor = outColor;
    //  gl_FragColor = vec4(litR.yyy, 1);
}