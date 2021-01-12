# Course Project FS1020
Backend application consisting of a RESTful JSON API for a "contact us" form.
Server port: 3007
Terminal commands:
npm install (for installing dependencies)
npm start 
npm run dev

Postman: Authorisation type: Bearer token
Requires manual copy/paste

How to run:
Files entries.json and users.json don't exist upon first run. GET requests routes will return "token not provided". Post /auth route returns 404 "not found", but error is not handled, so use of this route before files created should be avoided.
Post requests will create relative .json files. After that API should function as per requirements.


