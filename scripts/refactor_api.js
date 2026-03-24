const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../functions/api');

function getDepth(filePath) {
    const relPath = path.relative(apiDir, filePath);
    const parts = relPath.split(path.sep);
    return Math.max(0, parts.length - 1); // 0 means directly in api/, 1 means in api/subfolder/
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const depth = getDepth(filePath);
    const utilsPath = depth === 0 ? '../utils/response' : '../../utils/response';
    
    // We need to import the helpers if they are used
    let needsImport = false;
    let imports = new Set();

    // Replace: new Response(JSON.stringify({...success: false, error: ...}), { status: xxx, headers: {...} })
    // With: errorResponse(..., xxx)
    content = content.replace(/return\s+new\s+Response\s*\(\s*JSON\.stringify\s*\(\s*\{\s*(success:\s*false\s*,\s*)?error:\s*(.+?)\s*\}\s*\)\s*,\s*\{\s*status:\s*(\d+)\s*,\s*headers:\s*\{[^}]+\}\s*\}\s*\);/gs, (match, successFalse, errorMsg, statusStr) => {
        imports.add('errorResponse');
        return `return errorResponse(${errorMsg}, ${statusStr});`;
    });

    // Replace Response.json({ error: ... }, { status: ... })
    content = content.replace(/return\s+Response\.json\s*\(\s*\{\s*(success:\s*false\s*,\s*)?error:\s*(.+?)\s*\}\s*,\s*\{\s*status:\s*(\d+)\s*\}\s*\);/gs, (match, successFalse, errorMsg, statusStr) => {
        imports.add('errorResponse');
        return `return errorResponse(${errorMsg}, ${statusStr});`;
    });

    content = content.replace(/return\s+new\s+Response\s*\(\s*JSON\.stringify\s*\(\s*\{\s*error:\s*(.+?)\s*\}\s*\)\s*,\s*\{\s*status:\s*(\d+)\s*,\s*headers:\s*\{[^}]+\}\s*\}\s*\);/gs, (match, errorMsg, statusStr) => {
        imports.add('errorResponse');
        return `return errorResponse(${errorMsg}, ${statusStr});`;
    });

    // Replace: new Response(JSON.stringify(data), { headers: ... })
    content = content.replace(/return\s+new\s+Response\s*\(\s*JSON\.stringify\s*\(\s*(.+?)\s*\)\s*,\s*\{\s*(status:\s*\d+\s*,\s*)?headers:\s*\{[^}]+\}\s*\}\s*\);/gs, (match, dataObj, statusMatch) => {
        imports.add('jsonResponse');
        let status = 200;
        if (statusMatch) {
            const m = statusMatch.match(/\d+/);
            if (m) status = parseInt(m[0]);
        }
        if (status === 200) {
            return `return jsonResponse(${dataObj});`;
        } else {
            return `return jsonResponse(${dataObj}, ${status});`;
        }
    });

    // Replace Response.json(data) without headers
    content = content.replace(/return\s+Response\.json\s*\(\s*(.+?)\s*\)\s*;/g, (match, dataObj) => {
        if (dataObj.includes('error:')) return match; // Handled by errorResponse regex
        imports.add('jsonResponse');
        return `return jsonResponse(${dataObj});`;
    });

    // Replace OPTIONS response
    content = content.replace(/export\s+async\s+function\s+onRequestOptions\s*\([^)]*\)\s*\{\s*return\s+new\s+Response\s*\(\s*null\s*,\s*\{\s*status:\s*204\s*,\s*headers:\s*\{[^}]+\}\s*\}\s*\);\s*\}/gs, () => {
        imports.add('optionsResponse');
        return `export async function onRequestOptions() {\n    return optionsResponse();\n}`;
    });

    // Replace corsHeaders usage (for things not caught above)
    content = content.replace(/headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*,\s*"Access-Control-Allow-Origin":\s*"\*"\s*\}/gs, 'headers: { "Content-Type": "application/json", ...corsHeaders }');
    if (content.includes('...corsHeaders') && !imports.has('corsHeaders')) {
        imports.add('corsHeaders');
    }

    if (imports.size > 0 && content !== original) {
        const importImports = Array.from(imports).join(', ');
        const importLine = `import { ${importImports} } from "${utilsPath}";\n`;
        // Check if there are already imports
        if (content.includes("from '../../utils/") || content.includes("from '../utils/")) {
            // we will just prepend it to the top
            content = importLine + content;
        } else {
            content = importLine + content;
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
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
