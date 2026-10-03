
import * as util from "./util";

/** Parent Element showing the pattern in question. */
let patternTable: HTMLElement;

/** Parent Element listing possible solutions. */
let choicesTable: HTMLElement;

/** How the pattern continues. */
enum Direction { byRow, byColumn };
/** How Rule 2 generate the third figure from the first two.
 * Note: `notequal` is the same as XOR. */
enum Operation { and, nand, or, nor, equal, notequal };

interface Rule1 {
	direction: Direction;
	rotation: number;
};
interface Rule2 {
	direction: Direction;
	operation: Operation;
};
interface Ruleset { rule1: Rule1, rule2: Rule2 };

let solution: Ruleset;

interface Figure {
	/** Position of the rotating thing referred by rule1. */
	position: number,
	/** States of the boolean things referred by rule2. */
	bools: boolean[],
};
/** Number of the boolean things referred by rule2. */
const boolsLength = 6;

const pattern = [] as Array<Figure>;
const choices = [] as Array<Figure>;
/** Element in choices that follows the pattern. */
let solutionIndex: number;

function initDom() {
	const tmp1 = document.querySelector( "div.figuralTable.pattern" );
	const tmp2 = document.querySelector( "div.figuralTable.choices" );
	if( !tmp1 || !tmp2 ){ throw new Error( "Element not found. Update Html or js." ); }
	patternTable = tmp1 as HTMLElement;
	choicesTable = tmp2 as HTMLElement;
}

function generateNewPuzzle() {
	/** Reset the variables to be written */
	for( let iPattern = 0; iPattern < 9; iPattern++ ) {
		// Create dummy objects to overwrite.
		pattern[ iPattern ] = {} as Figure;
	}
	while( choices.length > 0 ) { choices.pop(); }

	/** Generate Rules */
	solution = {
		rule1: {
			direction: util.randEnum( Direction ),
			rotation: (
				( ( Math.random() >= 0.5 ) ? +1 : -1 ) // Random sign, cw/ccw.
				* ( util.randi( 4 ) + 1 ) * 45 // 45°, 90°, 135° or 180°
			),
		},
		rule2: {
			direction: util.randEnum( Direction ),
			operation: util.randEnum( Operation ),
		}
	};

	/** Generate the pattern of 3x3 Figures.
	 * Fix the 3rd Figures so that the logic applies. */
	for( let iThree = 0; iThree < 3; iThree++ ) {
		// Apply Rule 1
		let index1, index2, index3;
		if( solution.rule1.direction == Direction.byRow ) {
			index1 = iThree * 3 + 0;
			index2 = iThree * 3 + 1;
			index3 = iThree * 3 + 2;
		} else { // Direction.byColumn
			index1 = iThree * 1 + 0;
			index2 = iThree * 1 + 3;
			index3 = iThree * 1 + 6;
		}
		// First is random
		const position1 = util.randi( 8 ) * 45;
		pattern[ index1 ].position = position1;
		// Second and Third follow Rule1.
		pattern[ index2 ].position = position1 + solution.rule1.rotation * 1;
		pattern[ index3 ].position = position1 + solution.rule1.rotation * 2;

		// Apply Rule 2
		if( solution.rule2.direction == Direction.byRow ) {
			index1 = iThree * 3 + 0;
			index2 = iThree * 3 + 1;
			index3 = iThree * 3 + 2;
		} else { // Direction.byColumn
			index1 = iThree * 1 + 0;
			index2 = iThree * 1 + 3;
			index3 = iThree * 1 + 6;
		}
		const bools1 = [] as boolean[];
		const bools2 = [] as boolean[];
		const bools3 = [] as boolean[];
		for( let iBool = 0; iBool < boolsLength; iBool++ ) {
			// First two are random
			const bool1 = util.randBool();
			const bool2 = util.randBool();
			bools1.push( bool1 );
			bools2.push( bool2 );
			// Last follows Rule2
			let bool3;
			switch( solution.rule2.operation ) {
				case Operation.and:       { bool3 =  ( bool1 && bool2 ); break; }
				case Operation.nand:      { bool3 = !( bool1 && bool2 ); break; }
				case Operation.or:        { bool3 =  ( bool1 || bool2 ); break; }
				case Operation.nor:       { bool3 = !( bool1 || bool2 ); break; }
				case Operation.equal:     { bool3 = ( bool1 === bool2 ); break; }
				case Operation.notequal:  { bool3 = ( bool1 !== bool2 ); break; }
			}
			bools3.push( bool3 );
		}
		pattern[ index1 ].bools = bools1;
		pattern[ index2 ].bools = bools2;
		pattern[ index3 ].bools = bools3;
	}
	// Test if the pattern has another solution on the other Direction by accident.
	// @todo.

	/** Generate the 4x4 choices. */
	solutionIndex = util.randi( 16 );
	for( let iChoice = 0; iChoice < 16; iChoice++ ) {
		if( iChoice == solutionIndex ) {
			choices.push( pattern[ 8 ] ); // This is the correct solution
			continue;
		}
		// Not a correct choice, generate something random.
		const position = util.randi( 8 ) * 45;
		const bools = [] as boolean[];
		for( let iBool = 0; iBool < boolsLength; iBool++ ) {
			bools.push( util.randBool() );
		}
		// Test if the choice is correct by accident.
		// @todo.
		choices.push({ position, bools });
	}
}

/** Render the 3x3 Pattern and the 4x4 choices. */
function drawPuzzle() {
	/** Draw a Figure, be it as part of the 3x3 Pattern or the 4x4 choices. */
	function drawFigure( figure: Figure ): string {
		let svgString = '<svg class="Figure" viewBox="-10 -10 20 20" xmlns="http://www.w3.org/2000/svg">';
		// Draw Rule1
		svgString += '<path class="fill" d="M -3,-3 V 3 L 6,0 z" transform="rotate(' + figure.position + ')" />';
		// Draw Rule2
		for( let iBool = 0; iBool < boolsLength; iBool++ ) {
			const bool = figure.bools[ iBool ];
			if( !bool ) {
				continue; // Do not draw this.
			}
			const iToRad = 2 * Math.PI / boolsLength;
			const pos1x = 9 * Math.sin( ( iBool + 0 ) * iToRad );
			const pos1y = 9 * Math.cos( ( iBool + 0 ) * iToRad );
			const pos2x = 9 * Math.sin( ( iBool + 1 ) * iToRad );
			const pos2y = 9 * Math.cos( ( iBool + 1 ) * iToRad );
			svgString += `<path class="stroke" d="M ${pos1x},${pos1y} L ${pos2x},${pos2y}"/>`;
		}
		svgString += '</svg>';
		return svgString;
	}

	let patternInnerHtml = '';
	for( let iPattern = 0; iPattern < 9 - 1; iPattern++ ) {
		patternInnerHtml += '<div>' + drawFigure( pattern[ iPattern ] ) + '</div>';
		if( iPattern == 2 || iPattern == 5 ) {
			patternInnerHtml += '<br />';
		}
	}
	patternInnerHtml += '<div>?</div>'; // Do not draw the solution.
	patternTable.innerHTML = patternInnerHtml;

	let choicesInnerHtml = '';
	for( let iChoice = 0; iChoice < 16; iChoice++ ) {
		choicesInnerHtml += '<div>' + drawFigure( choices[ iChoice ] ) + '</div>';
		if( ( ( iChoice % 4 ) === 3 ) && ( iChoice < 16 - 1 ) ) {
			choicesInnerHtml += '<br />';
		}
	}
	choicesTable.innerHTML = choicesInnerHtml;
}

function main() {
	initDom();
	generateNewPuzzle();
	drawPuzzle();
}

main();
