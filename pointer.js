import * as THREE from "./three.module.js";
import * as input from "./input.js";
import * as audio from "./audio.js";

let raycaster = new THREE.Raycaster();

let pointer = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.5),
    new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true}));
var pointerDepth = 10; // relative to camera group coords

// TODO mesh swapping, material swapping, motion, scale, different spawners, mesh patterns
// (rings, squares, triangles, polygons, polyhedrons)

var didSpawn = false;

let cli = document.getElementById("cli");
export var typing = false;

let userMeshOnTicks = []; // mesh --> list of of fns that take mesh as arg
export let userGroup = new THREE.Group();

let pointerOnTick = [reset]; // list of fns that take mesh as an argument

function reset(mesh) {
    mesh.scale.x = 1;
    mesh.scale.y = 1;
    mesh.scale.z = 1;
}

function fft_gen(x, y, z) {
    return (mesh) => { 
        mesh.scale.x *= x < 0 ? 1 : audio.fft[x] / 100;
        mesh.scale.x += 0.001;
        mesh.scale.y *= y < 0 ? 1 : audio.fft[y] / 100;
        mesh.scale.y += 0.001;
        mesh.scale.z *= z < 0 ? 1 : audio.fft[z] / 100;
        mesh.scale.z += 0.001;
    };
}

let commands = {
    "help": (args) => cli.innerHTML = Object.keys(commands).join("\n"),

    "color": (args) => changePointerColor(parseInt(args[0], 16)),
    "red": (args) => changePointerColor(0xff0000),
    "blue": (args) => changePointerColor(0x0000ff),
    "green": (args) => changePointerColor(0x00ff00),
    "white": (args) => changePointerColor(0xffffff),
    "black": (args) => changePointerColor(0x000000),
    "yellow": (args) => changePointerColor(0xffff00),
    "purple": (args) => changePointerColor(0xff00ff),
    "cyan": (args) => changePointerColor(0x00ffff),

    "cube": (args) => pointer.geometry = new THREE.BoxBufferGeometry(),
    "sphere": (args) => pointer.geometry = new THREE.SphereBufferGeometry(),

    "fft": (args) => {
        let x = args[0].includes("x") ? parseInt(args[1], 10) : -1;
        let y = args[0].includes("y") ? parseInt(args[1], 10) : -1;
        let z = args[0].includes("z") ? parseInt(args[1], 10) : -1;
        pointerOnTick.push(fft_gen(x, y, z));
    },

    "reset": (args) => { pointerOnTick = [reset] }
};

function changePointerColor(color) {
    pointer.material.color.setHex(color);
}

function spawn() {
    let mat = pointer.material.clone();
    mat.wireframe = false;
    let mesh = new THREE.Mesh(pointer.geometry.clone(), mat);
    let meshPos = userGroup.worldToLocal(pointer.position);
    mesh.position.set(meshPos.x, meshPos.y, meshPos.z);
    userGroup.add(mesh);
    userMeshOnTicks.push({ mesh: mesh, onTick: pointerOnTick.slice() });
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

    for (var i = 0; i < pointerOnTick.length; i++) {
        pointerOnTick[i](pointer);
    }
    for (var i = 0; i < userMeshOnTicks.length; i++) {
        let mesh = userMeshOnTicks[i].mesh;
        let onTicks = userMeshOnTicks[i].onTick;
        for (var j = 0; j < onTicks.length; j++) {
            onTicks[j](mesh);
        }
    }
}

function execute(cmd) {
    cmd = cmd.trim().toLowerCase().split(/\s\s*/);
    commands[cmd[0]](cmd.slice(1));
}

// temp hack, if any other modules need typing ability, move this to input.js and provide
// some sort of callback interface
window.addEventListener("keypress", (e) => {
    if (typing) {
        e.preventDefault();
        if (e.key === "Enter") {
            let cmd = cli.innerHTML;
            cli.innerHTML = "";
            typing = false;
            execute(cmd);
        } else if (e.key === "Backspace") {
            cli.innerHTML = cli.innerHTML.slice(0, -1);
        } else if (e.key === "Escape") {
            cli.innerHTML = "";
            typing = false;
        } else {
            cli.innerHTML += e.key;
        }
    } else if (!typing && (e.key === " " || e.key === "Enter")) {
        cli.innerHTML = "";
        typing = true;
    }
});
