import * as THREE from '../three/three.module.js';
import { Object3D, Group, Color } from '../three/three.module.js';
import ScreenHelper from './ScreenHelper.js';
import ScreenCameraHelper from './ScreenCameraHelper.js';

// const screenColors = [0x3399DD, 0xDD3399, 0x99DD33];
const screenCameraColors = [0x1177BB, 0xBB1177, 0x77BB11];
const screenColors = [ 0xE6194B, 0x3CB44B, 0x4363D8, 0xF58231, 0x911EB4, 0x46F0F0, 0xF032E6, 0xBCF60C, 0xFABEBE, 0x008080 ];
export default class CaveHelper extends Object3D {
	#cave;
	#screenHelpers;
	#screenCameraHelpers;
	#axesHelper;
    #arrowHelpers = new Group( );
    #pointerHelpers = new Group( );

	constructor ( cave ) {
		super();

		this.type = 'CaveHelper';
		this.#cave = cave;
		this.#cave.setOnChange( ( position, rotation, scale ) => this.#updateTransforms( position, rotation, scale ) );
		this.#initializeHelpers( );

	}

	#initializeHelpers ( ) {
		this.#axesHelper = new THREE.AxesHelper( 1 );

		this.#screenHelpers = new Group( );
		this.#cave.screens.forEach( ( screen, i ) => {
			this.#screenHelpers.add( new ScreenHelper( screen, screenColors[ i ] ) );
		} );
		this.#screenHelpers.add( this.#axesHelper );
		this.add( this.#screenHelpers );
		
		this.#screenCameraHelpers = new Group( );
		this.#cave.screenCameras.forEach( ( screenCamera, i ) => {
			this.#screenCameraHelpers.add( new ScreenCameraHelper( screenCamera, new Color( screenCameraColors[ i ] ) ) );
		} );
		this.add( this.#screenCameraHelpers );

        this.add( this.#arrowHelpers );
        this.add( this.#pointerHelpers );
	}

	updateScreenCameraHelpers ( ) {
		for(const screenCameraHelper of this.#screenCameraHelpers.children) {
			screenCameraHelper.update( );
			// console.log(screenCameraHelper)
		}
	}

	// hideStereoScreenCameraHelpers ( ) {
	// 	this.remove(this.#stereoScreenCameraHelpers);
	// }

	// showStereoScreenCameraHelpers ( ) {
	// 	this.add(this.#stereoScreenCameraHelpers);
	// }

	setLayer ( layer ) {
		this.layers.set(layer);
		this.#axesHelper.layers.set(layer);

		for(const screenHelper of this.#screenHelpers.children) {
			screenHelper.setLayer(layer);
		}

		// for(const stereoScreenCameraHelper of this.#stereoScreenCameraHelpers.children) {
		// 	stereoScreenCameraHelper.setLayer(layer);
		// }
	}

	#updateTransforms ( position, rotation, scale ) {
		console.log( `CaveHelper - #updateTransforms`);	

		this.#screenHelpers.position.copy( position );
		this.#screenHelpers.quaternion.copy( rotation );
		this.#screenHelpers.scale.copy( scale );
        this.#arrowHelpers.position.copy( position );
		this.#arrowHelpers.quaternion.copy( rotation );
		this.#arrowHelpers.scale.copy( scale );
        this.#pointerHelpers.position.copy( position );
		this.#pointerHelpers.quaternion.copy( rotation );
		this.#pointerHelpers.scale.copy( scale );
	}

    addControler ( ) {
        const arrow = new THREE.ArrowHelper(new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,0), 0.5, 0xFF5500);
        this.#arrowHelpers.add( arrow );
        return arrow;
    }

    addPointer ( ) {
        const point = new THREE.Mesh( new THREE.SphereGeometry( 0.02, 16, 15), new THREE.MeshBasicMaterial({color: 0xFF0000}))
        
        this.#pointerHelpers.add( point );
        return point;
    }
}