import * as THREE from "./three.module.js";
import * as audio from "./audio.js";
import * as gfx from "./gfx.js";

let BLINK_SPEED = 500; // in ms

let cli = document.getElementById("cli");
export var typing = false;

let commands = {
    "help": (args) => cmd = Object.keys(commands).join("\n"),
    "mic": (args) => audio.enable(256),

    "slower": (args) => gfx.slower(1000.0),
    "faster": (args) => gfx.slower(-1000.0),

    "more": (args) => gfx.adjustNumMeshes(2),
    "less": (args) => gfx.adjustNumMeshes(-2),
};

function execute(cmd) {
    cmd = cmd.trim().toLowerCase().split(/\s\s*/);
    if (cmd[0] in commands) {
        commands[cmd[0]](cmd.slice(1));
    }
}

var historyLoc = -1;
var history = [];
var cmd = "";
var ready = false;
window.addEventListener("keypress", (e) => {
    if (typing) {
        e.preventDefault();
        if (e.key === "Enter") {
            typing = false;
            history.unshift(cmd);
            historyLoc = -1;
            ready = true;
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
export function onTick(tDelta) {
    if (ready) {
        execute(cmd);
        cmd = "";
        ready = false;
    }

    cli.innerHTML = cmd;
    if (typing) {
        cli.innerHTML = "> " + cli.innerHTML;
    }
    if (typing && counter < 0) {
        cli.innerHTML = cli.innerHTML + "_";
    }
    counter += tDelta;
    if (counter > BLINK_SPEED) {
        counter = -BLINK_SPEED;
    }
}
