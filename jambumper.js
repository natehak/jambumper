import * as input from "./input.js";
import * as audio from "./audio.js";

let PI = 3.141592653589793238;
let TAU = 2 * PI;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

camera.position.z = 100;

var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.x = 1;
directionalLight.position.y = 1;
directionalLight.position.z = 1;
scene.add(directionalLight);

function animate() {
    requestAnimationFrame(animate);

    audio.onTick();

    // fft animation
    for (var i = 0; i < audio.bufferLength; i++) {
        let barHeight = audio.fft[i]/2;
        cubes[i].scale.y = barHeight + 0.001;
    }

    // keyboard camera pan
    if (input.keys["r"]) {
        cubeGroup.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    }
    if (input.keys["q"]) {
        let zUnit = new THREE.Vector3(0, 0, -5);
        zUnit.applyQuaternion(camera.quaternion);
        camera.position.add(zUnit);
    }
    if (input.keys["e"]) {
        let zUnit = new THREE.Vector3(0, 0, 5);
        zUnit.applyQuaternion(camera.quaternion);
        camera.position.add(zUnit);
    }
    if (input.keys["w"]) {
        let yUnit = new THREE.Vector3(0, 5, 0);
        yUnit.applyQuaternion(camera.quaternion);
        camera.position.add(yUnit);
    }
    if (input.keys["s"]) {
        let yUnit = new THREE.Vector3(0, -5, 0);
        yUnit.applyQuaternion(camera.quaternion);
        camera.position.add(yUnit);
    }
    if (input.keys["a"]) {
        let xUnit = new THREE.Vector3(-5, 0, 0);
        xUnit.applyQuaternion(camera.quaternion);
        camera.position.add(xUnit);
    }
    if (input.keys["d"]) {
        let xUnit = new THREE.Vector3(5, 0, 0);
        xUnit.applyQuaternion(camera.quaternion);
        camera.position.add(xUnit);
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
    let zUnit = new THREE.Vector3(0, 0, input.scrollDelta.y);
    zUnit.applyQuaternion(camera.quaternion);
    camera.position.add(zUnit);

    input.onTick();

    renderer.render(scene, camera);
}
animate();
