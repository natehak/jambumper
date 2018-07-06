import * as THREE from "./three.module.js";

function normalizeRange(A, B, x) {
    // from https://math.stackexchange.com/questions/43698/range-scaling-problem
    return ((-1.0 / (B - A)) * A) + ((1.0 / (B - A)) * x);
}

/* parametric fns */
function vecsToParam(vecs) {
    var len = 0;
    var intervals = [];
    for (var i = 1; i < vecs.length; i++) {
        var toAdd = { start: len, vec1: vecs[i-1], vec2: vecs[i] };
        len += vecs[i-1].distanceTo(vecs[i]);
        toAdd.end = len;
        intervals.push(toAdd);
    }

    return (t) => {
        t %= 1.0;
        for (var i = 0; i < intervals.length; i++) {
            let interval = intervals[i];
            let normStart = interval.start / len;
            let normEnd = interval.end / len;
            if (t >= normStart && t < normEnd) {
                let normalizedT = normalizeRange(normStart, normEnd, t);
                let toReturn = new THREE.Vector3();
                toReturn.lerpVectors(interval.vec1, interval.vec2, normalizedT);
                return toReturn;
            }
        }
    };
}
/*

let template = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshPhysicalMaterial({ color: 0xff00ff })
);

let baseGroup = new THREE.Group();
*/

let upperPath = vecsToParam([
    new THREE.Vector3(-10, 0, -8),
    new THREE.Vector3(0, -10, -10),
    new THREE.Vector3(10, 0, -8),
    new THREE.Vector3(0, 10, -10),
    new THREE.Vector3(0, 0, -20),
    new THREE.Vector3(-10, 0, -8)
]);

/*
let numMeshes = 0;
let cycleTime = 5000.0; // time in ms for path to complete

export function doubleMeshes() {
    return adjustNumMeshes(numMeshes);
}
export function halfMeshes() {
    return adjustNumMeshes(-Math.floor(numMeshes/2));
}
export function adjustNumMeshes(n) {
    return n > 0 ? more(n) : less(n);
}

function more(n) {
    numMeshes += n;
    for (var i = 0; i < n; i++) {
        baseGroup.add(template.clone());
    }
}

function less(n) {
    numMeshes += n;
    for (var i = 0; i < Math.abs(n); i++) {
        baseGroup.remove(baseGroup.children[0]);
    }
    numMeshes = Math.max(0, numMeshes);
}

export function slower(i) {
    cycleTime += i;
    cycleTime = Math.max(1.0, cycleTime);
}

export function onInit(scene) {
    adjustNumMeshes(13);
    baseGroup.position.z -= 10;
    scene.add(baseGroup);
}

let t = 0.0;
export function onTick(tDelta) {
    let u = normalizeRange(0.0, cycleTime, t);
    for (var i = 0; i < numMeshes; i++) {
        baseGroup.children[i].position.copy(path(u));
        u += (1.0 / numMeshes);
    }
    baseGroup.position.copy(upperPath(u));
    t += tDelta;
    t %= cycleTime;
}
*/

function Pathoid(template, path, numChildren, cycleTime) {
    this.template = template;
    this.subpathoids = [];
    this.path = path;
    this.numChildren = 0;
    this.cycleTime = cycleTime;
    this.obj3d = new THREE.Group();
    this.t = 0.0;
    this.onTick = (tDelta) => {
        let u = normalizeRange(0.0, this.cycleTime, this.t);
        for (var i = 0; i < this.numChildren; i++) {
            this.obj3d.children[i].position.copy(path(u));
            u += (1.0 / this.numChildren);
            this.subpathoids[i].onTick(tDelta);
        }
        this.t += tDelta;
        this.t %= this.cycleTime;
    };
    this.clone = () => {
        return new Pathoid(this.template, this.path, this.numChildren, this.cycleTime);
    };
    this.more = (n) => {
        this.numChildren += n;
        for (var i = 0; i < n; i++) {
            let base = this.template.clone();
            this.subpathoids.push(base);
            this.obj3d.add(base.obj3d);
        }
    };
    this.less = (n) => {
        this.numChildren += n;
        for (var i = 0; i < n; i++) {
            let base = this.subpathoids.pop();
            this.obj3d.remove(base.obj3d);
        }
    };

    this.more(numChildren);
}

let baseMesh = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshPhysicalMaterial({ color: 0xff00ff })
);

function baseClone() {
    return {
        obj3d: baseMesh.clone(),
        onTick: () => {},
        clone: baseClone,
    };
}

let base =  baseClone();
let path = vecsToParam([
    new THREE.Vector3(-5, 0, -8),
    new THREE.Vector3(0, -5, -10),
    new THREE.Vector3(5, 0, -8),
    new THREE.Vector3(0, 5, -10),
    new THREE.Vector3(0, 0, -20),
    new THREE.Vector3(-5, 0, -8)
]);
let lower = new Pathoid(base, path, 10, 5000.0)
let topPathoid = new Pathoid(lower, upperPath, 3, 5000.0)

export function onInit(scene) {
    topPathoid.obj3d.position.z -= 10;
    scene.add(topPathoid.obj3d);
}

export function onTick(tDelta) {
    topPathoid.onTick(tDelta);
}
