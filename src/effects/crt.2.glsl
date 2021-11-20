#define SHADER_NAME SCALINE_FS

precision mediump float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uMainSampler;
varying vec2 outTexCoord;

float noise(vec2 pos) {
  return fract(sin(dot(pos, vec2(12.9898 - uTime,78.233 + uTime))) *
    43758.5453);
}

float onOff(float a, float b, float c) {
  return step(c, sin(uTime + a*cos(uTime*b)));
}

float ramp(float y, float start, float end) {
  float inside = step(start,y) - step(end,y);
  float fact = (y-start)/(end-start)*inside;
  return (1.-fact) * inside;
}

float stripes(vec2 uv) {
  float noi = noise(uv*vec2(0.5,1.) + vec2(1.,3.));
  return ramp(mod(uv.y*4. + uTime/2.+sin(uTime + sin(uTime*0.63)),2.),0.8,0.9)*0.1;
}

vec2 screenDistort(vec2 uv) {
  uv -= vec2(.5,.5);
  uv = uv*1.2*(1./1.2+2.*uv.x*uv.x*uv.y*uv.y);
  uv += vec2(.5,.5);
  return uv + clamp(1.0 - (uv + 0.1) * 3.0, 0.0, 1.0) * 0.08;
}

vec3 getVideo(vec2 uv) {
  vec2 look = uv;
  float window = 1./(1.+4.*(look.y-mod(uTime/1.,1.))*(look.y-mod(uTime/4.,1.)));
  look.x = look.x + sin(look.y*10. + uTime)/50.*onOff(4.,4.,.3)*(1.+cos(uTime*80.))*window;
  float vShift = 0.4*onOff(2.,3.,.9)*(sin(uTime)*sin(uTime*20.) + 
    (0.9 + 0.1*sin(uTime*200.)*cos(uTime)));
  look.y = mod(look.y + vShift, 1.);
  vec3 video = vec3(texture2D(uMainSampler,look));
  return video;
}

void main( void ) {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv = screenDistort(uv);
  vec3 video = getVideo(uv);
  float vigAmt = 3.+.3*sin(uTime + 5.*cos(uTime*5.));
  float vignette = (.9-vigAmt*(uv.y-.5)*(uv.y-.5))*(1.-vigAmt*(uv.x-.5)*(uv.x-.5));

  // video += stripes(uv);
  video += noise(uv)/8.;
  video *= vignette;
  video *= (12.+mod(uv.y*30.+uTime,1.))/13.;
  gl_FragColor = vec4(video, 1.0);
}
