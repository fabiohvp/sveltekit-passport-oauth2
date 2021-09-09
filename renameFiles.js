const { readdirSync, rename } = require('fs');
const { resolve } = require('path');

// Get path to image directory
const lib = resolve(__dirname, 'lib');

// Get an array of the files inside the folder
const files = readdirSync(lib);

// Loop through each file that was retrieved
files.forEach((file) => {
	if (file.endsWith('.js')) {
		rename(lib + `/${file}`, lib + `/${file.replace('.js', '.cjs')}`, (err) => console.log(err));
	}
});
