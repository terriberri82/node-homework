const os = require('os');
const path = require('path');
const fs = require('fs');

const sampleFilesDir = path.join(__dirname, 'sample-files');
if (!fs.existsSync(sampleFilesDir)) {
  fs.mkdirSync(sampleFilesDir, { recursive: true });
}

// OS module
const systemInfo = {
    platform: os.platform(),
    cpu: os.cpus(),
    memory: os.totalmem()
}
console.log("Platform:", systemInfo.platform)
console.log("CPU:", systemInfo.cpu)
console.log("Total Memory:", systemInfo.memory)

// Path module
const result = path.join(sampleFilesDir);
console.log("Joined path:", result)

// fs.promises API
const fsPromises = fs.promises

const fileOperations = async() =>{
  try{
    await fsPromises.writeFile('./assignment1/sample-files/demo.txt', ' Hello from fs.promises!')
     const data = await fsPromises.readFile('./assignment1/sample-files/demo.txt', 'utf8')
     console.log('fs.promises read:', data)
    } catch(err) {
    console.log('Error:', err)
  }
}


// Streams for large files- log first 40 chars of each chunk
const largeFileOperations = async() =>{
  try{
      let data = ''
        for (let i = 1; i <= 100; i++) {
            data += `Line ${i}: This is a line in a large file!\n`
        }
        await fsPromises.writeFile(path.join(__dirname, 'sample-files', 'largefile.txt'), data)
      const readStream = fs.createReadStream(path.join(__dirname, 'sample-files', 'largefile.txt'), {
         encoding: 'utf8', 
      highWaterMark: 1024} );
      readStream.on('data', (chunk) => {
        console.log('Received chunk:', chunk.length, 'characters')
          console.log('Read chunk:', chunk.slice(0, 40))   
});
       readStream.on('end', () => {
           console.log('Finished reading large file with streams.')
})
      readStream.on('error', (err) => {
         console.error('Error reading file:', err)
})
  }catch(err){
    console.error('Error:', err)
  }
}

const runAll = async() => {
    await fileOperations()
    await largeFileOperations()
}
runAll()