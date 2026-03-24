const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../functions/api');

function getDepth(filePath) {
    const relPath = path.relative(apiDir, filePath);
    const parts = relPath.split(path.sep);
    return Math.max(0, parts.length - 1);
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    const depth = getDepth(filePath);
    const utilsPath = depth === 0 ? '../utils/response' : '../../utils/response';
    
    let imports = new Set();
    if (content.match(/errorResponse/)) imports.add('errorResponse');
    if (content.match(/jsonResponse/)) imports.add('jsonResponse');
    if (content.match(/optionsResponse/)) imports.add('optionsResponse');
    if (content.match(/corsHeaders/)) imports.add('corsHeaders');

    // Replace: new Response('Unauthorized', { status: 401 }) -> errorResponse('Unauthorized', 401)
    content = content.replace(/return\s+new\s+Response\s*\(\s*(['"][^'"]+['"])\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\);/gs, (match, msg, statusStr) => {
        imports.add('errorResponse');
        return `return errorResponse(${msg}, ${statusStr});`;
    });

    // Handle syntax error accident in users/index.js: error: e.message, 500); -> errorResponse(e.message, 500);
    content = content.replace(/return\s+new\s+Response\s*\(\s*JSON\.stringify\s*\(\s*\{\s*error:\s*([^,]+),\s*(\d+)\s*\);\s*/gs, (match, msg, status) => {
        imports.add('errorResponse');
        return `return errorResponse(${msg}, ${status});\n        `;
    });
    
    // Replace: new Response(err.message, { status: 500 }) -> errorResponse(err.message, 500)
    content = content.replace(/return\s+new\s+Response\s*\(\s*([^,]+)\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\);/gs, (match, msg, statusStr) => {
        if (msg === 'null' || msg.includes('JSON.stringify')) return match;
        imports.add('errorResponse');
        return `return errorResponse(${msg}, ${statusStr});`;
    });

    // For posts.js and others with custom OPTIONS: 
    content = content.replace(/export\s+async\s+function\s+onRequestOptions[^{]+\{\s*return\s+new\s+Response[^{]+\{(.*?)\}\s*\);\s*\}/gs, () => {
        imports.add('optionsResponse');
        return `export async function onRequestOptions() {\n    return optionsResponse();\n}`;
    });

    // Inquiries index/status / Contact custom handling of OPTIONS:
    content = content.replace(/if\s*\(\s*request\.method\s*===\s*['"]OPTIONS['"]\s*\)\s*\{\s*return\s+new\s+Response[^{]+\{(.*?)\}\s*\);\s*\}/gs, () => {
        imports.add('optionsResponse');
        return `if (request.method === 'OPTIONS') {\n        return optionsResponse();\n    }`;
    });

    content = content.replace(/return\s+Response\.json\(\{\s*text:\s*([^,]+),\s*audio_url:\s*([^}]+)\s*\}\);/gs, (m, t, a) => {
        imports.add('jsonResponse');
        return `return jsonResponse({ text: ${t}, audio_url: ${a} });`;
    });
    content = content.replace(/return\s+Response\.json\(\{\s*text:\s*([^}]+)\s*\}\);/gs, (m, t) => {
        imports.add('jsonResponse');
        return `return jsonResponse({ text: ${t} });`;
    });

    // Add imports if needed
    if (imports.size > 0 && content !== original) {
        // Find existing response imports and replace or augment them
        const existingImportRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"][./]+utils\/response['"];?\n/g;
        let existingMatch;
        let combinedImports = new Set(imports);
        content = content.replace(existingImportRegex, (match, existingItems) => {
            existingItems.split(',').forEach(i => combinedImports.add(i.trim()));
            return '';
        });

        const importLine = `import { ${Array.from(combinedImports).join(', ')} } from "${utilsPath}";\n`;
        content = importLine + content;
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated leftovers: ${filePath}`);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

processDirectory(apiDir);
