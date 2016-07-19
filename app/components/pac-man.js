import Ember from 'ember';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, {
  didInsertElement() {
    this.drawGrid();
    this.drawPac();
  },

  ctx: Ember.computed(function() {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    return ctx;
  }),
  x: 1,
  y: 2,
  squareSize: 40,
  screenWidth: Ember.computed(function() {
    return this.get('grid.firstObject.length');
  }),
  screenHeight: Ember.computed(function() {
    return this.get('grid.length');
  }),
  screenPixelWidth: Ember.computed(function() {
    return this.get('screenWidth') * this.get('squareSize');
  }),
  screenPixelHeight: Ember.computed(function() {
    return this.get('screenHeight') * this.get('squareSize');
  }),
  // 0 is a blank space
  // 1 is a wall
  // 2 is a pellet
  grid: [
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
  ],
  directions: {
    'up': { x: 0, y: -1 },
    'down': { x: 0, y: 1 },
    'left': { x: -1, y: 0 },
    'right': { x: 1, y: 0 },
    'stopped': { x: 0, y: 0 }
  },
  score: 0,
  levelNumber: 1,

  drawCircle(x, y, radiusDivisor) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    let pixelX = (x + 1/2) * squareSize;
    let pixelY = (y + 1/2) * squareSize;

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(pixelX, pixelY, squareSize / radiusDivisor, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
  },

  drawPac() {
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;

    this.drawCircle(x, y, radiusDivisor);
  },

  drawWall(x, y) {
    let ctx = this.get('ctx');
    let squareSize = this.get('squareSize');

    ctx.fillStyle = '#000';
    ctx.fillRect(x * squareSize,
                 y * squareSize,
                 squareSize,
                 squareSize);
  },

  drawPellet(x, y) {
    let radiusDivisor = 6;

    this.drawCircle(x, y, radiusDivisor);
  },

  drawGrid() {
    let grid = this.get('grid');

    // FAT ARROWS Y'ALL
    grid.forEach((row, rowIndex)=> {
      row.forEach((cell, columnIndex)=> {
        if(cell === 1){
          this.drawWall(columnIndex, rowIndex);
        }
        if(cell === 2){
          this.drawPellet(columnIndex, rowIndex);
        }
      });
    });
  },

  clearScreen() {
    let ctx = this.get('ctx');

    ctx.clearRect(0, 0, this.get('screenPixelWidth'), this.get('screenPixelHeight'));
  },

  // collidedWithBorder() {
  //   let x = this.get('x');
  //   let y = this.get('y');
  //   let screenWidth = this.get('screenWidth');
  //   let screenHeight = this.get('screenHeight');
  //
  //   let pacOutOfBounds = x < 0 ||
  //                        y < 0 ||
  //                        x >= screenWidth ||
  //                        y >= screenHeight;
  //
  //   return pacOutOfBounds;
  // },
  //
  // collidedWithWall() {
  //   let x = this.get('x');
  //   let y = this.get('y');
  //   let grid = this.get('grid');
  //
  //   return grid[y][x] === 1;
  // },

  pathBlockedInDirection(direction) {
    let cellTypeInDirection = this.cellTypeInDirection(direction)
    return Ember.isEmpty(cellTypeInDirection) || cellTypeInDirection === 1;
  },

  cellTypeInDirection(direction) {
    let nextX = this.nextCoordinate('x', direction);
    let nextY = this.nextCoordinate('y', direction);

    return this.get(`grid.${nextY}.${nextX}`);
  },

  nextCoordinate(coordinate, direction) {
    return this.get(coordinate) + this.get(`directions.${direction}.${coordinate}`);
  },

  processAnyPellets() {
    let x = this.get('x');
    let y = this.get('y');
    let grid = this.get('grid');

    if(grid[y][x] === 2){
      grid[y][x] = 0;
      this.incrementProperty('score');

      if(this.levelComplete()) {
        this.incrementProperty('levelNumber');
        this.restartLevel();
      }
    }
  },

  movePacMan(direction) {
    if(!this.pathBlockedInDirection(direction)) {
      this.set('x', this.nextCoordinate('x', direction));
      this.set('y', this.nextCoordinate('y', direction));

      this.processAnyPellets();
    }

    this.clearScreen();
    this.drawGrid();
    this.drawPac();
  },

  levelComplete() {
    let hasPelletsLeft = false;
    let grid = this.get('grid');

    grid.forEach((row)=> {
      row.forEach((cell)=> {
        if(cell === 2){
          hasPelletsLeft = true;
        }
      });
    });
    return !hasPelletsLeft;
  },

  restartLevel() {
    this.set('x', 0);
    this.set('y', 0);

    let grid = this.get('grid');

    grid.forEach((row, rowIndex)=> {
      row.forEach((cell, columnIndex)=> {
        if(cell === 0) {
          grid[rowIndex][columnIndex] = 2;
        }
      });
    });
  },

  keyboardShortcuts: {
    up() { this.movePacMan('up');},
    down() { this.movePacMan('down');},
    left() { this.movePacMan('left');},
    right() { this.movePacMan('right');},
  },
});
