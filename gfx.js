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

export function slower(t) {
    topPathoid.cycleTime += t;
    topPathoid.cycleTime = Math.max(0, topPathoid.cycleTime);
}

export function doubleChildren() {
    return adjustPathoidChildren(topPathoid.numChildren);
}
export function halfChildren() {
    return adjustPathoidChildren(-Math.floor(topPathoid.numChildren/2));
}
export function adjustPathoidChildren(n) {
    return n > 0 ? topPathoid.more(n) : topPathoid.less(n);
}

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
        for (var i = 0; i < Math.abs(n); i++) {
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

let base = baseClone();
let path = vecsToParam([
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(0, -5, -5),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(0, 5, -5),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-5, 0, 0)
]);
let upperPath = vecsToParam([
    new THREE.Vector3(-10, 0, -8),
    new THREE.Vector3(0, -10, -10),
    new THREE.Vector3(10, 0, -8),
    new THREE.Vector3(0, 10, -10),
    new THREE.Vector3(0, 0, -20),
    new THREE.Vector3(-10, 0, -8)
]);

function genCircleParam(r) {
    return (t) => {
        let rad = t * 2 * Math.PI;
        return new THREE.Vector3(r * Math.cos(rad), r * Math.sin(rad), 0);
    };
}

let lower = new Pathoid(base, genCircleParam(3), 5, 5000.0)
export let topPathoid = new Pathoid(lower, path, 3, 5000.0)

export function onInit(scene) {
    scene.add(topPathoid.obj3d);
}

export function onTick(tDelta) {
    topPathoid.onTick(tDelta);
}
