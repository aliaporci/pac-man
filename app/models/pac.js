import Ember from 'ember';
import SharedStuff from '../mixins/shared-stuff';

export default Ember.Object.extend(SharedStuff, {
  direction: 'down',
  intent: 'down',

  x: 1,
  y: 2,

  draw(){
    let x = this.get('x');
    let y = this.get('y');
    let radiusDivisor = 2;

    this.drawCircle(x, y, radiusDivisor, this.get('direction'));
  },

  changeDirection() {
    let intent = this.get('intent');

    if(this.pathBlockedInDirection(intent)) {
      this.set('direction', 'stopped');
    } else {
      this.set('direction', intent);
    }
  },

  move() {
    if(this.animationCompleted()){
      this.finalizeMove();
      this.changeDirection();
    } else if(this.get('pac.direction') === 'stopped') {
      this.changeDirection();
    } else {
      this.incrementProperty('frameCycle');
    }
  },

  animationCompleted() {
    return this.get('frameCycle') === this.get('framesPerMovement');
  },

  finalizeMove() {
    let direction = this.get('direction');
    this.set('x', this.nextCoordinate('x', direction));
    this.set('y', this.nextCoordinate('y', direction));

    this.set('frameCycle', 1);
  },

  pathBlockedInDirection(direction) {
    let cellTypeInDirection = this.cellTypeInDirection(direction);
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
});