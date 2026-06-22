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
        let name = `${ this.#name }`;
        if ( this.#sensor !== undefined )
            name += `-${ this.#sensor }`;
        return name;
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
    #mapping = new Map( );
    #callbacksMap;

	constructor ( name, sensor, mapping = { }) {
		super( name, sensor );

        for ( const value in mapping ) {
            this.#mapping.set( parseInt( value ), mapping[ value ] );
        }
        console.log(this.#mapping)
	}

    set callbacksMap ( callbacksMap ) {
        this.#callbacksMap = callbacksMap;
        for ( const [ _, key ] of this.#mapping ) {
            this.#callbacksMap.set( key, undefined );
        }
    }

    on ( value, state ) {
        const mappedKey = this.#mapping.get( value );
        const callback = this.#callbacksMap.get( mappedKey );
        callback?.( state );
    }
}

class AnalogSignal extends Signal {
	#vector = new THREE.Vector2( 0, 0 );

	constructor ( name, sensor ) {
		super( name, sensor );
	}

	setVector ( x, y ) {
		this.#vector.set( x, y );
		this.callback?.( this.#vector );
	}
}

export default class Tracker {
	#socket;

	#signals = new Map( );
	#trackers = new Map( );
	#analogs = new Map( );
	#buttons = new Map( );
    #buttonsCallbacks = new Map( );

	constructor ( vrpn ) {
        this.#initializeTrackers( vrpn.trackers );
        this.#initializeAnalogs( vrpn.analogs );
        this.#initializeButtons( vrpn.buttons );
	}

	connect ( uri = "ws://localhost:8000" ) {
        console.log("tracking")
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

    #initializeAnalogs ( analogs ) {
        for ( const analog of analogs ) {
            const analogSignal = new AnalogSignal( analog.signal, analog.sensor );
            this.#analogs.set( analogSignal.name, analogSignal );
            this.#addSignal( analog.target, analog );
        }
    }

    #initializeButtons ( buttons ) {
        for ( const button of buttons ) {
            const buttonSignal = new ButtonsSignal( button.signal, button.sensor, button.mapping );
            this.#buttons.set( buttonSignal.name, buttonSignal );
            this.#addSignal( button.target, button );
            buttonSignal.callbacksMap = this.#buttonsCallbacks;
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

		tracker.setTransform( ...dataArray.map( x => parseFloat( x ) ) );
	}

	#handleButton ( dataArray ) {
        const signal = dataArray.shift( );

		const button = this.#buttons.get( signal );
		if ( button === undefined ) {
			console.warn( `button ${ signal } undefined` );
			return;
		}
        // console.log( signal )
        // console.log(button)
        // console.log(dataArray)
        button.on( ...dataArray.map( x => parseInt( x ) ) );
	}

	#handleAnalog ( dataArray ) {
        const signal = dataArray.shift( );

		const analog = this.#analogs.get( signal );
		if ( analog === undefined ) {
			console.warn( `analog ${ signal } undefined` );
			return;
		}

		analog.setVector( ...dataArray.map( x => parseFloat( x ) ) );
	}

    setCallback ( target, callback ) {
        const targetSignal = this.#signals.get( target );
        if ( targetSignal )
            targetSignal.callback = callback;
    }

    /// mapped buttons: LeftTrigger, Left0..3, RightTrigger, Right0...3
    setButtonCallback ( key, callback ) {
        if ( this.#buttonsCallbacks.has( key ) )
            this.#buttonsCallbacks.set( key, callback );
        else 
            console.warn( `unmapped key` );
    }

    has ( target ) {
        return ( this.#signals.get( target ) !== undefined );
    }
}