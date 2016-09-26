/**
 * Created by VanPhuong on 9/12/16.
 */
"use strict";

var gl;
var theta;
var canvas;
var thetaLoc;
var direction;
var points = [];
var zoom;
var speed;
var NumTimesToSubdivide = 6;

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
        vec2( -1,  1),
        vec2(  1,  1),
        vec2(  1, -1),
        vec2( -1, -1)
    ];
    divideTriangle(vertices[0], vertices[1], vertices[2],vertices[3], NumTimesToSubdivide);
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
    //.
    theta = 0.0;
    thetaLoc = gl.getUniformLocation(program, "theta");

    // Initialize event handlers
    document.getElementById("slider").onchange = function(event) {
        speed = 100 - event.target.value;
    };

    document.getElementById("zoom").onchange = function(event) {
        zoom = 100 - event.target.value;
    };

    document.getElementById("Direction").onclick = function (event) {
        direction = !direction;
    };

    document.getElementById("Controls").onclick = function(event) {
        switch(event.target.index) {
          case 0:
            direction = !direction;
            break;
         case 1:
            speed /= 2.0;
            break;
         case 2:
            speed *= 2.0;
            break;
       }
    };

    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
          case '1':
            NumTimesToSubdivide = 1;
            break;
          case '2':
            NumTimesToSubdivide = 2;
            break;
          case '3':
            NumTimesToSubdivide = 3;
            break;
          case '4':
            NumTimesToSubdivide = 4;
            break;
          case '5':
            NumTimesToSubdivide = 5;
            break;
          case '6':
            NumTimesToSubdivide = 6;
            break;
          case '7':
            vertices = [
                vec2( -0.75,  0.75),
                vec2(  0.75,  0.75),
                vec2(  0.75, -0.75),
                vec2( -0.75, -0.75)
            ];
            break;
          case '8':
            vertices = [
                vec2( -0.5,  0.5),
                vec2(  0.5,  0.5),
                vec2(  0.5, -0.5),
                vec2( -0.5, -0.5)
            ];
            break;
          case '9':
            alert("Recursion Level Too High !");
        }
        points = [];
        divideTriangle( vertices[0], vertices[1], vertices[2], vertices[3], NumTimesToSubdivide);
        var bufferId = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
        var vPosition = gl.getAttribLocation( program, "vPosition" );
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
    };
    render();
};


function triangle( c03, c33, c30, c00)
{
    points.push(c03, c33, c30);
    points.push(c03, c00, c30);
}


function divideTriangle( c03, c33, c30, c00, count )
{
    //.console.log(count);

    // check for end of recursion

    if ( count === 0 ) {
        triangle( c03,c33,c30,c00 );
    }
    else {

        //bisect the sides

        var ab = mix( c03, c33, 0.33 );
        var ac = mix( c03, c30, 0.33 );
        var ad = mix( c03, c00, 0.33 );

        var ba = mix( c33, c03, 0.33 );
        var bc = mix( c33, c30, 0.33 );
        var bd = mix( c33, c00, 0.33 );

        var ca = mix( c30, c03, 0.33 );
        var cb = mix( c30, c33, 0.33);
        var cd = mix( c30, c00, 0.33 );

        var da = mix( c00, c03, 0.33 );
        var db = mix( c00, c33, 0.33 );
        var dc = mix( c00, c30, 0.33 );




        --count;

        // three new triangles

        divideTriangle( c03, ab, ac, ad, count );
        divideTriangle( ab, ba, bd, ac, count );
        divideTriangle( ba, c33, bc, bd, count );
        divideTriangle( bd, bc, cb, ca, count );
        divideTriangle( ca, cb, c30, cd, count );
        divideTriangle( db, ca, cd, dc, count );
        divideTriangle( da, db, dc, c00, count );
        divideTriangle( ad, ac, db, da, count );
    }
}


function render()
{
    theta += (direction ? 0.05 : -0.05);
    gl.uniform1f(thetaLoc, theta);
    //.
    gl.clear( gl.COLOR_BUFFER_BIT );
    //.
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
    setTimeout(function(){
        requestAnimFrame(render);
        
    },speed);
}
//.
//.
//.
