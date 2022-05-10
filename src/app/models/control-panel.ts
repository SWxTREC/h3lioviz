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
        defaultColorRange: [ 300, 900 ],
        defaultColormap: COLORMAPS.plasma,
        defaultSubsetRange: [ 600, 900 ],
        entireRange: [ 200, 1600 ],
        step: 50
    },
    density: {
        serverName: 'density',
        displayName: 'Density',
        units: 'r<sup>2</sup>N/cm<sup>3</sup>',
        defaultColorRange: [ 0, 30 ],
        defaultColormap: COLORMAPS.viridis,
        defaultSubsetRange: [ 15, 30 ],
        entireRange: [ 0, 60 ],
        step: 1
    },
    pressure: {
        serverName: 'pressure',
        displayName: 'Ram pressure',
        units: 'r<sup>2</sup>N/cm<sup>3</sup> * km<sup>2</sup>/s<sup>2</sup>',
        defaultColorRange: [ 100000, 2500000 ],
        defaultColormap: COLORMAPS.viridis,
        defaultSubsetRange: [ 500000, 10000000 ],
        entireRange: [ 100000, 10000000 ],
        step: 10000
    },
    temperature: {
        serverName: 'temperature',
        displayName: 'Temperature',
        units: 'K',
        defaultColorRange: [ 10000, 200000 ],
        defaultColormap: COLORMAPS.inferno,
        defaultSubsetRange: [ 500000, 1000000 ],
        entireRange: [ 10000, 1000000 ],
        step: 10000
    },
    b: {
        serverName: 'b',
        displayName: 'B',
        units: 'nT',
        defaultColorRange: [ -30, 30 ],
        defaultColormap: COLORMAPS.coolToWarm,
        defaultSubsetRange: [ -30, 0 ],
        entireRange: [ -100, 100 ],
        step: 5
    },
    bx: {
        serverName: 'bx',
        displayName: 'Bx',
        units: 'nT',
        defaultColorRange: [ -30, 30 ],
        defaultColormap: COLORMAPS.coolToWarm,
        defaultSubsetRange: [ -30, 0 ],
        entireRange: [ -100, 100 ],
        step: 5
    },
    by: {
        serverName: 'by',
        displayName: 'By',
        units: 'nT',
        defaultColorRange: [ -30, 30 ],
        defaultColormap: COLORMAPS.coolToWarm,
        defaultSubsetRange: [ -30, 0 ],
        entireRange: [ -100, 100 ],
        step: 5
    },
    bz: {
        serverName: 'bz',
        displayName: 'Bz',
        units: 'nT',
        defaultColorRange: [ -30, 30 ],
        defaultColormap: COLORMAPS.coolToWarm,
        defaultSubsetRange: [ -30, 0 ],
        entireRange: [ -100, 100 ],
        step: 5
    }
};

export const CONTROL_PANEL_DEFAULT_VALUES = {
    colorVariable: VARIABLE_CONFIG.velocity,
    colormap: VARIABLE_CONFIG.velocity.defaultColormap,
    contourVariable: VARIABLE_CONFIG.velocity,
    cme: false,
    cmeContours: false,
    latSlice: true,
    lonSlice: false,
    lonStreamlines: false,
    numberOfContours: 3,
    opacity: [ 70, 100 ] as [ number, number ],
    satellites: true,
    threshold: false,
    thresholdVariable: VARIABLE_CONFIG.density
};

export const INITIAL_TICK_STEP =
    ( CONTROL_PANEL_DEFAULT_VALUES.contourVariable.defaultSubsetRange[1] - CONTROL_PANEL_DEFAULT_VALUES.contourVariable.defaultSubsetRange[0]) /
    (  CONTROL_PANEL_DEFAULT_VALUES.numberOfContours - 1 );
