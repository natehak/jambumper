import * as THREE from "./three.module.js";

const TAU = Math.PI * 2;

export function normalizeRange(A, B, x) {
    // from https://math.stackexchange.com/questions/43698/range-scaling-problem
    return ((-1.0 / (B - A)) * A) + ((1.0 / (B - A)) * x);
}

/* parametric fns */
export function vecsToParam(vecs) {
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

export function genCircleParam(r) {
    return (t) => {
        let rad = t * TAU;
        return new THREE.Vector3(r * Math.cos(rad), r * Math.sin(rad), 0);
    };
}
export let paceX = vecsToParam([
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(-5, 0, 0),
]);

