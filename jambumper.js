import * as THREE from "./three.module.js";

import * as input from "./input.js";
import * as audio from "./audio.js";
import * as pointer from "./pointer.js";
import * as userGroup from "./userGroup.js";
import * as cli from "./cli.js";

let PI = Math.PI;
let TAU = 2 * PI;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

pointer.init(scene);
userGroup.init(scene);

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

    if (!cli.typing) {
        // move pointer along z
        if (input.keys["q"]) {
            pointer.increasePointerDepth(1);
        }
        if (input.keys["e"]) {
            pointer.increasePointerDepth(-1);
        }

        // keyboard camera pan
        if (input.keys["w"]) {
            camera.translateY(5);
        }
        if (input.keys["s"]) {
            camera.translateY(-5);
        }
        if (input.keys["a"]) {
            camera.translateX(-5);
        }
        if (input.keys["d"]) {
            camera.translateX(5);
        }

        // reset rotation
        if (input.keys["r"]) {
            cubeGroup.setRotationFromEuler(new THREE.Euler(0, 0, 0));
            userGroup.userGroup.setRotationFromEuler(new THREE.Euler(0, 0, 0));
        }
    }
    // mouse rotation
    let mouseDelta = input.getMouseDelta();
    if (input.buttons[input.BUTTON.RIGHT]) {
        let degY = mouseDelta.x * TAU / window.innerWidth;
        let degX = mouseDelta.y * TAU / window.innerHeight;

        cubeGroup.rotateY(degY);
        userGroup.userGroup.rotateY(degY);

        let unitX = new THREE.Vector3(1, 0, 0);
        cubeGroup.rotateOnAxis(cubeGroup.worldToLocal(unitX), degX);
        directionalLight.rotateOnAxis(directionalLight.worldToLocal(unitX), degX);
        userGroup.userGroup.rotateOnAxis(userGroup.userGroup.worldToLocal(unitX), degX);
    }


    // scroll wheel zoom
    camera.translateZ(input.scrollDelta.y);

    camera.updateMatrixWorld(true);
    pointer.onTick(camera);
    userGroup.onTick();
    input.onTick();

    renderer.render(scene, camera);
}
animate();
