import { Component, OnInit } from '@angular/core';
import { IKeyboard, KEYBOARD_SHORTCUTS } from 'src/app/models';

@Component({
    selector: 'swt-docs',
    templateUrl: './docs.component.html',
    styleUrls: [ './docs.component.scss' ]
})
export class DocsComponent implements OnInit {
    keyboardShortcuts: IKeyboard[] = KEYBOARD_SHORTCUTS;

    constructor() { }

    ngOnInit() {
    }

}
