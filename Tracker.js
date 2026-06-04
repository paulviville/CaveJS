import * as THREE from 'three';

class Signal {
	#name;
	#callback;

	constructor ( name ) {
		this.#name = name;
	}

	set callback ( callback ) {
		this.#callback = callback
	}
}

class TrackerSignal extends Signal {
	#position = new THREE.Vector3( 0, 0, 0 );
	#quaternion = new THREE.Quaternion( 0, 0, 0, 1 );


	constructor ( name ) {
		super( name );
	}

	setTransform ( x, y, z, qx, qy, qz, qw ) {
		this.#position.set( x, y, z );
		this.#quaternion.set( qx, qy, qz, qw );

		this.#callback?.( this.#position, this.#quaternion );
	}
}

class ButtonsSignal extends Signal {

	constructor ( name ) {
		super( name );
	}
}

class AnalogSignal extends Signal {
	#vector = new THREE.Vector2( 0, 0 );

	constructor ( name ) {
		super( name );
	}

	setVector ( x, y ) {
		this.#vector.set( x, y );
		this.#callback?.( this.#vector );
	}
}

export default class Tracker {
	#socket;
	#callbacks;

	#signals = new Map( );
	#trackers;
	#analogs;
	#buttons;

	constructor ( vrpn ) {

	}

	connect ( uri = "ws://localhost:8000" ) {
		this.#socket = new WebSocket( uri );
		this.#socket.addEventListener( "message", this.#handleMessage.bind(this) );
	}

	#initializeTrackers ( trackers ) {
		for ( const tracker of trackers ) {
			
		}
	}

	#handleMessage ( message ) {
		const data = message.data;
		const dataArray = data.split( " " );
		const signalType = dataArray.shift( );
		
		switch ( signalType ) {
			case "tracker":
				this.#handleTracker( dataArray );
				break;
			case "button":
				this.#handleButton( dataArray );
				break;
			case "analog":
				this.#handleAnalog( dataArray );
				break;
			default:
				break;
		}
	}

	#handleTracker ( dataArray ) {
		const signal = dataArray.shift( );
		
		const tracker = this.#trackers.get( signal );
		if ( tracker === undefined ) {
			console.warn( `tracker ${ signal } undefined` );
			return;
		}

		tracker.setTransform( ...dataArray.map( x => parseFloat( x ) ) );
	}

	#handleButton ( dataArray ) {

	}

	#handleAnalog ( dataArray ) {

	}
}