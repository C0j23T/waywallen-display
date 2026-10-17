.pragma library

function isLockScreen(name) {
    return name === "kscreenlocker_greet";
}

function isDesktop(name) {
    return name === "plasmashell";
}

function canConnect(name, args) {
    // Greeter previews must not claim the real lock screen's persistent identity.
    return isDesktop(name) || (isLockScreen(name) && args.indexOf("--testing") === -1);
}
