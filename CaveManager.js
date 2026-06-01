import Screen from './Screen.js';
import Cave from './Cave.js';
import CaveHelper from './CaveHelper.js';
import CaveRenderer from './CaveRenderer.js';
import CaveWindow from './CaveWindow.js';
import * as THREE from 'three';

export default class CaveManager {
	#cave;
	#caveHelper;
	#caveRenderer;
	#windows;
	#tracker; 

	constructor ( config ) {
		this.initializeCave( config.screens );
		this.initializeCaveRenderer( config.viewports, config.stereoMode );
		this.initializeWindows( config.windows );
	}

	initializeCave ( screens ) {
		const caveScreens = [ ];

		for ( const screenData of screens ) {
			const corners = screenData.corners.map( corner => new THREE.Vector3( ...corner ) )
			const screen = new Screen( corners );
			caveScreens.push( screen );
		}

		this.#cave = new Cave( caveScreens );
	}

	initializeCaveRenderer ( viewports, stereoMode ) {
		this.#caveRenderer = new CaveRenderer( this.#cave );
		this.#caveRenderer.setStereoMode( stereoMode );

		for ( const viewportData of viewports ) {
			this.#caveRenderer.addViewport( viewportData.id, viewportData );
		}
	}

	initializeWindows ( windows ) {
		this.#windows = new Map( );
		for ( const windowData of windows ) {
			const caveWindow = new CaveWindow(
				windowData.id,
				windowData.name,
				windowData.width,
				windowData.height,
				{ 
					onLoad: ( canvas ) => {
						this.#caveRenderer.addCanvas( windowData.id, canvas );
						this.#onReady( );
					}
				}
			);
			caveWindow.open( windowData.display );
			this.#windows.set( windowData.id, caveWindow );
		}
		
		window.addEventListener( "beforeunload", ( ) => {
			this.#onClose( );
		} );
	}


	get cave ( ) {
		return this.#cave;
	}

	get caveHelper ( ) {
		if ( this.#caveHelper === undefined )
			this.#caveHelper = new CaveHelper( this.#cave );

		return this.#caveHelper;
	}

	get caveRenderer ( ) {
		return this.#caveRenderer;
	}

	#onReady ( ) {
		let ready = true;
		this.#windows.forEach( window => { ready &= window.ready; } );
		if ( !ready ) {
			return
		}
		
		this.#caveRenderer.start( );
	}

	#onClose ( ) {
		this.#windows.forEach( window => window.close( ) );
	}
}