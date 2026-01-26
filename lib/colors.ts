export function getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate luminance
    // Formula: 0.299*R + 0.587*G + 0.114*B
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // Return black for light backgrounds and white for dark backgrounds
    // Threshold of 128 is standard, can be tweaked
    return (yiq >= 128) ? '#000000' : '#ffffff';
}
