import { Component, OnInit } from '@angular/core';
import { KEYBOARD_SHORTCUTS } from 'src/app/models';

@Component({
    selector: 'swt-hints',
    templateUrl: './hints.component.html',
    styleUrls: [ './hints.component.scss' ]
})
export class HintsComponent implements OnInit {
    keyboardShortcuts = KEYBOARD_SHORTCUTS;

    constructor() { }

    ngOnInit(): void {
    }

}
