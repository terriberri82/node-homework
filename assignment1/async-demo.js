const { timeStamp } = require('console');
const fs = require('fs');
const path = require('path');


// Write a sample file for demonstration

// 1. Callback style
fs.writeFile('./assignment1/sample-files/sample.txt', 'Hello, async world!', (err) => {
    if (err) {
        console.log('Error writing file:', err)
    } else {
        fs.readFile('./assignment1/sample-files/sample.txt', 'utf8', (err, data) => {
            if (err) {
                console.log('Error reading file:', err)
            } else {
                console.log('Callback read:', data)
            }
        })
    }
})

  // Callback hell example (test and leave it in comments):
  // Callback hell occurs when you have a callback within a call back (nested) so many times
  //and it becomes hard to read. 
//  fs.writeFile('./assignment1/sample-files/sample.txt', 'Hello, async world!', (err) => {
//    if (err) {
//        console.log('Error writing file:', err)
//    } else {
//        fs.readFile('./assignment1/sample-files/sample.txt', 'utf8', (err, data1) => {
//            if (err) {console.log('Error reading file:', err)
//            } else {fs.readFile('./assignment1/sample-files/sample2.txt', 'utf8', (err, data2) => {
//               if (err) {console.log('Error reading file2:', err)
//               } else {fs.readFile('./assignment1/sample-files/sample3.txt', 'utf8', (err, data3) => {
//                   if (err) {console.log('Error reading file3:', err)
//                   }else {console.log(data1, data2, data3)
//        })
//    }
//})

  // 2. Promise style
const doFileOperations = async () =>{
    try {
        const data = await new Promise ((resolve, reject) =>{
        fs.readFile('./assignment1/sample-files/sample.txt', 'utf8', (err, data) =>{
            return err ? reject (err) : resolve (data);
        });
    });
    console.log("Promise read:", data)
} catch (err){
    console.log("An error occurred.", err);
  }
};
doFileOperations(); 

      // 3. Async/Await style
const { promisify } = require('util')
const readFile = promisify(fs.readFile)

const doFileOperationsAsync = async () => {
    try {
        const data = await readFile('./assignment1/sample-files/sample.txt', 'utf8')
        console.log("Async/Await read:", data)
    } catch (err) {
        console.log("An error occurred.", err)
    }
}

doFileOperationsAsync()