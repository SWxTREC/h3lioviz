export interface IVariableInfo {
    serverName: string;
    displayName: string;
    units: string;
    range: [number, number];
    defaultRange: [number, number];
    step: number;
}

export interface IKeyboard {
    action: string;
    instruction: string;
}

export const KEYBOARD_SHORTCUTS: IKeyboard[] = [
    {
        action: 'Rotate',
        instruction: 'shift + left-click'
    },
    {
        action: 'Pan',
        instruction: 'shift + right-click'
    },
    {
        action: 'Zoom',
        instruction: 'ctrl + left-click'
    }
];
