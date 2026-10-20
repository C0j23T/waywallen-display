// Run with: node --test extensions/gnome/tests/diagnostics.test.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

test('diagnostics use explicit formatting without extending String.prototype', () => {
    const source = readFileSync(new URL('../renderer/renderer.js', import.meta.url), 'utf8');
    const classSource = source.slice(source.indexOf('class MonitorRenderer'), source.indexOf('\nconst opts ='));
    const formatSource = source.match(/^const \{vprintf\} = imports\.format;$/m)?.[0];
    assert.ok(formatSource);
    const calls = [];
    const context = vm.createContext({
        imports: {format: {vprintf(message, args) {
            calls.push([message, Array.from(args)]);
            return `formatted ${calls.length}`;
        }}},
        GLib: {get_monotonic_time: () => 2_000_000},
        _: message => `translated ${message}`,
    });
    assert.equal(vm.runInContext('typeof String.prototype.format', context), 'undefined');
    const MonitorRenderer = vm.runInContext(
        `${formatSource}\n${classSource}\nMonitorRenderer`, context);
    const renderer = Object.create(MonitorRenderer.prototype);
    let text;
    Object.assign(renderer, {
        _index: 1,
        _displayName: 'DP-1',
        _instanceId: 'test',
        _pw: 2560, _ph: 1440, _scale: 2,
        _texW: 1920, _texH: 1080, _fourcc: 0x34324241, _backend: 3,
        _frames: 120, _diagFrames: 60, _diagLast: 1_000_000,
        _winFlags: 0,
        _diagLabel: {set_text(value) { text = value; }},
    });
    renderer._updateDiag();
    assert.deepEqual(calls, [
        ['translated mon %d  %s', [1, 'DP-1']],
        ['translated id %s', ['test']],
        ['translated disp %dx%d scale=%s', [2560, 1440, 2]],
        ['translated tex %dx%d fourcc=0x%s backend=%s', [1920, 1080, '34324241', 3]],
        ['translated fps %s  frames %d', ['60.0', 120]],
        ['translated winstate 0x%s (%s)', ['0', 'translated none']],
    ]);
    assert.equal(text.split('\n').length, 7);
    assert.ok(text.startsWith('formatted 1\nformatted 2\n'));
    assert.equal(renderer._diagFrames, 120);
    assert.equal(renderer._diagLast, 2_000_000);
    assert.equal(vm.runInContext('typeof String.prototype.format', context), 'undefined');
});
