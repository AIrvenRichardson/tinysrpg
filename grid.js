//So currently you can render a grid and determine what square your mouse is over. Then it changes colors. The important part is that you can index the rectangles.

const RECTSIZE = 40; //The size of the squares on the board

document.addEventListener("DOMContentLoaded", () => {
    //get some important variables
    const canvas = document.getElementById("myCanvas");
    const ctx = canvas.getContext("2d");
    const dirs = [[1,0],[-1,0],[0,-1],[0,1]];
    //Locks the canvas size to half the screen size to the nearest multiple of RECTSIZE
    canvas.width = (window.innerWidth / 2) - ((window.innerWidth / 2) % RECTSIZE);
    canvas.height = (window.innerHeight / 2) - ((window.innerHeight / 2) % RECTSIZE);
    //make variables for the number of rows and columns on the board
    const cols = canvas.width / RECTSIZE;
    const rows = canvas.height / RECTSIZE;
    //this variable holds the board
    let board = [];
    makeBoard();
    //Global variables  
    let selection = false;
    let selectedsq = [0,0];

    board[rows-1][cols-1].color = "green";
    board[0][0].color = "green";

    drawRects();
    
    canvas.addEventListener("click", function(evt){
        mouseAction(canvas,evt);
    });

    function makeBoard(){
        //iterate through the rows and cols and generate an empty board
        let i = 0;
        let j = 0;
        while (j < rows) {
            board.push([]);
            while (i < cols) {
                board[j].push({x: i * RECTSIZE, y: j * RECTSIZE, w:RECTSIZE, h:RECTSIZE, color: "red"});
                i++;
            }
            i = 0;
            j++;
        }
    }

    function drawRects(){
        for (row of board){
            for (e of row){
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x, e.y, e.w, e.h);
                ctx.strokeRect(e.x, e.y, e.w, e.h);
            }
        }
    }

    function getMousePos(canvas, evt) {
        var bbox = canvas.getBoundingClientRect();
        return {
          x: ((evt.clientX - bbox.left) - ((evt.clientX - bbox.left)%RECTSIZE))/RECTSIZE,
          y: ((evt.clientY - bbox.top) - ((evt.clientY - bbox.top)%RECTSIZE))/RECTSIZE
        };
    }

    //This function defines what happens on click, if you click on a green square (player) while not selected, it will select them, if you are selected, you can click a blue square to move the green square to it
    function mouseAction(canvas, evt){
        let mp = getMousePos(canvas, evt);
        if ((mp.x < cols) & (mp.y < rows)){
            
            //Am i trying to move a unit?
            if (selection == false){
                if (board[mp.y][mp.x].color == "green"){
                    selection = true
                    selectedsq = [mp.y, mp.x]
                    bfs(mp.x,mp.y,3,"blue");
                }
            }
            //move a unit to a blue square OR deselect it.
            else{
                if (board[mp.y][mp.x].color == "blue"){
                    selection = false
                    board[selectedsq[0]][selectedsq[1]].color = "red"
                    bfs(selectedsq[1],selectedsq[0],3,"red");
                    board[mp.y][mp.x].color = "green"                   
                }
                else{
                    selection = false
                    bfs(selectedsq[1],selectedsq[0],3,"red");
                }
            } 
            drawRects();         
        }  
    }

    //This functions goal is to show you the movement range of a selected unit (currently a green square)
    function bfs(x,y,range,c){
        //two queue bfs that ends after some amount of iterations
        let q1 = [[x,y]];
        let q2 = [];
        let seen = {};
        let steps = range;
        
        while (q1.length > 0){
            //get and unpack location
            let g = q1.shift();
            let col = g[0];
            let row = g[1];
            seen[[row,col]] = 1;
            
            if (steps > 0){
                for (d of dirs){
                    if (0 <= row+d[0] && row+d[0] < rows && 0 <= col+d[1] && col+d[1] < cols && !([row+d[0],col+d[1]] in seen)){ //fat check for being on the grid
                        //currently only lets you move over blue or red
                        if (board[row+d[0]][col+d[1]].color == "red" || board[row+d[0]][col+d[1]].color == "blue"){
                            board[row+d[0]][col+d[1]].color = c;   
                            seen[[row+d[0],col+d[1]]] = 1;
                            q2.push([col+d[1],row+d[0]]);                    
                        }
                    }
                }
            }
            
            //if i've iterated over the whole queue, replace q1 with q2's values and empty q2
            if (q1.length <= 0){
                //q1 = JSON.parse(JSON.stringify(q2));
                q1 = Array.from(q2);
                q2 = [];
                steps = steps - 1;
            }
        }
    }

});
