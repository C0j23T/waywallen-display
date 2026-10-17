import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../extensions/kde/package/contents/ui/HostIdentity.js", import.meta.url), "utf8");
const host = vm.createContext({});
vm.runInContext(source.replace(/^\.pragma library\s*/, ""), host);

assert.equal(host.isDesktop("plasmashell"), true);
assert.equal(host.isLockScreen("kscreenlocker_greet"), true);
assert.equal(host.isLockScreen("plasmashell"), false);
assert.equal(host.canConnect("plasmashell", []), true);
assert.equal(host.canConnect("kscreenlocker_greet", ["--immediateLock"]), true);
assert.equal(host.canConnect("kscreenlocker_greet", ["--testing"]), false);
assert.equal(host.canConnect("systemsettings", []), false);
assert.equal(host.canConnect("qml", []), false);
console.log("KDE host identity passed");
