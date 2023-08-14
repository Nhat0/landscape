

import * as THREE from './node_modules/three/src/Three';
import { OrbitControls } from './node_modules/three/examples/jsm/controls/OrbitControls';
import * as dat from './node_modules/lil-gui/dist/lil-gui.esm';
import { GLTFLoader } from './node_modules/three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from './node_modules/three/examples/jsm/loaders/RGBELoader';
import { EXRLoader } from './node_modules/three/examples/jsm/loaders/EXRLoader'
import { GroundProjectedSkybox } from './node_modules/three/examples/jsm/objects/GroundProjectedSkybox';


const gui = new dat.GUI();
const global = {};
const rgbeLoader = new RGBELoader();
const scene = new THREE.Scene();

const loader = new THREE.TextureLoader();
const map = loader.load('./static/hdr/digital_painting_beautiful_ocean.jpg')
map.mapping = THREE.EquirectangularReflectionMapping;
scene.background = map;
// scene.environment = map;
scene.colorSpace = THREE.SRGBColorSpace;



const holyDonut = new THREE.Mesh(
  new THREE.TorusGeometry(8, 0.5),
  new THREE.MeshBasicMaterial({ color: new THREE.Color(10, 4, 2) })
)
holyDonut.layers.enable(1);
holyDonut.position.y = 3.5;
scene.add(holyDonut);

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(
  256,
  {
    type: THREE.HalfFloatType
  });


scene.environment = cubeRenderTarget.texture;

const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);
cubeCamera.layers.set(1);
// const canvas = document.createElement('canvas');
// document.body.appendChild(canvas);

// const cubeLoader = new THREE.CubeTextureLoader();
// cubeLoader.setPath('./static/skybox/');
// const map = cubeLoader.load([
//   'px.jpg', 'nx.jpg',
//   'py.jpg', 'ny.jpg',
//   'pz.jpg', 'nz.jpg'
// ]);
// scene.environment = map;
// scene.background = map;

// scene.backgroundBlurriness = 0.2;
// scene.backgroundIntensity = 2;

gui.add(scene, 'backgroundBlurriness').min(0).max(10).step(0.001).name('background-Blur');
gui.add(scene, 'backgroundIntensity').min(0).max(10).step(0.001).name('background-Intensity');


// rgbeLoader.load('./static/hdr/2k.hdr', (environmentMap) => {
//   environmentMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = environmentMap;
//   scene.environment = environmentMap;

//   const sky = new GroundProjectedSkybox(environmentMap);
//   sky.radius = 120;
//   sky.height = 11;
//   sky.scale.setScalar(50);
//   scene.add(sky);

//   gui.add(sky, 'radius').min(0).max(150).step(0.001);
//   gui.add(sky, 'height').min(0).max(20).step(0.001);
// });


const torusKnot = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1, 0.4, 100, 16),
  new THREE.MeshStandardMaterial({ roughness: 0, metalness: 1, color: 0xaaaaaa })
)
// torusKnot.material.envMap = map
torusKnot.position.set(-4, 4, 0);
scene.add(torusKnot);


// update all materials
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (child.isMesh && child.material.isMeshStandardMaterial) {
      //or with if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = global.envMapIntensity;

    }
  })
}
global.envMapIntensity = 1;
gui.add(global, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials);
const gltf = new GLTFLoader();
gltf.load(
  './static/gltf/FlightHelmet.gltf', (gltf) => {
    gltf.scene.scale.set(10, 10, 10);
    scene.add(gltf.scene);
    updateAllMaterials();
  }
)





const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(4, 5, 5);
scene.add(camera);






const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}


const renderer = new THREE.WebGLRenderer({
  antialias: true
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));



window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.y = 3.5;
controls.enableDamping = true;
const clock = new THREE.Clock();

const tick = () => {
  window.requestAnimationFrame(tick);
  const elapsedTime = clock.getElapsedTime();
  if (holyDonut) {
    holyDonut.rotation.x = Math.sin(elapsedTime) * 4;
    cubeCamera.update(renderer, scene);
  }

  controls.update();
  renderer.render(scene, camera);
  document.body.appendChild(renderer.domElement);
}
tick();

