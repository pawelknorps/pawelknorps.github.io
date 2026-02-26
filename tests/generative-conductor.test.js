import test from 'node:test';
import assert from 'node:assert/strict';

import { GenerativeConductor, detectKeyAndMode, quantizeUp } from '../src/lib/GenerativeConductor.js';

test('detectKeyAndMode yields stable mode detection for modal input', () => {
    const notes = [
        { note: 60, velocity: 110 }, // C
        { note: 62, velocity: 90 },  // D
        { note: 63, velocity: 100 }, // Eb
        { note: 65, velocity: 82 },  // F
        { note: 67, velocity: 88 },  // G
        { note: 69, velocity: 78 },  // A
        { note: 70, velocity: 95 }   // Bb
    ];

    const detected = detectKeyAndMode(notes);
    assert.equal(detected.root, 0);
    assert.equal(detected.mode, 'dorian');
    assert.ok(detected.confidence >= 0.58);
});

test('quantizeUp snaps to grid', () => {
    assert.equal(quantizeUp(999, 250), 1000);
    assert.equal(quantizeUp(1000, 250), 1000);
    assert.equal(quantizeUp(1001, 250), 1250);
});

test('conductor emits response phrase in valid timing window', () => {
    const scheduled = [];
    let now = 0;

    const conductor = new GenerativeConductor({
        scheduleNoteAt: (note, velocity, startMs, durationMs, channel) => {
            scheduled.push({ note, velocity, startMs, durationMs, channel });
        },
        setParameter: () => {},
        getParameterValue: () => 50,
        nowMs: () => now
    });

    conductor.start();

    now = 0;
    conductor.onExternalNoteOn(60, 100, now);
    now = 420;
    conductor.onExternalNoteOn(64, 98, now);
    now = 900;
    conductor.onExternalNoteOn(67, 90, now);

    now = 1400;
    conductor.tick(now);

    now = 6000;
    conductor.tick(now);

    assert.ok(scheduled.length > 0, 'response phrase should schedule notes');
    assert.ok(scheduled.every((evt) => evt.durationMs >= 120));
    assert.ok(scheduled.every((evt) => evt.note >= 32 && evt.note <= 84));
});

test('idle decay reaches calm level after prolonged inactivity', () => {
    let now = 0;
    const conductor = new GenerativeConductor({
        scheduleNoteAt: () => {},
        setParameter: () => {},
        getParameterValue: () => 20,
        nowMs: () => now
    });

    conductor.start();
    conductor.onExternalNoteOn(60, 100, 0);

    now = 21000;
    conductor.tick(now);

    const state = conductor.getState();
    assert.ok(state.idleLevel > 0.9);
    assert.equal(conductor.getSwingOffset(2), 0);
    assert.ok(conductor.getSwingOffset(1) > 0);
});
