import { IVariableInfo } from '.';

// serverName must match an option on the server
export const COLORMAPS = {
    coolToWarm: {
        displayName: 'Cool to warm',
        imgSrc: 'assets/images/cool_to_warm.png',
        serverName: 'Cool to Warm'
    },
    inferno: {
        displayName: 'Inferno',
        imgSrc: 'assets/images/inferno.png',
        serverName: 'Inferno (matplotlib)'
    },
    plasma: {
        displayName: 'Plasma',
        imgSrc: 'assets/images/plasma.png',
        serverName: 'Plasma (matplotlib)'
    },
    viridis: {
        displayName: 'Viridis',
        imgSrc: 'assets/images/viridis.png',
        serverName: 'Viridis (matplotlib)'
    },
    divergent: {
        displayName: 'Divergent',
        imgSrc: 'assets/images/blue_orange.png',
        serverName: 'Blue Orange (divergent)'
    },
    rainbow: {
        displayName: 'Rainbow',
        imgSrc: 'assets/images/nic_cubicl.png',
        serverName: 'nic_CubicL'
    }
};

// TODO: set these in the server on load
export const VARIABLE_CONFIG: { [param: string]: IVariableInfo } = {
    velocity: {
        serverName: 'velocity',
        displayName: 'Velocity',
        units: 'km/s',
        colorRange: [ 300, 900 ],
        defaultColormap: COLORMAPS.plasma,
        thresholdRange: [ 600, 900 ],
        step: 50
    },
    density: {
        serverName: 'density',
        displayName: 'Density',
        units: 'r<sup>2</sup>N/cm<sup>3</sup>',
        colorRange: [ 0, 30 ],
        defaultColormap: COLORMAPS.viridis,
        thresholdRange: [ 15, 30 ],
        step: 1
    },
    pressure: {
        serverName: 'pressure',
        displayName: 'Ram pressure',
        units: 'r<sup>2</sup>N/cm<sup>3</sup> * km<sup>2</sup>/s<sup>2</sup>',
        colorRange: [ 100000, 10000000 ],
        defaultColormap: COLORMAPS.viridis,
        thresholdRange: [ 500000, 10000000 ],
        step: 10000
    },
    temperature: {
        serverName: 'temperature',
        displayName: 'Temperature',
        units: 'K',
        colorRange: [ 10000, 1000000 ],
        defaultColormap: COLORMAPS.inferno,
        thresholdRange: [ 500000, 1000000 ],
        step: 10000
    },
    b: {
        serverName: 'b',
        displayName: 'B',
        units: 'nT',
        colorRange: [ -100, 100 ],
        defaultColormap: COLORMAPS.coolToWarm,
        thresholdRange: [ -50, 0 ],
        step: 5
    },
    bx: {
        serverName: 'bx',
        displayName: 'Bx',
        units: 'nT',
        colorRange: [ -100, 100 ],
        defaultColormap: COLORMAPS.coolToWarm,
        thresholdRange: [ -50, 0 ],
        step: 5
    },
    by: {
        serverName: 'by',
        displayName: 'By',
        units: 'nT',
        colorRange: [ -100, 100 ],
        defaultColormap: COLORMAPS.coolToWarm,
        thresholdRange: [ -50, 0 ],
        step: 5
    },
    bz: {
        serverName: 'bz',
        displayName: 'Bz',
        units: 'nT',
        colorRange: [ -100, 100 ],
        defaultColormap: COLORMAPS.coolToWarm,
        thresholdRange: [ -50, 0 ],
        step: 5
    }
};

export const CONTROL_PANEL_DEFAULT_VALUES = {
    colorVariable: VARIABLE_CONFIG.velocity,
    colormap: VARIABLE_CONFIG.velocity.defaultColormap,
    cme: true,
    latSlice: true,
    lonArrows: false,
    lonSlice: true,
    lonStreamlines: false,
    opacity: [ 70, 100 ] as [ number, number ],
    threshold: false,
    thresholdVariable: VARIABLE_CONFIG.density
};
