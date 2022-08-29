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

export const COLOR_MENU_DEFAULT_VALUES = {
    colorVariable: VARIABLE_CONFIG.velocity,
    colormap: VARIABLE_CONFIG.velocity.defaultColormap,
    opacity: [ 60, 80 ] as [ number, number ]
};

export const LAYER_MENU_DEFAULT_VALUES = {
    contourArea: 'cme',
    contourVariable: VARIABLE_CONFIG.velocity,
    cme: false,
    cmeContours: false,
    latSlice: true,
    lonSlice: false,
    lonSliceType: 'Solar-equator',
    lonStreamlines: false,
    numberOfContours: 3,
    radialSlice: false,
    satellites: true,
    satFieldlines: false
};

export const INITIAL_TICK_STEP =
    // the difference between the high value and the low value, divided by numberOfContours - 1
    ( LAYER_MENU_DEFAULT_VALUES.contourVariable.defaultSubsetRange[1] -
        LAYER_MENU_DEFAULT_VALUES.contourVariable.defaultSubsetRange[0]) /
    ( LAYER_MENU_DEFAULT_VALUES.numberOfContours - 1 );

export const IMAGE_DATASETS = {
    sdo_aia_0094_image_files: {
        id: 'sdo_aia_0094_image_files',
        displayName: 'SDO AIA 094 (green)'
    },
    sdo_aia_0094_0335_0193_image_files: {
        id: 'sdo_aia_0094_0335_0193_image_file',
        displayName: 'SDO AIA 094, 335, 193 composite'
    },
    sdo_aia_0131_image_files: {
        id: 'sdo_aia_0131_image_files',
        displayName: 'SDO AIA 131 (teal)'
    },
    sdo_aia_0171_image_files: {
        id: 'sdo_aia_0171_image_files',
        displayName: 'SDO AIA 171 (gold)'
    },
    sdo_aia_0193_image_files: {
        id: 'sdo_aia_0193_image_files',
        displayName: 'SDO AIA 193 (bronze)'
    },
    sdo_aia_0211_image_files: {
        id: 'sdo_aia_0211_image_files',
        displayName: 'SDO AIA 211 (purple)'
    },
    sdo_aia_0211_0193_0171_image_files: {
        id: 'sdo_aia_0211_0193_0171_image_files',
        displayName: 'SDO AIA 211, 193, 171 composite'
    },
    sdo_aia_0304_image_files: {
        id: 'sdo_aia_0304_image_files',
        displayName: 'SDO AIA 304 (red)'
    },
    sdo_aia_0304_0211_0171_image_files: {
        id: 'sdo_aia_0304_0211_0171_image_files',
        displayName: 'SDO AIA 304, 211, 171 composite'
    },
    sdo_aia_0335_image_files: {
        id: 'sdo_aia_0335_image_files',
        displayName: 'SDO AIA 335 (blue)'
    },
    sdo_aia_1600_image_files: {
        id: 'sdo_aia_1600_image_files',
        displayName: 'SDO AIA 1600 (yellow/green)'
    },
    sdo_aia_1700_image_files: {
        id: 'sdo_aia_1700_image_files',
        displayName: 'SDO AIA 1700 (pink)'
    },
    sdo_aia_4500_image_files: {
        id: 'sdo_aia_4500_image_files',
        displayName: 'SDO AIA 4500 (white light)'
    },
    sdo_hmib_image_files: {
        id: 'sdo_hmib_image_files',
        displayName: 'SDO HMI magnetogram'
    },
    sdo_hmibc_image_files: {
        id: 'sdo_hmibc_image_files',
        displayName: 'SDO HMI magnetogram colorized'
    },
    sdo_hmiic_image_files: {
        id: 'sdo_hmiic_image_files',
        displayName: 'SDO HMI intensitygram continuum'
    },
    sdo_hmiif_image_files: {
        id: 'sdo_hmiif_image_files',
        displayName: 'SDO HMI intensitygram flat'
    }
};
