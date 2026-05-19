import * as THREE from "three";

export default class Cave {
	#screens;
	#position = new THREE.Vector3( );
	#rotation = new THREE.Quaternion( );
	#scale = new THREE.Vector3( 1, 1, 1 );

	constructor ( screens ) {
		this.#screens = [ ...screens ];
	}

	get screens ( ) {
		return this.#screens;
	}

	get position ( ) {
		return this.#position.clone( );
	}

	set position ( newPosition ) {
		this.#position.copy( newPosition );
	}

	get rotation ( ) {
		return this.#rotation.clone( );
	}

	set rotation ( newRotation ) {
		this.#rotation.copy( newRotation );
	}

	get scale ( ) {
		return this.#scale.clone( );
	}

	set scale ( newScale ) {
		this.#scale.copy( newScale );
	}
}