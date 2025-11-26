// Tetromino definitions and logic

export const TETROMINO_TYPES = {
    I: 'I', O: 'O', T: 'T', S: 'S', Z: 'Z', J: 'J', L: 'L'
};

// Fruit emojis for each tetromino type
export const FRUIT_EMOJIS = {
    [TETROMINO_TYPES.I]: '🍌', // Banana - long and yellow like I piece
    [TETROMINO_TYPES.O]: '🍊', // Orange - round like O piece
    [TETROMINO_TYPES.T]: '🍎', // Apple - classic red, T is most common
    [TETROMINO_TYPES.S]: '🍓', // Strawberry - red and curvy
    [TETROMINO_TYPES.Z]: '🥝', // Kiwi - green and angular
    [TETROMINO_TYPES.J]: '🍇', // Grapes - purple and dangly like J
    [TETROMINO_TYPES.L]: '🍍'  // Pineapple - spiky crown like L
};

// Tetromino shapes (4x4 grid, 0 = empty, 1 = filled)
export const TETROMINO_SHAPES = {
    [TETROMINO_TYPES.I]: [
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],

    [TETROMINO_TYPES.O]: [
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ]
    ],

    [TETROMINO_TYPES.T]: [
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],

    [TETROMINO_TYPES.S]: [
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ],

    [TETROMINO_TYPES.Z]: [
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [1, 0, 0, 0]
        ]
    ],

    [TETROMINO_TYPES.J]: [
        [
            [0, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0]
        ]
    ],

    [TETROMINO_TYPES.L]: [
        [
            [0, 0, 0, 0],
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0]
        ],
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [1, 0, 0, 0]
        ],
        [
            [0, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]
        ]
    ]
};

export class Tetromino {
    constructor(type = null) {
        this.type = type || this.getRandomType();
        this.shapes = TETROMINO_SHAPES[this.type];
        this.currentRotation = 0;
        this.position = new Vector2(3, 0); // Start near center top
        this.emoji = FRUIT_EMOJIS[this.type];
        this.locked = false;
    }

    static getRandomType() {
        const types = Object.keys(TETROMINO_TYPES);
        return types[Math.floor(Math.random() * types.length)];
    }

    getRandomType() {
        return Tetromino.getRandomType();
    }

    getCurrentShape() {
        return this.shapes[this.currentRotation];
    }

    getBlocks() {
        const blocks = [];
        const shape = this.getCurrentShape();

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    blocks.push({
                        x: this.position.x + x,
                        y: this.position.y + y,
                        type: this.type,
                        emoji: this.emoji
                    });
                }
            }
        }

        return blocks;
    }

    clone() {
        const newTetromino = new Tetromino(this.type);
        newTetromino.currentRotation = this.currentRotation;
        newTetromino.position = this.position.clone();
        return newTetromino;
    }

    rotate(clockwise = true) {
        const newRotation = clockwise
            ? (this.currentRotation + 1) % this.shapes.length
            : (this.currentRotation - 1 + this.shapes.length) % this.shapes.length;

        const oldRotation = this.currentRotation;
        this.currentRotation = newRotation;

        return { oldRotation, newRotation };
    }

    move(dx, dy) {
        this.position.x += dx;
        this.position.y += dy;
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
    }

    // Wall kick data for SRS (Super Rotation System)
    getWallKickTests(fromRotation, toRotation) {
        // Simple wall kick system - try these offsets in order
        const tests = [
            { x: 0, y: 0 },   // No offset
            { x: -1, y: 0 },  // Left
            { x: 1, y: 0 },   // Right
            { x: 0, y: -1 },  // Up
            { x: -1, y: -1 }, // Left-up
            { x: 1, y: -1 }   // Right-up
        ];

        // I-piece has special wall kick rules
        if (this.type === TETROMINO_TYPES.I) {
            return [
                { x: 0, y: 0 },
                { x: -2, y: 0 },
                { x: 1, y: 0 },
                { x: -2, y: -1 },
                { x: 1, y: 2 }
            ];
        }

        return tests;
    }

    // Get the "ghost" position where the piece would land
    getGhostPosition(grid) {
        const ghost = this.clone();

        // Keep moving down until collision
        while (grid.isValidPosition(ghost.position.x, ghost.position.y + 1, ghost.getCurrentShape())) {
            ghost.position.y++;
        }

        return ghost.position;
    }

    // Get bounding box of the current shape
    getBoundingBox() {
        const shape = this.getCurrentShape();
        let minX = 4, maxX = -1, minY = 4, maxY = -1;

        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        return {
            minX, maxX, minY, maxY,
            width: maxX - minX + 1,
            height: maxY - minY + 1
        };
    }

    // Reset to spawn position
    reset() {
        this.position = new Vector2(3, 0);
        this.currentRotation = 0;
        this.locked = false;
    }
}

// Tetromino bag system for fair piece distribution
export class TetrominoBag {
    constructor() {
        this.bag = [];
        this.fillBag();
    }

    fillBag() {
        const types = Object.keys(TETROMINO_TYPES);
        this.bag = shuffleArray([...types]);
    }

    getNext() {
        if (this.bag.length === 0) {
            this.fillBag();
        }

        const type = this.bag.pop();
        return new Tetromino(type);
    }

    peek(count = 1) {
        const result = [];
        const tempBag = [...this.bag];

        for (let i = 0; i < count; i++) {
            if (tempBag.length === 0) {
                const types = Object.keys(TETROMINO_TYPES);
                tempBag.push(...shuffleArray([...types]));
            }

            const type = tempBag.pop();
            result.push(new Tetromino(type));
        }

        return result;
    }
}

// Export for ES modules (testing)
// Globals removed in favor of ESM imports
