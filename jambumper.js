import * as input from "./input.js";
import * as audio from "./audio.js";

let PI = Math.PI;
let TAU = 2 * PI;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let raycaster = new THREE.Raycaster();

let pointerGeometry = new THREE.SphereBufferGeometry(0.5);
let pointerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
let pointer = new THREE.Mesh(pointerGeometry, pointerMaterial);
let pointerDepth = 20; // relative to camera group coords
scene.add(pointer);

var cubes = [];
let cubeGroup = new THREE.Group();
var currX = -63;
for (var i = 0; i < audio.bufferLength; i++) {
    let geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    let material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    let cube = new THREE.Mesh(geometry, material);
    cube.position.x = currX;
    currX += 2;

    cubes.push(cube);
    cubeGroup.add(cube);
}
scene.add(cubeGroup);

cameraGroup.position.z = 100;

var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.x = 1;
directionalLight.position.y = 1;
directionalLight.position.z = 1;
scene.add(directionalLight);

function animate() {
    requestAnimationFrame(animate);

    audio.onTick();

    // pointer track mouse
    let zUnit = new THREE.Vector3(0, 0, 1);
    let plane = new THREE.Plane(zUnit, pointerDepth);
    plane.applyMatrix4(cameraGroup.matrix);
    let localizedMouse = new THREE.Vector2();
    localizedMouse.x = (input.currentPosition.x / window.innerWidth) * 2 - 1;
    localizedMouse.y = -(input.currentPosition.y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(localizedMouse, camera);
    raycaster.ray.intersectPlane(plane, pointer.position);

    // fft animation
    for (var i = 0; i < audio.bufferLength; i++) {
        let barHeight = audio.fft[i]/2;
        cubes[i].scale.y = barHeight + 0.001;
    }
    pointer.scale.x = audio.fft[4]/1000 + 0.001;
    pointer.scale.y = audio.fft[4]/1000 + 0.001;
    pointer.scale.z = audio.fft[4]/1000 + 0.001;

    // move pointer along z
    if (input.keys["q"]) {
        pointerDepth += 1;
    }
    if (input.keys["e"]) {
        pointerDepth -= 1;
    }

    // keyboard camera pan
    if (input.keys["w"]) {
        cameraGroup.translateY(5);
    }
    if (input.keys["s"]) {
        cameraGroup.translateY(-5);
    }
    if (input.keys["a"]) {
        cameraGroup.translateX(-5);
    }
    if (input.keys["d"]) {
        cameraGroup.translateX(5);
    }

    // reset rotation
    if (input.keys["r"]) {
        cubeGroup.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    }
    // mouse rotation
    let mouseDelta = input.getMouseDelta();
    if (input.buttons[input.BUTTON.RIGHT]) {
        let degY = mouseDelta.x * TAU / window.innerWidth;
        let degX = mouseDelta.y * TAU / window.innerHeight;

        cubeGroup.rotateY(degY);

        let unitX = new THREE.Vector3(1, 0, 0);
        cubeGroup.rotateOnAxis(cubeGroup.worldToLocal(unitX), degX);
    }

    // scroll wheel zoom
    cameraGroup.translateZ(input.scrollDelta.y);

    input.onTick();

    renderer.render(scene, camera);
}
animate();
