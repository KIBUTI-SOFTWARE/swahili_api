const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Create dist directory
const createDist = () => {
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  fs.mkdirSync('dist');
  fs.mkdirSync('dist/src');
};

// Copy necessary files
const copyFiles = () => {
  // Copy package files
  fs.copyFileSync('package.json', 'dist/package.json');
  fs.copyFileSync('package-lock.json', 'dist/package-lock.json');
  
  // Copy main server file
  fs.copyFileSync('server.js', 'dist/server.js');
  
  // Copy source files
  copyDir('src', 'dist/src');
  
  // Copy env file template
  fs.copyFileSync('.env.example', 'dist/.env.example');
};

// Recursive directory copy
const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

// Clean up package.json for production
const cleanPackageJson = () => {
  const pkg = require('../dist/package.json');
  
  // Remove dev dependencies
  delete pkg.devDependencies;
  
  // Remove dev scripts
  const keepScripts = ['start', 'migrate'];
  const newScripts = {};
  for (let script in pkg.scripts) {
    if (keepScripts.includes(script)) {
      newScripts[script] = pkg.scripts[script];
    }
  }
  pkg.scripts = newScripts;
  
  fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2));
};

// Main build process
const build = async () => {
  console.log('Starting build process...');
  
  try {
    createDist();
    copyFiles();
    cleanPackageJson();
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
};

build();