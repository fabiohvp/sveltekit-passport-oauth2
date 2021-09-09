import { readdirSync, rename } from 'fs';

// Get path to image directory
const lib = './lib';

// Get an array of the files inside the folder
const files = readdirSync(lib);

// Loop through each file that was retrieved
files.forEach((file) => {
	if (file.endsWith('.js')) {
		rename(lib + `/${file}`, lib + `/${file.replace('.js', '.mjs')}`, (err) => console.log(err));
	}
});
