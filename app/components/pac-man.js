import Ember from 'ember';
import SharedStuff from '../mixins/shared-stuff';
import Movement from '../mixins/movement';
import Pac from '../models/pac';
import Ghost from '../models/ghost';
import Level from '../models/level';
import Level2 from '../models/level2';
import KeyboardShortcuts from 'ember-keyboard-shortcuts/mixins/component';

export default Ember.Component.extend(KeyboardShortcuts, SharedStuff, Movement, {
  didInsertElement() {
    let level = Level2.create();
    this.set('level', level);

    let pac = Pac.create({
      level: level,
      x: level.get('startingPac.x'),
      y: level.get('startingPac.y')
    });
    this.set('pac', pac);

    let ghosts = level.get('startingGhosts').map((startingPosition) => {
      return Ghost.create({
        level: level,
        x: startingPosition.x,
        y: startingPosition.y,
        pac: pac
      });
    });

    // let ghost1 = Ghost.create({
    //   level: level,
    //   x: 0,
    //   y: 0,
    //   pac: pac,
    // });
    // let ghost2 = Ghost.create({
    //   level: level,
    //   x: 5,
    //   y: 0,
    //   pac: pac,
    // });
    //
    // let ghosts = [ghost1, ghost2];
    this.set('ghosts', ghosts);

    this.loop();
  },

  score: 0,
  levelNumber: 1,
  lives: 3,

  drawWall(x, y) {
    let ctx = this.get('ctx');
    let squareSize = this.get('level.squareSize');

    ctx.fillStyle = '#000';
    ctx.fillRect(x * squareSize,
                 y * squareSize,
                 squareSize,
                 squareSize);
  },

  drawPellet(x, y) {
    let radiusDivisor = 6;

    this.drawCircle(x, y, radiusDivisor, 'stopped');
  },

  drawGrid() {
    let grid = this.get('level.grid');

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

    ctx.clearRect(0, 0, this.get('level.pixelWidth'), this.get('level.pixelHeight'));
  },

  processAnyPellets() {
    let x = this.get('pac.x');
    let y = this.get('pac.y');
    let grid = this.get('level.grid');

    if(grid[y][x] === 2){
      grid[y][x] = 0;
      this.incrementProperty('score');

      if(this.get('level').isComplete()) {
        this.incrementProperty('levelNumber');
        this.get('level').restart();
        this.restart();
      }
    }
  },

  collidedWithGhosts() {
    return this.get('ghosts').any((ghost) => {
      return ghost.x === this.get('pac.x') &&
             ghost.y === this.get('pac.y');
    });
  },

  loop() {
    this.get('pac').move();
    this.get('ghosts').forEach((ghost) => { ghost.move(); });

    this.processAnyPellets();

    this.clearScreen();
    this.drawGrid();

    this.get('pac').draw();
    this.get('ghosts').forEach((ghost) => { ghost.draw(); });

    if(this.collidedWithGhosts()) {
      this.decrementProperty('lives');
      this.restart();
    }

    Ember.run.later(this, this.loop, 1000/60);
  },

  restart() {
    if(this.get('lives') <= 0) {
      this.set('lives', 3);
      this.set('score', 0);
      this.set('levelNumber', 1);
      this.get('level').restart();
    }
    this.get('pac').restart();
    this.get('ghosts').forEach((ghost) => { ghost.restart(); });
  },

  keyboardShortcuts: {
    up() { this.set('pac.intent', 'up');},
    down() { this.set('pac.intent', 'down');},
    left() { this.set('pac.intent', 'left');},
    right() { this.set('pac.intent', 'right');},
  },
});
