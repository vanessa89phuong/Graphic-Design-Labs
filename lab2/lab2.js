/**
 * Created by VanPhuong on 9/12/16.
 */
"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 1;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1, 1 ),
        vec2(  1,  1 ),
        vec2(  1, -1 ),
        vec2(-1,-1)
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],vertices[3],
        NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 255, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
    gl.enableVertexAttribArray(program.vertexColorAttribute);
    initBuffers();

    render();
};

function triangle( c03, c33, c30, c00)
{
    points.push( c03, c33, c30 );
    points.push(c03, c00, c30);
}

function divideTriangle( c03, c33, c30, c00, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( c03,c33,c30,c00 );
    }
    else {

        //bisect the sides

        var ab = mix( c03, c33, 0.33 );
        var ac = mix( c03, c30, 0.33 );
        var ac1 = mix( c03, c30, 0.25 );
        var ad = mix( c03, c00, 0.33 );

        var ba = mix( c33, c03, 0.33 );
        var bc = mix( c33, c30, 0.33 );
        var bd = mix( c33, c00, 0.33 );
        var bd1 = mix( c33, c00, 0.25);

        var ca = mix( c30, c03, 0.33 );
        var ca1 = mix( c30, c03, 0.25 );
        var cb = mix( c30, c33, 0.33 );
        var cd = mix( c30, c00, 0.33 );

        var da = mix( c00, c03, 0.33 );
        var db = mix( c00, c33, 0.33 );
        var db1 = mix( c00, c33, 0.25 );
        var dc = mix( c00, c30, 0.33 );




        --count;

        // three new triangles
        divideTriangle( ac1, bd1, ca1, db1, count );
        divideTriangle( ac, bd, ca, db, count );


    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
