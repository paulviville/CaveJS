import * as THREE from 'three';

const STEREO_MODES = {
	Sequential: 0,
	SbS: 1,
}

export default class CaveRenderer {
	#cave;
	#renderers = new Map( );
	#canvases = new Map( );
	#viewports = new Map( );
	#stereoMode;
	#render;

	#scene;

	#frameRate; /// Hz
	#frameTime; /// ms
	#currentFrame = 0;
	#animationRequest;
	#animationLoop;

	#preRenderCallback;
	#postRenderCallback;

	#skip;
	#t0;
	constructor ( cave, stereoMode = "Sequential", frameRate = 60 ) {
		this.#cave = cave;
		this.setStereoMode( stereoMode );
		this.#frameRate = frameRate;
		this.#frameTime = 1000 / this.#frameRate;
	}

	setAnimationLoop ( callback ) {
		this.#animationLoop = callback;
	}

	addCanvas ( id, canvas ) {
		this.#canvases.set( id, canvas );

		const renderer = new THREE.WebGLRenderer( { canvas: canvas } );
		renderer.setScissorTest(true);
		
		
		this.#renderers.set( id, renderer );

		return renderer;
	}

	/// viewport = { id, left, bottom, width, height, window }
	addViewport ( id, viewport ) {
		this.#viewports.set( id, viewport );
	}

	setScene ( scene ) {
		this.#scene = scene;
	}

	set preRender ( callback ) {
		this.#preRenderCallback = callback;
	}

	set postRender ( callback ) {
		this.#postRenderCallback = callback;
	}

	#preRender ( time, frame ) {
		this.#preRenderCallback?.( );
	}

	#postRender ( time, frame ) {
		this.#postRenderCallback?.( );
	}

	#renderSequential ( time, frame ) {
		// console.log( time, frame )
		for ( const [ _, viewport ] of this.#viewports ){
			const screenCamera = this.#cave.screenCameras[ viewport.screen ];
			const renderer = this.#renderers.get( viewport.window );

			renderer.setViewport(viewport.left, viewport.bottom, viewport.width, viewport.height);
			renderer.setScissor(viewport.left, viewport.bottom, viewport.width, viewport.height);
			
			renderer.render( this.#scene, ( frame % 2 ) ? screenCamera.left : screenCamera.right );
		}
	}

	#renderSideBySide ( time, frame ) {
		for ( const [ _, viewport ] of this.#viewports ){
			const screenCamera = this.#cave.screenCameras[ viewport.screen ];
			const renderer = this.#renderers.get( viewport.window );

			renderer.setViewport(viewport.left, viewport.bottom, viewport.width / 2 , viewport.height);
			renderer.setScissor(viewport.left, viewport.bottom, viewport.width / 2, viewport.height);
			renderer.render( this.#scene, screenCamera.left );
			
			renderer.setViewport(viewport.left + viewport.width / 2, viewport.bottom, viewport.width / 2, viewport.height);
			renderer.setScissor(viewport.left + viewport.width / 2, viewport.bottom, viewport.width / 2, viewport.height);
			renderer.render( this.#scene, screenCamera.right );
		}
	}

	setStereoMode ( stereoMode ) {
		this.#stereoMode = stereoMode;
		console.log( stereoMode )
		switch ( stereoMode ) {
			case "Sequential":
				this.#render = this.#renderSequential;
				break;
			case "SbS":
				this.#render = this.#renderSideBySide;
		}
	}

	#onAnimationFrame ( time ) {
		const frame = Math.floor( ( time - this.#t0 ) / this.#frameTime );
		
		if ( this.#skip == ( frame % 2) )
			console.log(" skipped a frame ");

		this.#skip = (frame % 2)

		this.#preRender( time, frame );
		this.#render( time, frame );
		this.#postRender( time, frame );

		this.#animationRequest = requestAnimationFrame( 
			this.#onAnimationFrame.bind( this )
		);
	}

	start ( ) {
		this.#t0 = performance.now( );
		this.#animationRequest = requestAnimationFrame( 
			this.#onAnimationFrame.bind( this )
		);
	}

	stop ( ) {
		cancelAnimationFrame( this.#animationRequest );
	}
}