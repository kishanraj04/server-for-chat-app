import * as fs from 'fs/promises'; 
import * as fsSync from 'fs';        
import path from 'path';

const folderPath = path.join('.', 'uploads'); 

async function ensureUploadsFolder() {
  if (!fsSync.existsSync(folderPath)) {  // check if folder does NOT exist
    try {
      await fs.mkdir(folderPath, { recursive: true });  // create folder including parents if needed
      console.log('Folder created:', folderPath);
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  } else {
    console.log('Folder already exists');
  }
}

ensureUploadsFolder();
