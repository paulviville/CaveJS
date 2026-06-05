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
            // const point = this.#caveHelper.addPointer( );
            // const [ A, B, C, D ] = this.#cave.screens[ 0 ].corners;
            // const AB = B.clone( ).sub( A );
            // const AC = C.clone( ).sub( A );
            // const WX = AB.length( );
            // const WY = AC.length( );
            // const nAB = AB.clone( ).normalize( );
            // const nAC = AC.clone( ).normalize( );
            // const n = nAB.clone( ).cross( nAC )

            this.#tracker.setCallback( "leftHand", ( position, quaternion ) => {
                // const [ qx, qy, qz, qw ] = quaternion.toArray( );
                // const rx = - 2 * ( qw * qz - qy * qx );
                // const ry = 1 - 2 * ( qz * qz + qx * qx );
                // const rz = 2 * ( qw * qx + qy * qz );
            
                // const R = new THREE.Vector3( rx, ry, rz );

                // const AP = position.clone( ).sub( A );
                // const dist = AP.dot( n ) / -( R.dot( n ) );
                // const I = position.clone( ).addScaledVector( R,  dist )
                // const AI = I.clone( ).sub( A );
                // const Wx = AI.dot( nAB ) / WX;
                // const Wy = AI.dot( nAC ) / WY;
                // point.position.copy( position ).addScaledVector( R,  dist );

                // if( Wx <= 0 || Wx >= 1 || Wy <= 0 || Wy >= 1 ) {
                //     point.position.multiplyScalar( 0 );
                // }

                arrow.position.copy( position );
                arrow.quaternion.copy( quaternion );
            } );
        }
        if ( this.#tracker.has( "rightHand" ) ) {
            const arrow = this.#caveHelper.addControler( );
            this.#tracker.setCallback( "rightHand", ( position, quaternion ) => {
                arrow.position.copy( position );
                arrow.quaternion.copy( quaternion );
                // console.log(position ,quaternion )
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