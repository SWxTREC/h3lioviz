import { IVariableInfo } from '.';

export interface IColormapInfo {
    displayName: string;
    imgSrc: string;
    serverName: string;
}

// serverName must match an option on the server
export const COLORMAPS: { [param: string]: IColormapInfo } = {
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
    },
    dp: {
        serverName: 'dp',
        displayName: 'Cloud tracer',
        units: '—',
        defaultColorRange: [ 0.2, 0.9 ],
        defaultColormap: COLORMAPS.plasma,
        defaultSubsetRange: [ 0.2, 0.9 ],
        entireRange: [ 0, 1 ],
        step: 0.1
    }
};

export interface IColorSettings {
    colorVariable: IVariableInfo;
    colormap: IColormapInfo;
    opacity: [ number, number ];
}

export const COLOR_FORM_DEFAULT_VALUES: IColorSettings = {
    colorVariable: VARIABLE_CONFIG.density,
    colormap: VARIABLE_CONFIG.density.defaultColormap,
    opacity: [ 60, 80 ] as [ number, number ]
};

export interface IContourSettings {
    cmeContours: boolean;
    contourVariable: IVariableInfo;
    numberOfContours: number;
    contourArea: 'cme' | 'all';
}

export const CONTOUR_FORM_DEFAULT_VALUES: IContourSettings = {
    cmeContours: true,
    contourVariable: VARIABLE_CONFIG.density,
    numberOfContours: 3,
    contourArea: 'cme'
};

export interface ILayers {
    cme: boolean;
    latSlice: boolean;
    lonSlice: boolean;
    lonSliceType: 'solar-equator' | 'ecliptic';
    lonStreamlines: boolean;
    radialSlice: boolean;
    satellites: boolean;
    satFieldlines: boolean;
}

export const LAYER_FORM_DEFAULT_VALUES: ILayers = {
    cme: false,
    latSlice: true,
    lonSlice: false,
    lonSliceType: 'solar-equator',
    lonStreamlines: false,
    radialSlice: false,
    satellites: true,
    satFieldlines: false
};

export const INITIAL_TICK_STEP =
    // the difference between the high value and the low value, divided by numberOfContours - 1
    ( CONTOUR_FORM_DEFAULT_VALUES.contourVariable.defaultSubsetRange[1] -
        CONTOUR_FORM_DEFAULT_VALUES.contourVariable.defaultSubsetRange[0]) /
    ( CONTOUR_FORM_DEFAULT_VALUES.numberOfContours - 1 );

