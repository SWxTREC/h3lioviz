/* eslint-disable @typescript-eslint/naming-convention */
export interface IModelMetadata {
    boundary: string;
    boundary_old: string;
    case: string;
    cmedata: string;
    cme_cone_half_angle: string;
    cme_latitude: string;
    cme_longitude: string;
    cme_radial_velocity: string;
    cme_time: string;
    code: string;
    cordata: string;
    corona: string;
    creation: string;
    crlon: string;
    crnum: string;
    fitted_by: string;
    gamma: string;
    geometry: string;
    grid: string;
    grid_old: string;
    initial: string;
    initial_old: string;
    institute: string;
    mevo: number;
    mfld: number;
    model: string;
    mslc1: number;
    mslc2: number;
    mtim: number;
    nshift: number;
    obsdate_cal: string;
    obsdate_mjd: number;
    observatory: string;
    parameters: string;
    parameters_old: string;
    program: string;
    project: string;
    rbnd: number;
    resrun: string;
    rotation: string;
    run: string;
    run_id: string;
    rundate_cal: string;
    rundate_mjd: number;
    shift_deg: number;
    title: string;
    type: string;
    version: string;
    xalpha: number;
    resolution?: string;
}

export interface ICmeMetadata {
    time: string;
    latitude: string;
    longitude: string;
    radialVelocity: string;
    coneHalfAngle: string;
}
