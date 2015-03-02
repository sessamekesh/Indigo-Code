# coding-competition-nodejs
Framework for hosting coding competitions using Node.JS

# Dependencies
The framework itself only relies on the following dependencies:

And, as it so happens, you actually can't run the server as of this commit. There is a server image you have to have running. I'll work on getting that available soon, I have the VirtualBox snapshot ready.

- nodejs (install <a href="http://nodejs.org/">here</a>)
- mysql (sudo apt-get install mysql-server)
- g++
- javac
- python
- VirtualBox (VBoxManage, specifically)

Though, the NodeJS code itself requires on the following packages:
- bcrypt (npm install bcrypt)
- eyes (npm install eyes)
- formidable (npm install formidable)
- mysql (npm install mysql)
- sesh (npm install sesh)

# Installation
- Download source code
- Run 'db_structure.sql' in your MySQL client
- node index.js

# Running
I'll get around to this before the first release, I'm sure.

# Competition Results
- AC: Answer Correct
- WA: Wrong Answer
- TLA: Time Limit Exceeded
- RE: Runtime Error
- BE: Build Error
- TE: Testing Error
- IE: Internal Error (framework failed)
