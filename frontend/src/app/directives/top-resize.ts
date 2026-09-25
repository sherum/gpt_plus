import { Directive, input } from '@angular/core';

/** Drag handle placed above an element; dragging up grows the target, dragging down shrinks it. */
@Directive({
  selector: '[appTopResize]',
  host: {
    class: 'resize-handle',
    role: 'separator',
    'aria-orientation': 'horizontal',
    '(pointerdown)': 'start($event)',
    '(pointermove)': 'move($event)',
    '(pointerup)': 'end($event)',
  },
})
export class TopResize {
  readonly appTopResize = input.required<HTMLElement>();

  private startY: number | null = null;
  private startHeight = 0;

  start(event: PointerEvent): void {
    event.preventDefault();
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    this.startY = event.clientY;
    this.startHeight = this.appTopResize().offsetHeight;
  }

  move(event: PointerEvent): void {
    if (this.startY === null) return;
    const target = this.appTopResize();
    target.style.flex = 'none';
    target.style.height = `${Math.max(48, this.startHeight + this.startY - event.clientY)}px`;
  }

  end(event: PointerEvent): void {
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    this.startY = null;
  }
}
