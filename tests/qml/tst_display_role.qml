import QtQuick
import QtQuick.Window
import QtTest
import Waywallen.Display

TestCase {
    name: "DisplayRole"

    Component {
        id: hostComponent
        Window { visible: false }
    }

    Component {
        id: displayComponent
        WaywallenDisplay {
            socketPath: "/tmp/waywallen-display-role-test-unavailable.sock"
            autoReconnect: false
        }
    }

    function test_identity() {
        const host = createTemporaryObject(hostComponent, null);
        verify(host !== null);
        const desktop = createTemporaryObject(displayComponent, host.contentItem);
        const lock = createTemporaryObject(displayComponent, host.contentItem, {
            displayRole: WaywallenDisplay.LockScreenRole
        });
        verify(desktop !== null && lock !== null);
        compare(desktop.displayRole, WaywallenDisplay.DesktopRole);
        verify(desktop.instanceId.startsWith("kde-"));
        compare(lock.instanceId, "kde-lock-" + desktop.instanceId.slice(4));
        compare(desktop.connState, WaywallenDisplay.Disconnected);
        compare(lock.connState, WaywallenDisplay.Disconnected);
        lock.displayRole = WaywallenDisplay.DesktopRole;
        compare(lock.instanceId, desktop.instanceId);
        lock.instanceId = "explicit-lock-id";
        lock.displayRole = WaywallenDisplay.LockScreenRole;
        compare(lock.instanceId, "explicit-lock-id");
    }
}
