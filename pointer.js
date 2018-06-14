import * as THREE from "./three.module.js";
import * as input from "./input.js";
import * as userGroup from "./userGroup.js";
import {reset} from "./cli.js";

let raycaster = new THREE.Raycaster();

export let pointer = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshToonMaterial({ color: 0x00ffff, wireframe: true}));
export let pointerOnTick = [reset]; // list of fns that take mesh as an argument

var pointerDepth = 10; // relative to camera group coords
var didSpawn = false;

export function init(scene) {
    scene.add(pointer);
}

export function increasePointerDepth(f) {
    pointerDepth += f;
}

export function onTick(camera) {
    // pointer track mouse
    let zUnit = new THREE.Vector3(0, 0, 1);
    let plane = new THREE.Plane(zUnit, pointerDepth);
    plane.applyMatrix4(camera.matrix);
    let localizedMouse = new THREE.Vector2();
    localizedMouse.x = (input.currentPosition.x / window.innerWidth) * 2 - 1;
    localizedMouse.y = -(input.currentPosition.y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(localizedMouse, camera);
    raycaster.ray.intersectPlane(plane, pointer.position);

    if (!didSpawn && input.buttons[input.BUTTON.LEFT]) {
        didSpawn = true;
        userGroup.spawn(pointer, pointerOnTick);
    }
    if (!input.buttons[input.BUTTON.LEFT]) {
        didSpawn = false;
    }

    for (var i = 0; i < pointerOnTick.length; i++) {
        pointerOnTick[i](pointer);
    }
}

