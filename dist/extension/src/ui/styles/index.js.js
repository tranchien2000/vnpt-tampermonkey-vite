import { themeStyles } from "/src/ui/styles/theme.js.js";
import { panelStyles } from "/src/ui/styles/panel.js.js";
import { fieldsStyles } from "/src/ui/styles/fields.js.js";
import { controlStyles } from "/src/ui/styles/controls.js.js";
import { calculatorStyles } from "/src/ui/styles/calculator.js.js";
import { scannerStyles } from "/src/ui/styles/scanner.js.js";
import { linkerStyles } from "/src/ui/styles/linker.js.js";

export const allStyles = `
    ${themeStyles}
    ${panelStyles}
    ${fieldsStyles}
    ${controlStyles}
    ${calculatorStyles}
    ${scannerStyles}
    ${linkerStyles}
`;

export function injectStyles() {
    const styleId = 'vnpt-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = allStyles;
    document.head.appendChild(style);
}
