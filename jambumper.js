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
    source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
});

analyser.fftSize = 256;
bufferLength = analyser.frequencyBinCount;
var data = new Uint8Array(bufferLength);

var cubes = [];
let cubeGroup = new THREE.Group();
var currX = -63;
for (i = 0; i < bufferLength; i++) {
    geometry = new THREE.BoxGeometry(1, 1, 1);
    material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
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

var keyse = {};
window.addEventListener("keydown", (e) => {
    keyse[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keyse[e.key] = false;
});

var last = null;
window.addEventListener("mousedown", (e) => {
    if (e.buttons === 2) {
        last = { x: e.clientX, y: e.clientY };
    }
});
window.addEventListener("mousemove", (e) => {
    if (last !== null) {
        // movement across screen's X axis means we want to rotate across Y axis and vice versa
        degY = (e.clientX - last.x) * TAU / window.innerWidth;
        degX = (e.clientY - last.y) * TAU / window.innerHeight;

        cubeGroup.rotateY(degY);

        unitX = new THREE.Vector3(1, 0, 0);
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
        barHeight = data[i]/2;
        cubes[i].scale.y = barHeight + 0.001;
    }
    if (keyse["r"]) {
        cubeGroup.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    }
    if (keyse["q"]) {
        zUnit = new THREE.Vector3(0, 0, -5);
        zUnit.applyQuaternion(camera.quaternion);
        camera.position.add(zUnit);
    }
    if (keyse["e"]) {
        zUnit = new THREE.Vector3(0, 0, 5);
        zUnit.applyQuaternion(camera.quaternion);
        camera.position.add(zUnit);
    }
    if (keyse["w"]) {
        yUnit = new THREE.Vector3(0, 5, 0);
        yUnit.applyQuaternion(camera.quaternion);
        camera.position.add(yUnit);
    }
    if (keyse["s"]) {
        yUnit = new THREE.Vector3(0, -5, 0);
        yUnit.applyQuaternion(camera.quaternion);
        camera.position.add(yUnit);
    }
    if (keyse["a"]) {
        xUnit = new THREE.Vector3(-5, 0, 0);
        xUnit.applyQuaternion(camera.quaternion);
        camera.position.add(xUnit);
    }
    if (keyse["d"]) {
        xUnit = new THREE.Vector3(5, 0, 0);
        xUnit.applyQuaternion(camera.quaternion);
        camera.position.add(xUnit);
    }

    renderer.render(scene, camera);
}
animate();
