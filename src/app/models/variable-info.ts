import { IColormapInfo } from './control-panel';

export interface IVariableInfo {
    serverName: string;
    displayName: string;
    units: string;
    defaultColorRange: [ number, number ];
    defaultColormap: IColormapInfo;
    defaultContourValue: number;
    entireRange: [ number, number ];
    step: number;
}

export interface IKeyboard {
    action: string;
    icon: string;
    instruction: string;
}

export const KEYBOARD_SHORTCUTS: IKeyboard[] = [
    {
        action: 'Rotate around the Sun',
        icon: 'cached',
        instruction: 'shift+left-click'
    },
    {
        action: 'Pan in plane',
        icon: 'open_with',
        instruction: 'shift+right-click'
    },
    {
        action: 'Zoom',
        icon: 'search',
        instruction: 'ctrl+right-click'
    }
];
