import * as THREE from "./three.module.js";
import {typing} from "./cli.js";

let userMeshOnTicks = []; // mesh --> list of of fns that take mesh as arg
export let userGroup = new THREE.Group();

export function init(scene) {
    scene.add(userGroup);
}

export function spawn(pointer, pointerOnTick) {
    let mat = pointer.material.clone();
    mat.wireframe = false;
    let mesh = new THREE.Mesh(pointer.geometry.clone(), mat);
    let meshPos = userGroup.worldToLocal(pointer.position);
    mesh.position.set(meshPos.x, meshPos.y, meshPos.z);
    let m = new THREE.Matrix4();
    m.extractRotation(userGroup.matrix);
    m.getInverse(m);
    mesh.setRotationFromMatrix(m);
    userGroup.add(mesh);
    userMeshOnTicks.push({ mesh: mesh, onTick: pointerOnTick.slice() });
}

export function onTick() {
    for (var i = 0; i < userMeshOnTicks.length; i++) {
        let mesh = userMeshOnTicks[i].mesh;
        let onTicks = userMeshOnTicks[i].onTick;
        for (var j = 0; j < onTicks.length; j++) {
            onTicks[j](mesh);
        }
    }
}

window.addEventListener("keypress", (e) => {
    if (!typing && e.key === "u") {
        userGroup.children.pop();
    }
});
