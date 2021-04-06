export function registerViewConstructor(name: any, constructor: any): void;
export function listViewAPIs(): string[];
export function newAPISpecificView(name: any, initialValues?: {}): any;
export function extend(publicAPI: any, model: any, initialValues?: {}): void;
export const newInstance: any;
// declare namespace _default {
//     export { newInstance };
//     export { extend };
//     export { registerViewConstructor };
//     export { listViewAPIs };
//     export { newAPISpecificView };
// }
// export default _default;
