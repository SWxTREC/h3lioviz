import { IPlotParamsAll } from 'scicharts';

import {
    COLOR_FORM_DEFAULT_VALUES,
    CONTOUR_FORM_DEFAULT_VALUES,
    IColorSettings,
    IContourSettings,
    ILayers,
    LAYER_FORM_DEFAULT_VALUES
} from './control-panel';

export interface ISiteConfig {
    colorSettings: IColorSettings;
    contourSettings: IContourSettings;
    layers: ILayers;
    plots?: IPlotParamsAll;
}

export enum ConfigLabels {
    colorSettings = 'color-settings',
    contourSettings = 'contour-settings',
    layers = 'layers',
    plots = 'plots'
}

export const DEFAULT_SITE_CONFIG: ISiteConfig = {
    colorSettings: COLOR_FORM_DEFAULT_VALUES,
    contourSettings: CONTOUR_FORM_DEFAULT_VALUES,
    layers: LAYER_FORM_DEFAULT_VALUES
};
