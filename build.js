/**
 * The build-script for transpiling and bundling the source files.
 */

/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require( "fs/promises" );
const { argv } = require('node:process');

const esbuild = require( "esbuild" );
const lessLoader = require( "esbuild-plugin-less" ).lessLoader;

async function main() {

	const timeStart = Date.now();
	const devBuild = ( ~argv.indexOf( "-dev" ) ? true : false );

	console.log( `Building ${devBuild?"dev ":""}...` );

	/** Clean build folder */
	await fs.rm( "dist", { recursive: true, force: true } );
	console.log( "... cleaned /dist/" );

	// Wait for everything to finish.
	await Promise.all( [

		esbuild.build({
			entryPoints: [ "./src/*.ts" ],
			outdir: "dist",
			bundle: true,
			minify: !devBuild,
			sourcemap: !devBuild,
		})
		.then( () => console.log( "... build js." ) )
		.catch( () => process.exit( 1 ) ),

		esbuild.build({
			entryPoints: [ "src/main.less" ],
			outfile: "dist/styles.css",
			plugins: [ lessLoader() ],
			bundle: true,
			minify: !devBuild,
		})
		.then( () => console.log( "... build css." ) )
		.catch( () => process.exit( 1 ) ),

		new Promise( async ( resolve, _reject ) => {
			await fs.mkdir('dist', { recursive: true } );
			// Todo: minify html files
			const copyFiles = [ "index.html", "figural.html", "favicon.png" ];
			for( const fileName of copyFiles ) {
				await fs.copyFile( "src/" + fileName, "dist/" + fileName );
			}
			resolve();
		}).then( () => console.log( "... copied files." ) )
		.catch( () => console.error( "Error when copying files." ) ),

	]) // The "Wait for everything to finish."-Promise.all
	.catch( () => process.exit( 1 ) );

	const timeEnd = Date.now();
	const buildTimeInSec = ( timeEnd - timeStart ) / 1000;
	console.log( "Finished in " + buildTimeInSec.toFixed( 3 ) + " s." )
}

main();
