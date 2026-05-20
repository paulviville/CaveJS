import * as THREE from "three";
import ScreenCamera from "./ScreenCamera.js";

export default class Cave {
	#screens = [ ];
	#position = new THREE.Vector3( );
	#rotation = new THREE.Quaternion( );
	#scale = new THREE.Vector3( 1, 1, 1 );
	#transform = new THREE.Matrix4( );

	#screenCameras = [ ];

	#onChangeCallback = undefined;

	constructor ( screens ) {
		this.#screens.push( ...screens );

		for ( const screen of screens ) {
			this.#screenCameras.push( new ScreenCamera( screen ) );
		}
	}

	get screens ( ) {
		return this.#screens;
	}

	get screenCameras ( ) {
		return this.#screenCameras;
	}

	get position ( ) {
		return this.#position.clone( );
	}

	get rotation ( ) {
		return this.#rotation.clone( );
	}

	get scale ( ) {
		return this.#scale.clone( );
	}

	set position ( position ) {
		this.#position.copy( position );
		this.#onChange( );
	}

	set rotation ( rotation ) {
		this.#rotation.copy( rotation );
		this.#onChange( );
	}

	set scale ( scale ) {
		this.#scale.copy( scale );
		this.#onChange( );
	}

	setOnChange ( onChangeCallback ) {
		this.#onChangeCallback = onChangeCallback;
	}

	#onChange ( ) {
		this.#transform.compose( this.#position, this.#rotation, this.#scale );
		this.#screenCameras.forEach( screenCamera => screenCamera.transform = this.#transform );

		this.#onChangeCallback?.( this.#position.clone( ), this.#rotation.clone( ), this.#scale.clone( ) );
	}

	updateScreenCameras ( headMatrix ) {
		this.#screenCameras.forEach( screenCamera => screenCamera.update( headMatrix ) );

	}
}