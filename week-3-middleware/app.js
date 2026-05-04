const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const dogsRouter = require('./routes/dogs');
const { StatusCodes } = require('http-status-codes');

const app = express();

//Request ID Middleware

app.use((req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-Id', req.requestId);
  next();
});
//Logging middleware (logs requests with requestId)
 app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]: ${req.method} ${req.path} (${req.requestId})`);
  next();
});
//Security headers middleware (sets security headers)
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

//Body parsing middleware (express.json() with size limit)
app.use(express.json({ limit: "1mb" }));

//Content-Type validation middleware (for POST requests)
app.use((req, res, next) =>{
 if (req.method === 'POST') {
  const content = req.get('Content-Type');
  if (!content || !content.includes('application/json')) {
    return res.status(400).json({
      error: 'Content-Type must be application/json',
      requestId: req.requestId
    });
  }
}
next();
})

//static files
app.use('/images', express.static(path.join(__dirname, '/public/images')));

//Routes (your route handlers)
app.use('/', dogsRouter); // Do not remove this line

//Error handling middleware 

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  if (statusCode >= 400 && statusCode < 500) {
    console.warn(`WARN: ${err.name} ${err.message}`);
  } else {
   console.error(`ERROR: Error ${err.message}`);
  }
  
  res.status(statusCode).json({
     error: statusCode >= 500 ? 'Internal Server Error' : err.message,
    requestId: req.requestId
  });
});
 //404 handler
 app.use((req, res) => {
  res.status(404).json({
  "error": "Route not found",
  "requestId": req.requestId
  });
});

const server =	app.listen(3000, () => console.log("Server listening on port 3000"));
module.exports = server;