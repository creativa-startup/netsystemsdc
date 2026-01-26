declare module 'react-color' {
    export const ChromePicker: any;
    export const SketchPicker: any;
    export interface ColorResult {
        hex: string;
        rgb: { r: number; g: number; b: number; a: number };
        hsl: { h: number; s: number; l: number; a: number };
    }
}
