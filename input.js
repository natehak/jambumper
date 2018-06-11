export var keys = {};
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// disable context menus
window.addEventListener("contextmenu", (e) => { e.preventDefault(); });

export var lastPosition = { x: 0.0, y: 0.0 };
export var currentPosition = { x: 0.0, y: 0.0 };
export var buttons = {};
export let BUTTON = Object.freeze({ LEFT: 1, RIGHT: 2, MIDDLE: 4 });
var buttonNum = 0;
window.addEventListener("mousedown", (e) => {
    let button = e.buttons - buttonNum;
    buttons[button] = true;
    buttonNum = e.buttons;
});
window.addEventListener("mousemove", (e) => {
    currentPosition = { x: e.clientX, y: e.clientY };
});
window.addEventListener("mouseup", (e) => {
    let button = buttonNum - e.buttons;
    buttons[button] = false;
    buttonNum = e.buttons;
});
export function getMouseDelta() {
    return { x: currentPosition.x - lastPosition.x, y: currentPosition.y - lastPosition.y };
}

export var scrollDelta = { x: 0.0, y: 0.0 };
window.addEventListener("wheel", (e) => {
    scrollDelta.x += e.deltaX;
    scrollDelta.y += e.deltaY;
});


export function onTick() {
    lastPosition = currentPosition;
    scrollDelta = { x: 0.0, y: 0.0 };
}
