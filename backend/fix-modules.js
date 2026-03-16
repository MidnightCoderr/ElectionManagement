const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace import { x, y } from 'y'
            content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];?/g, (match, vars, mod) => {
                modified = true;
                return `const { ${vars} } = require('${mod}');`;
            });

            // Replace import x from 'y'
            content = content.replace(/import\s+([a-zA-Z0-9_]+)\s+from\s+['"]([^'"]+)['"];?/g, (match, varName, mod) => {
                modified = true;
                return `const ${varName} = require('${mod}');`;
            });

            // Replace export default x
            content = content.replace(/export\s+default\s+([a-zA-Z0-9_]+);?/g, (match, varName) => {
                modified = true;
                return `module.exports = ${varName};`;
            });

            // Replace export const x = ...
            content = content.replace(/export\s+const\s+([a-zA-Z0-9_]+)/g, (match, varName) => {
                modified = true;
                return `exports.${varName}`;
            });

            if (modified) {
                console.log('Fixed', fullPath);
                fs.writeFileSync(fullPath, content);
            }
        }
    });
}
processDir('./src');
