import { Component } from '@angular/core';
import { KEYBOARD_SHORTCUTS } from 'src/app/models';

@Component({
    selector: 'swt-hints',
    templateUrl: './hints.component.html',
    styleUrls: [ './hints.component.scss' ],
    standalone: false
})
export class HintsComponent {
    keyboardShortcuts = KEYBOARD_SHORTCUTS;
}
