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
        displayName: 'Speed',
        units: 'km/s',
        defaultColorRange: [ 300, 900 ],
        defaultColormap: COLORMAPS.rainbow,
        defaultSubsetRange: [ 300, 900 ],
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
        defaultColormap: COLORMAPS.plasma,
        defaultSubsetRange: [ 500000, 10000000 ],
        entireRange: [ 100000, 10000000 ],
        step: 3000
    },
    temperature: {
        serverName: 'temperature',
        displayName: 'Temperature',
        units: 'K',
        defaultColorRange: [ 10000, 200000 ],
        defaultColormap: COLORMAPS.inferno,
        defaultSubsetRange: [ 500000, 1000000 ],
        entireRange: [ 10000, 1000000 ],
        step: 3000
    },
    b: {
        serverName: 'b',
        displayName: 'Br',
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
        displayName: 'CME tracer',
        units: '—',
        defaultColorRange: [ 0.001, 0.05 ],
        defaultColormap: COLORMAPS.divergent,
        defaultSubsetRange: [ 0.001, 0.05 ],
        entireRange: [ 0, 0.1 ],
        step: 0.001
    }
};

export const MODEL_VARIABLES = [
    VARIABLE_CONFIG.velocity,
    VARIABLE_CONFIG.density,
    VARIABLE_CONFIG.temperature,
    VARIABLE_CONFIG.pressure,
    VARIABLE_CONFIG.b
];
export const FOCUS_VARIABLES = [ VARIABLE_CONFIG.velocity, VARIABLE_CONFIG.density ];
export const ADDITIONAL_VARIABLES = [
    VARIABLE_CONFIG.temperature,
    VARIABLE_CONFIG.pressure,
    VARIABLE_CONFIG.dp,
    VARIABLE_CONFIG.b,
    VARIABLE_CONFIG.bx,
    VARIABLE_CONFIG.by,
    VARIABLE_CONFIG.bz
];

export interface IColorSettings {
    colorVariable: IVariableInfo;
    colormap: IColormapInfo;
    opacity: [ number, number ];
}

export const COLOR_FORM_DEFAULT_VALUES: IColorSettings = {
    colorVariable: VARIABLE_CONFIG.velocity,
    colormap: VARIABLE_CONFIG.velocity.defaultColormap,
    opacity: [ 60, 90 ] as [ number, number ]
};

export const DEFAULT_COLORMAPS: { [parameter: string]: IColormapInfo }  =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = VARIABLE_CONFIG[variable].defaultColormap;
        return aggregator;
    }, {});

export const DEFAULT_COLOR_RANGES: { [parameter: string]: [ number, number ] } =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = VARIABLE_CONFIG[variable].defaultColorRange;
        return aggregator;
    }, {});

export interface IControlPanel {
    colors: boolean;
    contours: boolean;
    features?: boolean;
    slices?: boolean;
    layers?: boolean;
}

export const DEFAULT_CONTROL_PANEL_EXPANSIONS = {
    colors: true,
    contours: false,
    features: false,
    slices: true
};

export const DEFAULT_OPACITIES: { [parameter: string]: [ number, number ] } =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = COLOR_FORM_DEFAULT_VALUES.opacity;
        return aggregator;
    }, {});

export interface IContourSettings {
    cmeContours?: boolean; // deprecated
    contourVariable: IVariableInfo;
    numberOfContours: number;
    contourArea?: 'cme' | 'all'; // deprecated
    threshold: boolean;
}

export const CONTOUR_FORM_DEFAULT_VALUES: IContourSettings = {
    threshold: false,
    contourVariable: VARIABLE_CONFIG.density,
    numberOfContours: 5
};

export const DEFAULT_CONTOUR_RANGES: { [parameter: string]: [ number, number ] } =
    Object.keys(VARIABLE_CONFIG).reduce( (aggregator, variable) => {
        aggregator[variable] = VARIABLE_CONFIG[variable].defaultSubsetRange;
        return aggregator;
    }, {});

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

export const SLICES = [
    'cme',
    'latSlice',
    'lonSlice',
    'lonSliceType',
    'radialSlice'
];

export const FEATURES = [
    'lonStreamlines',
    'satellites',
    'satFieldlines'
];

export const LAYER_FORM_DEFAULT_VALUES: ILayers = {
    cme: false,
    latSlice: true,
    lonSlice: true,
    lonSliceType: 'ecliptic',
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

