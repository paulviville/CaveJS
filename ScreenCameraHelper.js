import ScreenCamera from "./ScreenCamera.js";
import { CameraHelper, Object3D, Color } from "../three/three.module.js";

export default class ScreenCameraHelper extends Object3D {
	#screenCamera;
	#leftCameraHelper;
	#rightCameraHelper;

	constructor ( screenCamera, color = new Color( 0xffffff ) ) {
		super( );
		this.type = 'ScreenCameraHelper';

		this.#screenCamera = screenCamera;
	
		this.#leftCameraHelper = new CameraHelper( this.#screenCamera.left );
		this.#rightCameraHelper = new CameraHelper( this.#screenCamera.right );
 
		this.#leftCameraHelper.setColors( color, color, color, color, color );
		this.#rightCameraHelper.setColors( color, color, color, color, color );

		this.add( this.#leftCameraHelper, this.#rightCameraHelper );
	}

	update ( ) {
		this.#leftCameraHelper.update( );
		this.#rightCameraHelper.update( );
	}

	setLayer ( layer ) {
		this.layers.set( layer );
		this.#leftCameraHelper.layers.set( layer );
		this.#rightCameraHelper.layers.set( layer );
	}
}