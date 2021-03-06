 var canvas_minx = 0;
            var canvas_maxx = 800;
            var canvas_miny = 0;
            var canvas_maxy = 800;
            var scene_size = 10.0;
            var scene_minx = -1 * scene_size;
            var scene_maxx = scene_size;
            var scene_miny = -1 * scene_size;
            var scene_maxy = scene_size;
            var canvas_graphx = 0;
            var canvas_graphy = 0;
            var canvas_xaxis_minx = 0;
            var canvas_xaxis_maxx = 0;
            var canvas_xaxis_zeroy = 0;
            var canvas_yaxis_miny = 0;
            var canvas_yaxis_maxy = 0;
            var canvas_yaxis_zerox = 0;
            var canvas_tanline_x1 = 0;
            var canvas_tanline_y1 = 0;
            var canvas_tanline_x2 = 0;
            var canvas_tanline_y2 = 0;
            var slope = 0;
            var scale = 1;
            var graph_coords = [];
            var n = 3000;
            var dx = 0; // set value w.r.t. n in init()
            var x1 = scene_minx;
            var x2 = scene_maxx;

        function canvas_x(x) {
            var u = (x - scene_minx)/(scene_maxx - scene_minx);
            return canvas_minx + u*(canvas_maxx - canvas_minx);
        }

        function canvas_y(y) {
            var v = (y - scene_miny)/(scene_maxy - scene_miny);
            return canvas_miny + (1.0 - v)*(canvas_maxy - canvas_miny);
        }

        function scene_x(x) {
            var u = (x - canvas_minx)/(canvas_maxx - canvas_minx);
            return scene_minx + u*(scene_maxx - scene_minx);
        }

        function point(x, y) {
            this.x = x;
            this.y = y;
        }

        function graph_function(x) {
            return 3*x + 1;
        }

        function graph_function_derivative(x) {
            return 3;
        }

        function build_tangent_line() {
            slope = graph_function_derivative(scene_graphx);
            var L = 400;
            // the stretch value here only works if canvas is a square
            var s = (scene_maxy - scene_miny)/(scene_maxx-scene_minx);
            var delta_x = L/Math.sqrt(1.0 + slope*slope/(s*s));
            var scene_tanline_x1 = scene_graphx - delta_x;
            var scene_tanline_x2 = scene_graphx + delta_x;
            var scene_tanline_y1 = scene_graphy + slope*(scene_tanline_x1 - scene_graphx);
            var scene_tanline_y2 = scene_graphy + slope*(scene_tanline_x2 - scene_graphx);
            canvas_tanline_x1 = canvas_x(scene_tanline_x1);
            canvas_tanline_x2 = canvas_x(scene_tanline_x2);
            canvas_tanline_y1 = canvas_y(scene_tanline_y1);
            canvas_tanline_y2 = canvas_y(scene_tanline_y2);

       }
        function init() {
            var canvas = document.getElementById("myCanvas");
            var i = 0;
            var x = 0;
            var y = 0;
            canvas.addEventListener("mousemove", doMouseMove, false);
            // set up and compute graph of curve
            dx = (scene_maxx - scene_minx)/n;
            x = scene_minx;
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
            build_tangent_line();
            draw_stuff();
        }
        function draw_stuff() {
            var i=0;
            var f = "26px Trebuchet MS";
            var canvas = document.getElementById("myCanvas");
            var ctx = canvas.getContext("2d");
            ctx.clearRect(canvas_minx,canvas_miny, canvas_maxx-canvas_minx, canvas_maxy-canvas_miny);
            ctx.fillStyle = "white";
            ctx.fillRect(canvas_minx,canvas_miny, canvas_maxx-canvas_minx, canvas_maxy-canvas_miny);
            // draw tangent marker
            ctx.lineWidth = 0.375;
            ctx.strokeStyle = "rgb(0,0,0,0.5)";
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
            ctx.beginPath();
            ctx.arc(canvas_graphx,canvas_graphy,4.5,2*Math.PI,false);
            ctx.fillStyle = "blue";
            ctx.fill();
            // draw coord axes
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(canvas_xaxis_minx,canvas_xaxis_zeroy);
            ctx.lineTo(canvas_xaxis_maxx,canvas_xaxis_zeroy);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(canvas_yaxis_zerox,canvas_yaxis_miny);
            ctx.lineTo(canvas_yaxis_zerox,canvas_yaxis_maxy);
            ctx.stroke();
            // draw graph of function
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(graph_coords[0].x,graph_coords[0].y);
            for (i=0; i<n; i++) {
                ctx.lineTo(graph_coords[i].x,graph_coords[i].y);
            }
            ctx.stroke();
            // draw tangent line
            ctx.strokeStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(canvas_tanline_x1,canvas_tanline_y1);
            ctx.lineTo(canvas_tanline_x2,canvas_tanline_y2);
            ctx.stroke();
            offsety = 20.0;
            ctx.font = f;
            ctx.fillStyle = "black";
            ctx.fillText("x",canvas_maxx-30.0,canvas_xaxis_zeroy-13);
            ctx.fillText("y",canvas_yaxis_zerox-20.0,canvas_miny+30.0);
            ctx.fillText("m = " + slope.toFixed(4),80,750);
            ctx.fillText("(" + scene_graphx.toFixed(4) + ", " + scene_graphy.toFixed(4) + ")",560,750);
        }

        function doMouseMove(event) {
            var canvas = document.getElementById("myCanvas");
            canvasx = event.offsetX * 2;
            canvasy = event.offsetY;
            scene_graphx = scene_x(canvasx);
            scene_graphy = graph_function(scene_graphx);
            canvas_graphx = canvas_x(scene_graphx);
            canvas_graphy = canvas_y(scene_graphy);
            build_tangent_line();
            draw_stuff();
            console.log(event.offsetX);
            console.log(event.offsetY);
            console.log(scene_graphx);
          }
