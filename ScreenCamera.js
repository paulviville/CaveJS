import { Matrix4, Vector3, PerspectiveCamera } from "three";
// import * as THREE from "../three/three.module.js";

export default class ScreenCamera {
	#screen;
	#corners = [ new Vector3( -1, -1, 0 ), new Vector3( 1, -1, 0 ), new Vector3( -1, 1, 0 ) ];
	#transform = new Matrix4( );

	#ss = {
		X: new Vector3( ),
		Y: new Vector3( ),
		Z: new Vector3( ),
		R: new Matrix4( ), 
	};

	#eyeSeparation = 0.064;

	#left = {
		eye: new Vector3( ),
		projection: new Matrix4( ),
		view: new Matrix4( ),
	}
	#right = {
		eye: new Vector3( ),
		projection: new Matrix4( ),
		view: new Matrix4( ),
	}

	#leftCamera = new PerspectiveCamera( );
	#rightCamera = new PerspectiveCamera( );
	#nearCP = 0.1;
	#farCP = 50.0;

	constructor ( screen ) {
		this.#screen = screen;

		this.#leftCamera.matrixAutoUpdate = false;
		this.#rightCamera.matrixAutoUpdate = false;
		this.#leftCamera.layers.enable(1);
		this.#rightCamera.layers.enable(2);
	}

	get left ( ) { return this.#leftCamera; }

	get right ( ) { return this.#rightCamera; }

	get eyeSeparation ( ) { return this.#eyeSeparation; }
	
	set eyeSeparation ( dist ) {
		this.#eyeSeparation = dist;
	}

	update ( headMatrix ) {
		this.#resetEyes( );
		console.log(headMatrix)
		this.#left.eye.applyMatrix4( headMatrix );
		this.#right.eye.applyMatrix4( headMatrix );

		this.#computeMatrices( this.#left );
		this.#computeMatrices( this.#right );
		console.log(this.#left)
		console.log(this.#transform)
		this.#leftCamera.matrixWorldInverse.copy( this.#left.view );
		this.#leftCamera.matrixWorld.copy( this.#left.view ).invert( );
		this.#leftCamera.projectionMatrix.copy( this.#left.projection );
		this.#leftCamera.projectionMatrixInverse.copy( this.#left.projection ).invert( );

		this.#rightCamera.matrixWorldInverse.copy( this.#right.view );
		this.#rightCamera.matrixWorld.copy( this.#right.view ).invert( );
		this.#rightCamera.projectionMatrix.copy( this.#right.projection );
		this.#rightCamera.projectionMatrixInverse.copy( this.#right.projection ).invert( );

	}

	set transform ( matrix ) {
		this.#transform.copy( matrix );
		this.#computeScreenSpace( );
	}

	#resetEyes ( ) {
		this.#left.eye.set( -this.#eyeSeparation / 2, 0.0, -0.015 );
		this.#right.eye.set( this.#eyeSeparation / 2, 0.0, -0.015 );
	}

	#computeScreenSpace ( ) {
		const corners = this.#screen.corners;
		this.#ss.X.copy( corners[ 1 ] ).sub( corners[ 0 ] ).normalize( );
		this.#ss.Y.copy( corners[ 2 ] ).sub( corners[ 0 ] ).normalize( );
		this.#ss.Z.crossVectors( this.#ss.X, this.#ss.Y ).normalize( );

		this.#ss.R.makeBasis( this.#ss.X, this.#ss.Y, this.#ss.Z ).transpose( );
	}

	#computeMatrices ( side ) {
		const corners = this.#screen.corners;
		corners.forEach( c => { c.sub( side.eye ); } );

		const dist = - corners[ 0 ].dot( this.#ss.Z );
		const ND = this.#nearCP / dist;

		const l = this.#ss.X.dot( corners[ 0 ] ) * ND;
		const r = this.#ss.X.dot( corners[ 1 ] ) * ND;
		const b = this.#ss.Y.dot( corners[ 0 ] ) * ND;
		const t = this.#ss.Y.dot( corners[ 2 ] ) * ND;

		side.projection.set(
			(2.0 * this.#nearCP) / (r - l), 0.0, (r + l) / (r - l), 0.0,
			0.0, (2.0 * this.#nearCP) / (t - b), (t + b) / (t - b), 0.0, 
			0.0, 0.0, -(this.#farCP + this.#nearCP) / (this.#farCP - this.#nearCP), -(2.0 * this.#farCP * this.#nearCP) / (this.#farCP - this.#nearCP),
			0.0, 0.0, -1.0, 0.0
		);

		side.view.makeTranslation( -side.eye.x, -side.eye.y, -side.eye.z );
		side.view.premultiply( this.#ss.R );
	}
}