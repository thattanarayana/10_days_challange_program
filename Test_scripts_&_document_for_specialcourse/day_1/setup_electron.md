How to Set Up an Electron Project

This guide explains, step by step, how to set up an Electron project. It’s written in simple language so that even beginners or non-technical readers can follow along.

1. Install Required Software (One-time setup)
Before starting, make sure you have these installed on your computer:
Visual Studio Code (VS Code) → Code editor where you’ll write and run your project.
Node.js → A runtime environment for running JavaScript outside the browser.
Git → A version control tool used for managing code.
👉 These need to be installed only once.

2. Add Environment Variables (One-time setup)
After installing Node.js and Git, add them to your system’s Environment Variables.
This step allows you to run commands like node, npm, and git from any folder in the terminal.
👉 Just like saving a shortcut, so your computer always knows where Node.js and Git are located.

3. Create a Project Folder
Create a new folder anywhere on your computer (for example: MyElectronApp).
Open this folder in VS Code.
Inside VS Code, open the Terminal.

4. Initialize the Project
Run this command in the terminal:
cmd = npm init -y
What this does:
Creates a file called package.json.
This file stores information about your project (name, version, scripts, and dependencies).
The -y flag means "use all default settings" (so it won’t ask you questions).

5. Install Electron
Run the following commands:
cmd = npm install electron --save-dev
👉 This installs Electron and saves it as a development dependency in your project.
--save-dev means Electron is only needed while developing the project, not for production use.
To make sure you always have the latest version, you can also run:
cmd = npm install electron@latest

6. Run Your Electron App
To start the project, run:
cmd = npm start
This will run the start script defined in your package.json.

7. Running Different Files (Optional)
In this project, I created multiple tasks:
Capture a photo using webcam.
Capture a screenshot of the screen.
Delete files inside a folder.
To run a specific file, update your package.json like this:
{
  "name": "seashore",
  "version": "1.0.0",
  "description": "",
  "main": "src_video/main.js",   ← Update this line with the file you want to run
  "scripts": {
    "start": "electron ."
  }
}

✅ Summary
Install VS Code, Node.js, Git (one-time setup).
Add them to Environment Variables.
Create a project folder and initialize it with npm init -y.
Install Electron using npm install electron --save-dev.
Start your project with npm start.
Update the main field in package.json if you want to run a different file (photo capture, screenshot, or delete files).

This documentation is beginner-friendly and also demonstrates my ability to explain technical concepts clearly — an important skill for teamwork and communication in any job.
