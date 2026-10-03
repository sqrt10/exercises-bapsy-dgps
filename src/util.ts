
/** Return a random integer from 0 to `size` - 1. */
export function randi( size: number ): number {
	if( size < 2 || size >= Number.MAX_SAFE_INTEGER ) {
		throw new Error( "Invalid argument " + size );
	}
	size = size << 0; // cut off decimals.
	return Math.floor( Math.random() * size );
}

/** Return either true or false, randomly. */
export function randBool(): boolean {
	return Math.random() >= 0.5 ? true : false;
}

/** Return a random Element of a given Array. */
export function randElement<Type>( array: Array<Type> ): Type {
	if( !Array.isArray( array ) ) {
		throw new Error( "Invalid argument." );
	}
	const index = Math.floor( Math.random() * array.length );
	return array[ index ];
}

/** Return a random Value of the given Enum. */
export function randEnum<T extends {[key: number]: string | number}>(e: T): T[keyof T] {
	const keys = Object.keys( e );
	const randomKey = randElement( keys );

	// Numeric enums members also get a reverse mapping from enum values to enum names.
	// So, if a key is a number, actually it's a value of a numeric enum.
	// see https://www.typescriptlang.org/docs/handbook/enums.html#reverse-mappings
	const randomKeyNumber = Number( randomKey );
	return isNaN( randomKeyNumber )
		? e[ randomKey as keyof T ]
		: randomKeyNumber as unknown as T[ keyof T ];
}
