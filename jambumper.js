import * as input from "./input.js";

let PI = 3.141592653589793238;
let TAU = 2 * PI;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let audioCtx = new window.AudioContext();
let analyser = audioCtx.createAnalyser();
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    let source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
});

analyser.fftSize = 256;
let bufferLength = analyser.frequencyBinCount;
var data = new Uint8Array(bufferLength);

var cubes = [];
let cubeGroup = new THREE.Group();
var currX = -63;
for (var i = 0; i < bufferLength; i++) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
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

var last = null;
window.addEventListener("mousedown", (e) => {
    if (e.buttons === 2) {
        last = { x: e.clientX, y: e.clientY };
    }
});
window.addEventListener("mousemove", (e) => {
    if (last !== null) {
        // movement across screen's X axis means we want to rotate across Y axis and vice versa
        let degY = (e.clientX - last.x) * TAU / window.innerWidth;
        let degX = (e.clientY - last.y) * TAU / window.innerHeight;

        cubeGroup.rotateY(degY);

        let unitX = new THREE.Vector3(1, 0, 0);
        cubeGroup.rotateOnAxis(cubeGroup.worldToLocal(unitX), degX);

        last = { x: e.clientX, y: e.clientY };
    }
});
window.addEventListener("mouseup", (e) => {
    last = null;
});

function animate() {
    requestAnimationFrame(animate);
    analyser.getByteFrequencyData(data);
    for (var i = 0; i < bufferLength; i++) {
        let barHeight = data[i]/2;
        cubes[i].scale.y = barHeight + 0.001;
    }
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

    renderer.render(scene, camera);
}
animate();
