export default class CaveWindow {
	#window;
	#canvas;
	#name;
	#id;
	#width;
	#height;
	ready = false;
	#callbackFuncs;

	constructor ( id, name, width, height, callbackFuncs ) {
		this.#id = id;
		this.#name = name;
		this.#width = width;
		this.#height = height;
		this.#callbackFuncs = callbackFuncs;
	}

	#onLoad ( ) {
		this.#canvas = this.#window.document.createElement('canvas');
		this.#window.document.body.appendChild(this.#canvas);
		this.#canvas.width = this.#window.innerWidth;
		this.#canvas.height = this.#window.innerHeight;
		
		this.#window.document.title = this.#name;
		this.ready = true;
		this.#callbackFuncs.onLoad?.( this.#canvas );
	}

	#onResize ( ) {
		console.log( "CaveWindow - #onResize" );
	}

	async #fullscreen ( display ) {
		const screens = await this.#window.getScreenDetails();
		const screen = screens.screens[ display ]
		this.#window.moveTo(screen.availLeft, screen.availTop);
		// this.#window.resizeTo(screen.availWidth, screen.availHeight);

		await this.#window.document.documentElement.requestFullscreen( );

	}
	
	open ( display = 0 ) {
		this.#window = window.open(`./CaveJS/CaveWindow.html`, "", `width=${ this.#width }, height=${ this.#height }, left=${display * 100}`);
		
		
		this.#window.addEventListener( "load", ( ) => this.#onLoad( ) );
		this.#window.addEventListener( "resize", ( ) => this.#onResize( ) );

		this.#window.addEventListener( "mousedown", ( ) => this.#fullscreen( display ), { once: true } );
	}

	close ( ) {
		this.#window.close();
	}
}