// cleanup-lectures-conflict.js
// A Node.js script to safely remove the conflicting /app/lectures route

const fs = require('fs');
const path = require('path');

// Function to delete a directory recursively
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // Recurse
        deleteFolderRecursive(curPath);
      } else {
        // Delete file
        fs.unlinkSync(curPath);
        console.log(`Deleted file: ${curPath}`);
      }
    });
    fs.rmdirSync(folderPath);
    console.log(`Deleted directory: ${folderPath}`);
  }
}

// Main function
function cleanup() {
  const lecturesPath = path.join(__dirname, 'src', 'app', 'lectures');
  
  console.log('Starting cleanup of conflicting routes...');
  
  if (fs.existsSync(lecturesPath)) {
    console.log(`Found conflicting route directory: ${lecturesPath}`);
    
    try {
      deleteFolderRecursive(lecturesPath);
      console.log('✅ Successfully removed the conflicting /app/lectures route');
    } catch (err) {
      console.error('❌ Error removing directory:', err);
    }
  } else {
    console.log('No conflicting route found - everything is already clean');
  }
  
  console.log('\nCleanup complete!');
  console.log('Your application should now be using the correct /(student)/lectures/[lectureId] route.');
}

// Run the script
cleanup();
