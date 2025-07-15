
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Controls
    const startPauseBtn = document.getElementById('startPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const generationSpan = document.getElementById('generation');

    // Settings
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const applySizeBtn = document.getElementById('applySizeBtn');

    // Patterns
    const patternSelect = document.getElementById('patternSelect');
    const placePatternBtn = document.getElementById('placePatternBtn');

    const CELL_SIZE = 5;
    const LIVE_COLOR = '#000000';
    const DEAD_COLOR = '#FFFFFF';
    const GRID_LINE_COLOR = '#CCCCCC';

    let GRID_WIDTH = parseInt(widthInput.value, 10);
    let GRID_HEIGHT = parseInt(heightInput.value, 10);

    let grid = createEmptyGrid();
    let isRunning = false;
    let generation = 0;
    let animationFrameId;

    const patterns = {
        glider: [
            [0, 1, 0],
            [0, 0, 1],
            [1, 1, 1]
        ],
        gosperGliderGun: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        pentaDecathlon: [
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
            [1, 0, 1],
            [1, 1, 1],
        ]
    };

    function createEmptyGrid() {
        return new Array(GRID_HEIGHT).fill(null)
            .map(() => new Array(GRID_WIDTH).fill(0));
    }

    function resizeGrid() {
        GRID_WIDTH = parseInt(widthInput.value, 10);
        GRID_HEIGHT = parseInt(heightInput.value, 10);
        canvas.width = GRID_WIDTH * CELL_SIZE;
        canvas.height = GRID_HEIGHT * CELL_SIZE;
        reset();
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = GRID_LINE_COLOR;
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                drawCell(x, y);
            }
        }
    }

    function drawCell(x, y) {
        ctx.fillStyle = grid[y][x] ? LIVE_COLOR : DEAD_COLOR;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        if (CELL_SIZE > 2) {
            ctx.strokeStyle = GRID_LINE_COLOR;
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
    }

    function nextGeneration() {
        const newGrid = createEmptyGrid();
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                const neighbors = countNeighbors(x, y);
                const isAlive = grid[y][x];

                if (isAlive && (neighbors === 2 || neighbors === 3)) {
                    newGrid[y][x] = 1;
                } else if (!isAlive && neighbors === 3) {
                    newGrid[y][x] = 1;
                } else {
                    newGrid[y][x] = 0;
                }
            }
        }
        grid = newGrid;
        generation++;
        generationSpan.textContent = generation;
    }

    function countNeighbors(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newY = (y + i + GRID_HEIGHT) % GRID_HEIGHT;
                const newX = (x + j + GRID_WIDTH) % GRID_WIDTH;
                count += grid[newY][newX];
            }
        }
        return count;
    }

    function gameLoop() {
        if (!isRunning) return;
        nextGeneration();
        drawGrid();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function start() {
        isRunning = true;
        startPauseBtn.textContent = 'Pause';
        gameLoop();
    }

    function pause() {
        isRunning = false;
        startPauseBtn.textContent = 'Start';
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    }

    function reset() {
        pause();
        grid = createEmptyGrid();
        generation = 0;
        generationSpan.textContent = generation;
        drawGrid();
    }

    function placePattern() {
        pause();
        const patternName = patternSelect.value;
        const pattern = patterns[patternName];
        if (!pattern) return;

        const patternHeight = pattern.length;
        const patternWidth = pattern[0].length;
        const startX = Math.floor((GRID_WIDTH - patternWidth) / 2);
        const startY = Math.floor((GRID_HEIGHT - patternHeight) / 2);

        for (let y = 0; y < patternHeight; y++) {
            for (let x = 0; x < patternWidth; x++) {
                if (pattern[y][x]) {
                    const gridX = startX + x;
                    const gridY = startY + y;
                    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
                        grid[gridY][gridX] = 1;
                    }
                }
            }
        }
        drawGrid();
    }

    // Event Listeners
    startPauseBtn.addEventListener('click', () => {
        if (isRunning) {
            pause();
        } else {
            start();
        }
    });

    resetBtn.addEventListener('click', reset);
    applySizeBtn.addEventListener('click', resizeGrid);
    placePatternBtn.addEventListener('click', placePattern);

    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            if (isRunning) {
                pause();
            } else {
                start();
            }
        }
    });

    let isMouseDown = false;
    let lastCell = { x: -1, y: -1 };

    function handleMouseEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

        if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
            if (x !== lastCell.x || y !== lastCell.y) {
                grid[y][x] = grid[y][x] ? 0 : 1;
                lastCell = { x, y };
                drawCell(x, y);
            }
        }
    }

    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        handleMouseEvent(e);
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            handleMouseEvent(e);
        }
    });

    canvas.addEventListener('mouseup', () => {
        isMouseDown = false;
        lastCell = { x: -1, y: -1 };
    });

    canvas.addEventListener('mouseleave', () => {
        lastCell = { x: -1, y: -1 };
    });

    // Initial setup
    resizeGrid();
});
