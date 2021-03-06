/*
Name: Prahlad Jasti
Course: CSE
Assignment: Final Project
Purpose: To plot a function with a movable cursor to the canvas on the Derive page.
*/
var canvas_minx = 0;
var canvas_maxx = 800; 
var canvas_miny = 0;
var canvas_maxy = 800; //x- and y- dimensions of the canvas used for plotting
var scene_size = 10.0
var scene_minx = -1 * scene_size;
var scene_maxx = scene_size;
var scene_miny = -1 * scene_size;
var scene_maxy = scene_size; //min and max x and y values of the graph
var canvas_graphx = 0;
var canvas_graphy = 0;
var canvas_xaxis_minx = 0;   
var canvas_xaxis_maxx = 0;
var canvas_xaxis_zeroy = 0;  //Variables used to draw and label axes
var canvas_yaxis_miny = 0;
var canvas_yaxis_maxy = 0;
var canvas_yaxis_zerox = 0;
var slope = 0;
var graph_coords = [];
var n = 3000; //Number of segments used to plot the function
var scale = 1;
var dx = 0; 

        function canvas_x(x) {  //Conversion factor from x-coordinate to canvas x-coordinate
            var u = (x - scene_minx)/(scene_maxx - scene_minx);
            return canvas_minx + u*(canvas_maxx - canvas_minx);
        }

        function canvas_y(y) { //Equivalent but for y coordinate
            var v = (y - scene_miny)/(scene_maxy - scene_miny);
            return canvas_miny + (1.0 - v)*(canvas_maxy - canvas_miny);
        }

        function scene_x(x) {  //Reverse conversion function from canvas to graph
            var u = (x - canvas_minx)/(canvas_maxx - canvas_minx);
            return scene_minx + u*(scene_maxx - scene_minx);
        }

        function scene_y(y) {
            var v = 1.0 - (y - canvas_miny)/(canvas_maxy - canvas_miny);
            return scene_miny + v*(scene_maxy - scene_miny);
        }


        function point(x, y) {  //Creates point class
            this.x = x;
            this.y = y;
        }

        function graph_function(x) {   //Function to be graphed
            return (Math.pow(x,3) + 1)/(x+1);
        }

        function init() {
            var canvas = document.getElementById("myCanvas");
            var i = 0;
            var x = 0;
            var y = 0;
            canvas.addEventListener("mousemove", doMouseMove, false);  //Checks for mouse moving to move cursor
            // set up and compute graph of curve
            dx = (scene_maxx - scene_minx)/n;  //Interval length to plot individual segments 
            x = scene_minx;
	    /*Populates coordinate array*/
            for (i=0; i<n; i++) {
                y = graph_function(x);
                graph_coords.push(new point(canvas_x(x),canvas_y(y)));
                x = x + dx;  
            }
            // set up coord axes
            canvas_xaxis_minx = canvas_x(scene_minx);
            canvas_xaxis_maxx = canvas_x(scene_maxx);
            canvas_xaxis_zeroy = canvas_y(0.0);
            canvas_yaxis_miny = canvas_y(scene_miny);
            canvas_yaxis_maxy = canvas_y(scene_maxy);
            canvas_yaxis_zerox = canvas_x(0.0);
            // initial tangent point location
            scene_graphx = 0.5;
            scene_graphy = graph_function(scene_graphx);
            canvas_graphx = canvas_x(scene_graphx);
            canvas_graphy = canvas_y(scene_graphy);
            // initial tangent line
            draw_stuff();
        }
/*Function to draw practically everything on the canvas*/
        function draw_stuff() {
            var i=0;
            var f = "26px Trebuchet MS"; //Font for further text labels
            var canvas = document.getElementById("myCanvas");
            var ctx = canvas.getContext("2d");  //Canvas object used to plot on canvas
            ctx.clearRect(canvas_minx,canvas_miny, canvas_maxx-canvas_minx, canvas_maxy-canvas_miny);
            ctx.fillStyle = "white";
            ctx.fillRect(canvas_minx,canvas_miny, canvas_maxx-canvas_minx, canvas_maxy-canvas_miny);
		//Clears canvas
            ctx.lineWidth = 0.375;
            ctx.strokeStyle = "rgb(0,0,0,0.5)";
	//Draws gridlines, using min and max values of grid
            for (var i = Math.floor(scene_minx) + 1; i < Math.floor(scene_maxx); i += scale){
                ctx.beginPath();
                ctx.moveTo(canvas_x(i),canvas_y(scene_miny));
                ctx.lineTo(canvas_x(i),canvas_y(scene_maxy));
                ctx.stroke();
		}
	    for (var i = Math.floor(scene_miny) + 1; i < Math.floor(scene_maxy); i += scale){
                ctx.beginPath();
                ctx.moveTo(canvas_x(scene_minx),canvas_y(i));
                ctx.lineTo(canvas_x(scene_maxx),canvas_y(i));
                ctx.stroke();
            }
            ctx.lineWidth = 1.0;
		//Draws marker for position at the graph
            ctx.beginPath();
            ctx.arc(canvas_graphx,canvas_graphy,4.5,2*Math.PI,false);
            ctx.fillStyle = "blue";
            ctx.fill();
            // draw coord axes
            ctx.strokeStyle = "black";
            ctx.beginPath();
		//Draws x and y axis
            ctx.moveTo(canvas_xaxis_minx,canvas_xaxis_zeroy);
            ctx.lineTo(canvas_xaxis_maxx,canvas_xaxis_zeroy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas_yaxis_zerox,canvas_yaxis_miny);
            ctx.lineTo(canvas_yaxis_zerox,canvas_yaxis_maxy);
            ctx.stroke();
            // draw graph of function
            ctx.strokeStyle = "blue";
            ctx.beginPath();
			ctx.lineWidth = 2.0;
            ctx.moveTo(graph_coords[0].x,graph_coords[0].y);
		//Continuously moves from point to point until complete, then strokes the entire path
            for (i=0; i<n; i++) {
                ctx.lineTo(graph_coords[i].x,graph_coords[i].y);
            }
            ctx.stroke();
			ctx.lineWidth = 1.0;
            ctx.fillStyle = "black";
            ctx.font = f;
		//Creates labels for x and y axes
	    ctx.fillText("x",canvas_maxx-30.0,canvas_xaxis_zeroy-13);
            ctx.fillText("y",canvas_yaxis_zerox-20.0,canvas_miny+30.0);
		//Displays current coordinates
            ctx.fillText("(" + scene_graphx.toFixed(4) + ", " + scene_graphy.toFixed(4) + ")",560,750);
        }
		//Works by tracking the x position of the mouse on the canvas and plotting based on that
        function doMouseMove(event) {
            var canvas = document.getElementById("myCanvas");
		//canvasx and canvasy get current position of mouse
            canvasx = event.offsetX * 2;
            canvasy = event.offsetY;
            scene_graphx = scene_x(canvasx);
            scene_graphy = graph_function(scene_graphx);
            canvas_graphx = canvas_x(scene_graphx);
            canvas_graphy = canvas_y(scene_graphy);
		//Redraws after mouse moves
            draw_stuff();
          }
