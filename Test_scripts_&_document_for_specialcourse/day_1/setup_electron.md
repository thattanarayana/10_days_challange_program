How setup electron project

1. Required softwares (VS IDE code editor, nodejs and GIT)

2. Add Environment Variables (User variables & System Variables) of nodejs & GIT
Note :- 1& steps are one time to setup eletron project

Create seprate folder for projet 
Open created project folder in VS code -> open Terminal

Run "npm init -y"
Above cmd is a Node.js / npm shortcut for quickly creating a new package.json file with default settings. 
What it does
npm init → Starts the process of creating a package.json file, which stores metadata about your project (name, version, dependencies, scripts, etc.).
-y or --yes → Automatically answers "yes" to all prompts, so npm uses its default values instead of asking you questions interactively.

Run "nmp install electron --save-dev"
npm        → The Node Package Manager, used to install and manage JavaScript packages.
install    → Tells npm to download and add a package to your project.
electron   → The name of the package you want to install. Electron is a framework for building cross-platform desktop apps using JavaScript, HTML, and CSS.
--save-dev → Installs the package as a development dependency. This means:
It will be listed under "devDependencies" in your package.json.
It’s intended for tools you need only during development, not in production (e.g., build tools, testing frameworks, compilers).

Run "npm install electron@latest" 
This is telling npm (Node Package Manager) to install the most recent stable version of Electron into your project.

Run "npm start"
is a shortcut for running the start script defined in your project’s package.json file.

Note:- 
I have created multipule task like delete, capture screenshot & take photo to run that particule file update packages.json with file name in below parameters "main": "file_name to execute requied file"
{

  "name": "seasoure",
  "version": "1.0.0",
  "description": "",
  "main": "src_video/main.js",
  "scripts": {
    "start": "electron ."
  }
