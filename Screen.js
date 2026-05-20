import { Vector3, Matrix4 } from "three";

///		2 ------ 3
///     | Screen |
///     0 ------ 1

export default class Screen {
	#corners = [ new Vector3( -1, -1, 0 ), new Vector3( 1, -1, 0 ), new Vector3( -1, 1, 0 ) ];

	constructor ( corners ) {
		this.#corners.forEach( ( _, i ) => { this.#corners[i].copy( corners[i] ); } );
	}
""
	get corners ( ) {
		return this.#corners.map( corner => corner.clone( ) );
	}
}