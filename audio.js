let audioCtx = new window.AudioContext();
let analyser = audioCtx.createAnalyser();
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    let source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
});

analyser.fftSize = 256;
export let bufferLength = analyser.frequencyBinCount;
export var fft = new Uint8Array(bufferLength);

export function onTick() {
    analyser.getByteFrequencyData(fft);
}
