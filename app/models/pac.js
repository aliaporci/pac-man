import Ember from 'ember';
import SharedStuff from '../mixins/shared-stuff';
import Movement from '../mixins/movement';

export default Ember.Object.extend(SharedStuff, Movement, {
  direction: 'down',
  intent: 'down',

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

  restart() {
    this.set('x', this.get('level.startingPac.x'));
    this.set('y', this.get('level.startingPac.y'));
    this.set('frameCycle', 0);
    this.set('direction', 'stopped');
  },
});
