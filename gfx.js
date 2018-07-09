import * as THREE from "./three.module.js";
import * as paths from "./paths.js";
import { Pathoid } from "./pathoid.js";

const TAU = Math.PI * 2;

export function slower(t) {
    currentTop().cycleTime += t;
    currentTop().cycleTime = Math.max(0, currentTop().cycleTime);
}

export function doubleChildren() {
    return adjustPathoidChildren(currentTop().numChildren);
}
export function halfChildren() {
    return adjustPathoidChildren(-Math.floor(currentTop().numChildren/2));
}
export function adjustPathoidChildren(n) {
    return n > 0 ? currentTop().more(n) : currentTop().less(n);
}

export function up(scene) {
    scene.remove(currentTop().obj3d);
    stackPointer += 1;
    if (stack.length <= stackPointer) {
        stack.push(new Pathoid(stack[stackPointer-1], paths.genCircleParam(5), 1, 5000.0));
    }
    scene.add(currentTop().obj3d);
}

export function down(scene) {
    scene.remove(currentTop().obj3d);
    stackPointer -= 1;
    stackPointer = Math.max(0, stackPointer);
    scene.add(currentTop().obj3d);
}

let baseMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshPhysicalMaterial({ color: 0x0000ff })
);

function baseClone() {
    return {
        obj3d: baseMesh.clone(),
        onTick: function (tDelta) {
        },
        clone: baseClone,
    };
}

let base = baseClone();
let stack = [base];
let stackPointer = 0;

export function currentTop() {
    return stack[stackPointer];
}

export function onInit(scene) {
    scene.add(currentTop().obj3d);
}

export function onTick(tDelta) {
    currentTop().onTick(tDelta);
}
