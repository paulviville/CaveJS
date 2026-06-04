import * as THREE from '../three/three.module.js';

class Signal {
	#name;
	#sensor;
	#callback;

	constructor ( name, sensor ) {
		this.#name = name;
		this.#sensor = sensor;
	}

	set callback ( callback ) {
		this.#callback = callback
	}

    get callback ( ) {
        return this.#callback;
    }

    get name ( ) {
        return `${ this.#name }-${ this.#sensor }`;
    }
}

class TrackerSignal extends Signal {
	#position = new THREE.Vector3( 0, 0, 0 );
	#quaternion = new THREE.Quaternion( 0, 0, 0, 1 );


	constructor ( name, sensor ) {
		super( name, sensor );
	}

	setTransform ( x, y, z, qx, qy, qz, qw ) {
		this.#position.set( x, y, z );
		this.#quaternion.set( qx, qy, qz, qw );

		this.callback?.( this.#position, this.#quaternion );
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
		this.callback?.( this.#vector );
	}
}

export default class Tracker {
	#socket;
	#callbacks;

	#signals = new Map( );
	#trackers = new Map( );
	#analogs;
	#buttons;

	constructor ( vrpn ) {
        this.#initializeTrackers( vrpn.trackers );
	}

	connect ( uri = "ws://localhost:8000" ) {
        console.log("trakcing")
		this.#socket = new WebSocket( uri );
		this.#socket.addEventListener( "message", this.#handleMessage.bind(this) );
	}

	#initializeTrackers ( trackers ) {
		for ( const tracker of trackers ) {
            const trackerSignal = new TrackerSignal( tracker.signal, tracker.sensor );
			this.#trackers.set( trackerSignal.name, trackerSignal );
            this.#addSignal( tracker.target, trackerSignal );
		}
	}

    #addSignal ( target, signal ) {
            this.#signals.set( target, signal );
    }

	#handleMessage ( message ) {
        // console.log(message )
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
			// console.warn( `tracker ${ signal } undefined` );
            // console.log(tracker)

		tracker.setTransform( ...dataArray.map( x => parseFloat( x ) ) );
	}

    setCallback ( target, callback ) {
        const targetSignal = this.#signals.get( target );
        if ( targetSignal )
            targetSignal.callback = callback;
    }

	#handleButton ( dataArray ) {
        console.log("button", dataArray)
	}

	#handleAnalog ( dataArray ) {
        console.log("analog", dataArray)
	}

    has ( target ) {
        return ( this.#signals.get( target ) !== undefined );
    }
}