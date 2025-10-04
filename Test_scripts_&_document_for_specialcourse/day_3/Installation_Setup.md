⚙️ Installation & Setup

Clone the repository:

git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>


Install dependencies:

npm install


Configure Firebase

Replace the firebaseConfig in main.js with your Firebase project details.

Run the app:

npm start

📡 Usage

Open Firebase Realtime Database in your project.

Set the target path under commandData/path (example: G:/TestFolder).

Send commands via commandData/cmd:

"scan" – scan folder structure.

"imagesscan" – scan for images recursively.

"delete" – delete specified file/folder.

"screenshot" – take 3 screenshots of Electron window.

"exit" – close the app.

Check commandData/status for real-time updates from the app.

📁 Example

Folder Scan (scan) Output:

[
  { "name": "File1.txt", "type": "file", "size": 1024 },
  { "name": "Documents", "type": "folder" }
]


Image Scan (imagesscan) Output:

[
  { "name": "image1.png", "path": "G:/TestFolder/image1.png", "size": 23456 },
  { "name": "photo.jpg", "path": "G:/TestFolder/SubFolder/photo.jpg", "size": 123456 }
]

🛠 Dependencies

Electron – Desktop app framework

Firebase – Realtime Database

trash – Safe deletion to Recycle Bin

Node.js – Backend runtime

⚠️ Notes

Make sure the target path exists before sending scan, imagesscan, or delete commands.

Screenshots are taken of the hidden Electron window (no GUI displayed).

Image scan is recursive; it may take longer for large directories.

💡 Future Improvements

Recursive folder scan for scan command.

Add file download/upload capability.

UI to trigger commands without Firebase.

Multi-drive support for large storage devices.
