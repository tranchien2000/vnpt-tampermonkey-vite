import { themeStyles } from './theme.js';
import { panelStyles } from './panel.js';
import { fieldsStyles } from './fields.js';
import { controlStyles } from './controls.js';
import { calculatorStyles } from './calculator.js';
import { scannerStyles } from './scanner.js';
import { linkerStyles } from './linker.js';
import { templateStyles } from './template.js';

export const allStyles = `
    ${themeStyles}
    ${panelStyles}
    ${fieldsStyles}
    ${controlStyles}
    ${calculatorStyles}
    ${scannerStyles}
    ${linkerStyles}
    ${templateStyles}
`;

export function injectStyles() {
    const styleId = 'vnpt-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = allStyles;
    document.head.appendChild(style);
}
