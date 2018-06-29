import * as THREE from "./three.module.js";
import * as audio from "./audio.js";
import {userGroup} from "./userGroup.js";

let ROTATE_VEL = .01;
let BLINK_SPEED = 30; // in num of ticks

let cli = document.getElementById("cli");
export var typing = false;

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
            if (t >= interval.start && t < interval.end) {
                let normalizedT = normalizeRange(interval.start, interval.end, t);
                let toReturn = new THREE.Vector3();
                toReturn.lerpVectors(interval.vec1, interval.vec2, normalizedT);
                return toReturn;
            }
        }
    };
}

/* convenience fns */
export function reset(mesh) {
    mesh.scale.x = 1;
    mesh.scale.y = 1;
    mesh.scale.z = 1;
}

function stretchGen(x, y, z) {
    return (mesh) => {
        mesh.scale.x *= x;
        mesh.scale.y *= y;
        mesh.scale.z *= z;
    };
}

function fftGen(x, y, z) {
    return (mesh) => { 
        mesh.scale.x *= x < 0 ? 1 : audio.fft[x] / 100;
        mesh.scale.x += 0.001;
        mesh.scale.y *= y < 0 ? 1 : audio.fft[y] / 100;
        mesh.scale.y += 0.001;
        mesh.scale.z *= z < 0 ? 1 : audio.fft[z] / 100;
        mesh.scale.z += 0.001;
    };
}

function rotateEulerGen(x, y, z) {
    return (mesh) => {
        mesh.rotation.x += x;
        mesh.rotation.y += y;
        mesh.rotation.z += z;
    };
}

function rotateAxisAngleGen(axis, angle) {
    var t = 0;
    return (mesh) => {
        let oldScale = mesh.scale.clone();
        mesh.setRotationFromAxisAngle(axis, (angle * t) % (2 * Math.PI));
        mesh.scale.copy(oldScale);
        t++;
    }
}

let commands = {
    "help": (args) => cli.innerHTML = Object.keys(commands).join("\n"),
};

/*
let commands = {
    "help": (args) => cli.innerHTML = Object.keys(commands).join("\n"),

    "basic": (args) =>
        pointer.material =
            new THREE.MeshBasicMaterial({ color: pointer.material.color, wireframe: true }),
    "lambert": (args) =>
        pointer.material =
            new THREE.MeshLambertMaterial({ color: pointer.mesh.color, wireframe: true }),
    "phong": (args) =>
        pointer.material =
            new THREE.MeshPhongMaterial({ color: pointer.material.color, wireframe: true }),
    "physical": (args) =>
        pointer.material =
            new THREE.MeshStandardMaterial({ color: pointer.material.color, wireframe: true }),
    "toon": (args) =>
        pointer.material =
            new THREE.MeshToonMaterial({ color: pointer.material.color, wireframe: true }),

    "color": (args) => changePointerColor(parseInt(args[0], 16)),
    "red": (args) => changePointerColor(0xff0000),
    "blue": (args) => changePointerColor(0x0000ff),
    "green": (args) => changePointerColor(0x00ff00),
    "white": (args) => changePointerColor(0xffffff),
    "black": (args) => changePointerColor(0x000000),
    "yellow": (args) => changePointerColor(0xffff00),
    "orange": (args) => changePointerColor(0xff5500),
    "purple": (args) => changePointerColor(0xff00ff),
    "cyan": (args) => changePointerColor(0x00ffff),

    "cube": (args) => pointer.geometry = new THREE.BoxBufferGeometry(),
    "sphere": (args) => pointer.geometry = new THREE.SphereBufferGeometry(),

    "fft": (args) => {
        let x = args[0].includes("x") ? parseFloat(args[1]) : -1;
        let y = args[0].includes("y") ? parseFloat(args[1]) : -1;
        let z = args[0].includes("z") ? parseFloat(args[1]) : -1;
        pointerOnTick.push(fftGen(x, y, z));
    },
    "scale": (args) => {
        let x = args[0].includes("x") ? parseFloat(args[1]) : 1;
        let y = args[0].includes("y") ? parseFloat(args[1]) : 1;
        let z = args[0].includes("z") ? parseFloat(args[1]) : 1;
        pointerOnTick.push(stretchGen(x, y, z));
    },
    "rotate": (args) => {
        if (args.length == 0) {
            pointerOnTick.push(rotateEulerGen(ROTATE_VEL, -ROTATE_VEL, 0)); // TODO: Noneuler rotate
        } else {
            let x = args[0].includes("x") ? ROTATE_VEL : 0;
            let y = args[0].includes("y") ? ROTATE_VEL : 0;
            let z = args[0].includes("z") ? ROTATE_VEL : 0;
            pointerOnTick.push(rotateEulerGen(x, y, z));
        }
    },

    "reset": (args) => {
        pointerOnTick.length = 0;
        pointer.setRotationFromEuler(new THREE.Euler(0, 0, 0));
        pointerOnTick.push(reset);
    },
    "pop": (args) => {
        pointerOnTick.pop();
        pointer.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    },
    "undo": (args) => userGroup.children.pop(),
};
*/

function execute(cmd) {
    cmd = cmd.trim().toLowerCase().split(/\s\s*/);
    if (cmd[0] in commands) {
        commands[cmd[0]](cmd.slice(1));
    }
}

var historyLoc = -1;
var history = [];
var cmd = "";
window.addEventListener("keypress", (e) => {
    if (typing) {
        e.preventDefault();
        if (e.key === "Enter") {
            typing = false;
            history.unshift(cmd);
            historyLoc = -1;
            execute(cmd);
            cmd = "";
        } else if (e.key === "Backspace") {
            cmd = cmd.slice(0, -1);
        } else if (e.key === "Escape") {
            cmd = "";
            historyLoc = -1;
            typing = false;
        } else if (e.key === "ArrowUp") {
            historyLoc += 1;
            if (historyLoc >= history.length) {
                historyLoc -= 1;
            }
            cmd = history[historyLoc];
        } else if (e.key === "ArrowDown") {
            historyLoc -= 1;
            if (historyLoc < 0) {
                cmd = "";
                historyLoc = -1;
            } else {
                cmd = history[historyLoc];
            }
        } else {
            cmd += e.key;
        }
    } else if (!typing && (e.key === " " || e.key === "Enter")) {
        cmd = "";
        typing = true;
    }
});

var counter = -BLINK_SPEED;
export function onTick() {
    cli.innerHTML = cmd;
    if (typing) {
        cli.innerHTML = "> " + cli.innerHTML;
    }
    if (typing && counter < 0) {
        cli.innerHTML = cli.innerHTML + "_";
    }
    counter += 1;
    if (counter > BLINK_SPEED) {
        counter = -BLINK_SPEED;
    }
}
