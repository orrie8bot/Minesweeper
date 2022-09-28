class Cell {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.isRevealed = false;
        this.isMine = false;
        this.neighboringMineCount = 0;
    }
}

class Minesweeper {
    constructor (dom, width, height, mineCount, cellSize) {
        this.dom = dom;
        this.canvas = null;
        this.ctx = null;
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.mineCount = mineCount;
        this.cellSize = cellSize;
        this.mineField = null;
        this.remainingCells = null;
        this.cols = 0;
        this.rows = 0;

        this.setup();

    }

    setup () {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
       
        this.ctx = this.canvas.getContext('2d');
       
        this.dom.appendChild(this.canvas);

        this.cols = this.width / this.cellSize;
        this.rows = this.height / this.cellSize;

        this.createMineField();
        this.placeMines();
        this.countNeighboringMines();

        this.remainingCells = this.mineField.flat().length - this.mineCount;
        
        this.draw();

        this.canvas.addEventListener('click', e => {
            const clickX = e.clientX - this.canvas.offsetLeft;
            const clickY = e.clientY - this.canvas.offsetTop;

            const cell = this.getCellByXandY(clickX, clickY);

            if (cell.isRevealed) return;
            
            if (cell.isMine) return this.gameOver();

            cell.isRevealed = true;
            
            this.floodFill(cell);
            
            this.checkForWin();

            this.draw();
        })
    }

    checkForWin () {
        this.remainingCells = this.mineField.flat().filter(cell => !cell.isMine && !cell.isRevealed);

       if (this.remainingCells.length === 0) alert('You Win!'); 
    }

    floodFill (cell) {
        if (cell.neighboringMineCount === 0) {
            if (cell.x - 1 > 0) {
                const lc = this.mineField[cell.y][cell.x - 1];
                if (!lc.isRevealed) {
                    lc.isRevealed = true;
                    if (lc.neighboringMineCount === 0) {
                        this.floodFill(lc)
                    } 
                }
            }

            if (cell.x + 1 < this.cols) {
                const rc = this.mineField[cell.y][cell.x + 1];
                if (!rc.isRevealed) {
                    rc.isRevealed = true;
                    if (rc.neighboringMineCount === 0) {
                        this.floodFill(rc)
                    } 
                }
            }

            if (cell.y - 1 >= 0) {
                const tc = this.mineField[cell.y - 1][cell.x];
                if (!tc.isRevealed) {
                    tc.isRevealed = true;
                    if (tc.neighboringMineCount === 0) {
                        this.floodFill(tc)
                    } 
                }
            }

            if (cell.y + 1 < this.rows) {
                const bc = this.mineField[cell.y + 1][cell.x];
                if (!bc.isRevealed) {
                    bc.isRevealed = true;
                    if (bc.neighboringMineCount === 0) {
                        this.floodFill(bc)
                    } 
                }
            }
        } 
    }

    getCellByXandY (xPos, yPos) {
        return this.mineField[Math.floor(yPos / this.cellSize)][Math.floor(xPos / this.cellSize)]
    }

    createMineField () {
        this.mineField = [];
        for (let y = 0; y < this.rows; y++) {
            this.mineField[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.mineField[y][x] = new Cell(x, y, this.cellSize);
            }
        }
    }

    placeMines () {
        let minesLeft = this.mineCount;
        while (minesLeft > 0) {
            const x = Math.floor(Math.random() * this.cols);
            const y = Math.floor(Math.random() * this.rows);

            if (this.mineField[y][x].isMine) continue;

            console.log(`Place mine at ${x}:${y}`);

            this.mineField[y][x].isMine = true;

            minesLeft--;
        }

        // console.log(this.mineField);
    }

    countNeighboringMines () {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.mineField[y][x];

                if (cell.isMine) continue;

                for (let yPos = 0; yPos < this.rows; yPos++) {
                    for (let xPos = 0; xPos < this.cols; xPos++) {
                        const c = this.mineField[yPos][xPos];

                        if (c === cell) continue;
                        if (c.x > cell.x + 1 || c.x < cell.x - 1 || c.y > cell.y + 1 || c.y < cell.y - 1) continue; 
                        if (!c.isMine) continue;

                        cell.neighboringMineCount++;
                        
                    }
                }
            }
        }
    }

    gameOver () {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.mineField[y][x];
                cell.isRevealed = true;
            }
        }        
        this.draw();

        alert('Game Over');
    }


    draw () {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const cell = this.mineField[y][x];
               
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#333';
                this.ctx.rect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                
                if (cell.isRevealed && cell.isMine) {
                    this.ctx.fillStyle = '#f00';
                    this.ctx.fill();
                }

                if (cell.neighboringMineCount > 0) {
                    this.ctx.fillStyle = '#000';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.font = '15px Arial';
                    this.ctx.fillText(cell.neighboringMineCount, cell.x * this.cellSize + this.cellSize / 2, cell.y * this.cellSize + this.cellSize / 2);
                }
                
                
                if (!cell.isRevealed) {
                    this.ctx.fillStyle = '#ccc';
                    this.ctx.fill();
                }
                
                this.ctx.stroke();
                this.ctx.closePath();
                
            }
        }    
    }
}