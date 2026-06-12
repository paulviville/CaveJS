import Screen from './Screen.js';
import Cave from './Cave.js';
import CaveHelper from './CaveHelper.js';
import CaveRenderer from './CaveRenderer.js';
import CaveWindow from './CaveWindow.js';
import * as THREE from "../three/three.module.js";
import Tracker from './Tracker.js';

export default class CaveManager {
	#cave;
	#caveHelper;
	#caveRenderer;
	#windows;
	#tracker;
    #worker;

	constructor ( config, worker ) {
        this.#worker = worker;
		this.initializeCave( config.screens );
		this.initializeCaveRenderer( config.viewports, config.stereoMode, config.frameRate );
		this.initializeWindows( config.windows );
        this.initializeTracking( config.vrpn )
	}

	initializeCave ( screens ) {
		const caveScreens = [ ];

		for ( const screenData of screens ) {
			const corners = screenData.corners.map( corner => new THREE.Vector3( ...corner ) )
			const screen = new Screen( corners );
			caveScreens.push( screen );
		}

		this.#cave = new Cave( caveScreens );
        this.#caveHelper = new CaveHelper( this.#cave );
	}

	initializeCaveRenderer ( viewports, stereoMode, frameRate ) {
		this.#caveRenderer = new CaveRenderer( this.#cave, stereoMode, frameRate );

		for ( const viewportData of viewports ) {
			this.#caveRenderer.addViewport( viewportData.id, viewportData );
		}
	}

	initializeWindows ( windows ) {
        if ( this.#worker ) {
            this.#initializeWorkerWindows( windows );
            return;
        }

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

    #initializeWorkerWindows ( windows ) {
        console.log( "initializeWorkerWindows ")
		for ( const windowData of windows ) {
            this.#worker.postMessage( {
                type: "addWindow",
                windowData,
            } );
        }
    }

    initializeTracking ( vrpn ) {
        this.#tracker = new Tracker( vrpn );
        this.#tracker.setCallback( "head", ( position, quaternion ) => {
            this.#cave.setHead( position, quaternion );
        } );
        
        if ( this.#tracker.has( "leftHand" ) ) {
            const arrow = this.#caveHelper.addControler( );
            this.#tracker.setCallback( "leftHand", ( position, quaternion ) => {
                arrow.position.copy( position );
                arrow.quaternion.copy( quaternion );
            } );
        }
        if ( this.#tracker.has( "rightHand" ) ) {
            const arrow = this.#caveHelper.addControler( );
            this.#tracker.setCallback( "rightHand", ( position, quaternion ) => {
                arrow.position.copy( position );
                arrow.quaternion.copy( quaternion );
            } );
        }
        this.#tracker.connect( );
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