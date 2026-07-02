// Synthesized arcade sound effects (Web Audio API) — no external audio files needed.
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
    }

    _ensureContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    _tone({ frequency, duration, type = 'square', startGain = 0.2, delay = 0 }) {
        if (this.muted) return;
        const ctx = this._ensureContext();
        const startTime = ctx.currentTime + delay;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(frequency, startTime);

        gain.gain.setValueAtTime(startGain, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    playPaddleHit() {
        this._tone({ frequency: 220, duration: 0.09, type: 'square', startGain: 0.18 });
    }

    playWallBounce() {
        this._tone({ frequency: 330, duration: 0.07, type: 'triangle', startGain: 0.15 });
    }

    playScore() {
        [523.25, 659.25, 783.99].forEach((frequency, i) => {
            this._tone({ frequency, duration: 0.16, type: 'square', startGain: 0.15, delay: i * 0.09 });
        });
    }

    playCountdownBeep(isFinal = false) {
        this._tone({
            frequency: isFinal ? 880 : 440,
            duration: isFinal ? 0.3 : 0.15,
            type: 'sine',
            startGain: 0.2,
        });
    }

    playGameOver(didWin) {
        const notes = didWin ? [523.25, 659.25, 783.99, 1046.5] : [392, 349.23, 293.66, 220];
        notes.forEach((frequency, i) => {
            this._tone({
                frequency,
                duration: 0.28,
                type: didWin ? 'square' : 'sawtooth',
                startGain: 0.18,
                delay: i * 0.15,
            });
        });
    }

    setMuted(muted) {
        this.muted = muted;
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }
}

window.soundEngine = new SoundEngine();
