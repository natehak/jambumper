import * as THREE from "./three.module.js";

import * as input from "./input.js";
import * as audio from "./audio.js";
import * as userGroup from "./userGroup.js";
import * as cli from "./cli.js";

let PI = Math.PI;
let TAU = 2 * PI;

let PAN_SPEED = 2;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(camera);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

userGroup.init(scene);

camera.position.z = 100;

var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.x = 1;
directionalLight.position.y = 1;
directionalLight.position.z = 1;
scene.add(directionalLight);

function animate() {
    requestAnimationFrame(animate);

    audio.onTick();

    if (!cli.typing) {
        // zoom
        if (input.keys["q"]) {
            camera.translateZ(-PAN_SPEED);
        }
        if (input.keys["e"]) {
            camera.translateZ(PAN_SPEED);
        }

        // keyboard camera pan
        if (input.keys["w"]) {
            camera.translateY(PAN_SPEED);
        }
        if (input.keys["s"]) {
            camera.translateY(-PAN_SPEED);
        }
        if (input.keys["a"]) {
            camera.translateX(-PAN_SPEED);
        }
        if (input.keys["d"]) {
            camera.translateX(PAN_SPEED);
        }

        // reset rotation
        if (input.keys["r"]) {
            userGroup.userGroup.setRotationFromEuler(new THREE.Euler(0, 0, 0));
        }
    }
    // mouse rotation
    let mouseDelta = input.getMouseDelta();
    if (input.buttons[input.BUTTON.RIGHT]) {
        let degY = mouseDelta.x * TAU / window.innerWidth;
        let degX = mouseDelta.y * TAU / window.innerHeight;

        userGroup.userGroup.rotateY(degY);

        let unitX = new THREE.Vector3(1, 0, 0);
        userGroup.userGroup.rotateOnAxis(userGroup.userGroup.worldToLocal(unitX), degX);
    }


    camera.updateMatrixWorld(true);
    userGroup.onTick();
    cli.onTick();
    input.onTick();

    renderer.render(scene, camera);
}
animate();
