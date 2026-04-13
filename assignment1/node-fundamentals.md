# Node.js Fundamentals

## What is Node.js?
Node.js is a runtime environment that allows JavaScript to run outside of the browser, directly on your computer or server.

## How does Node.js differ from running JavaScript in the browser?
The browser is like a restricted area, or sandbox, so you can't safely store credentials or read and write files on your computer; however, with Node you can do that and also build a web server socket. Node is fast because it uses C++ under the hood and handles tasks asynchronously. JavaScript is single threaded and can only do one task at a time, but with Node you are able to put pending tasks into an event loop so the rest of the functions on the call stack can be processed.

## What is the V8 engine, and how does Node use it?
The V8 engine is what is used to translate Javascript into code computers can read or machine code. Node uses V8 to translate Javascript into machine code so that the computer can read it while Node handles the additional features that the browser is unable to do (file system access, building web server sockets, and handling asynch operations through the event loop). 

## What are some key use cases for Node.js?
Some key uses for Node are chat applications like WhatsApp or Discord, shopping websites like Amazon, and streaming sites like YouTube and Netflix. 

## Explain the difference between CommonJS and ES Modules. Give a code example of each.

**CommonJS (default in Node.js):**
```js
// CommonJS is a way to import and export and was built for Node. 
// const fs = require('fs');
// module.exports = { add, multiply }
```

**ES Modules (supported in modern Node.js):**
```js
//  ESM can also let you import and export but it was built for the brwoser. It uses the following method for importing and exporting 
// import {useState} from 'react'
// export {add, multiply}s
``` 