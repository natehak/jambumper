import * as THREE from "./three.module.js";
import * as input from "./input.js";

let raycaster = new THREE.Raycaster();

let pointer = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true}));
var pointerDepth = 20; // relative to camera group coords

// TODO color swapping, mesh swapping, material swapping, motion, scale, different spawners

var didSpawn = false;

let cli = document.getElementById("cli");
export var typing = false;

let userMeshes = [];
export let userGroup = new THREE.Group();

function spawn() {
    let mat = pointer.material.clone();
    mat.wireframe = false;
    let mesh = new THREE.Mesh(pointer.geometry.clone(), mat);
    let meshPos = userGroup.worldToLocal(pointer.position);
    mesh.position.set(meshPos.x, meshPos.y, meshPos.z);
    userGroup.add(mesh);
    userMeshes.push(mesh);
}

export function init(scene) {
    scene.add(pointer);
    scene.add(userGroup);
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
        spawn();
    }
    if (!input.buttons[input.BUTTON.LEFT]) {
        didSpawn = false;
    }
}

function execute(cmd) {
    cmd = cmd.trim().toLowerCase().split(/\s\s*/);
    switch (cmd[0]) {
        case "color":
            pointer.material.color.setHex(parseInt(cmd[1], 16));
            break;
    }
}

// temp hack, if any other modules need typing ability, move this to input.js and provide
// some sort of callback interface
window.addEventListener("keypress", (e) => {
    if (typing) {
        e.preventDefault();
        if (e.key === "Enter") {
            execute(cli.innerHTML);
            cli.innerHTML = "";
            typing = false;
        } else if (e.key === "Backspace") {
            cli.innerHTML = cli.innerHTML.slice(0, -1);
        } else if (e.key === "Escape") {
            cli.innerHTML = "";
            typing = false;
        } else {
            cli.innerHTML += e.key;
        }
    }
    else if (!typing && (e.key === " " || e.key === "Enter")) {
        typing = true;
    }
});
