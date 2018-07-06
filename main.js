import * as THREE from "./three.module.js";
import * as audio from "./audio.js";
import * as input from "./input.js";
import * as cli from "./cli.js";
import * as gfx from "./gfx.js";

const TAU = Math.PI * 2;

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z += 10;
scene.add(camera);

let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.x = 1;
directionalLight.position.y = 1;
directionalLight.position.z = 1;
scene.add(directionalLight);

var directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight2.position.x = -1;
directionalLight2.position.y = -1;
directionalLight2.position.z = 1;
scene.add(directionalLight2);

let lastFrameId = 0; // use window.cancelAnimationFrame(lastFrameId) to stop ticking
let lastTimestamp = performance.now();

gfx.onInit(scene);

function tick(tFrame) {
    lastFrameId = window.requestAnimationFrame(tick);
    let tDelta = tFrame - lastTimestamp;

    audio.onTick();

    cli.onTick(tDelta);
    gfx.onTick(tDelta);

    // mouse rotation
    let mouseDelta = input.getMouseDelta();
    if (input.buttons[input.BUTTON.LEFT]) {
        let degY = mouseDelta.x * TAU / window.innerWidth;
        let degX = mouseDelta.y * TAU / window.innerHeight;

        let unitX = new THREE.Vector3(1, 0, 0);
        let unitY = new THREE.Vector3(0, 1, 0);
        gfx.topPathoid.obj3d.rotateOnAxis(gfx.topPathoid.obj3d.worldToLocal(unitX), degX);
        gfx.topPathoid.obj3d.rotateOnAxis(gfx.topPathoid.obj3d.worldToLocal(unitY), degY);
    }

    // reset mouse rotation
    if (input.keys["r"] && !cli.typing) {
        gfx.topPathoid.obj3d.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    }

    input.onTick();

    lastTimestamp = tFrame;

    renderer.render(scene, camera);
}
tick(lastTimestamp);
