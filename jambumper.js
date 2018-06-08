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
var currX = -63;
for (i = 0; i < bufferLength; i++) {
    geometry = new THREE.BoxGeometry(1, 1, 1);
    material = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.x = currX;
    currX += 2;

    cubes.push(cube);
    scene.add(cube);
}

camera.position.z = 100;
camera.position.y = 50;

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
    last = { x: e.clientX, y: e.clientY };
});
window.addEventListener("mousemove", (e) => {
    if (last !== null) {
        // movement across screen's X axis means we want to rotate across Y axis and vice versa
        degY = (e.clientX - last.x) * TAU / window.innerWidth;
        degX = (e.clientY - last.y) * TAU / window.innerHeight;
        camera.rotateX(degX);
        camera.rotateY(degY);

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
    if (keyse["q"]) {
        yUnit = new THREE.Vector3(0, -5, 0);
        yUnit.applyQuaternion(camera.quaternion);
        camera.position.add(yUnit);
    }
    if (keyse["e"]) {
        yUnit = new THREE.Vector3(0, 5, 0);
        yUnit.applyQuaternion(camera.quaternion);
        camera.position.add(yUnit);
    }
    if (keyse["w"]) {
        zUnit = new THREE.Vector3(0, 0, -5);
        zUnit.applyQuaternion(camera.quaternion);
        camera.position.add(zUnit);
    }
    if (keyse["s"]) {
        zUnit = new THREE.Vector3(0, 0, 5);
        zUnit.applyQuaternion(camera.quaternion);
        camera.position.add(zUnit);
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
