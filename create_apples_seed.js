const fs = require('fs');
const crypto = require('crypto');

// Re-pasting original TSV data block to avoid formatting glitches with escaped tabs `\t`.
const rawTsv = fs.readFileSync('apples_original.tsv', 'utf-8');

const tsvData = rawTsv.trim();
const lines = tsvData.split('\n');
const statements = [];

const sqlEscape = (str) => {
    if (!str) return '';
    return str.replace(/'/g, "''").replace(/\r/g, '').replace(/\n/g, ' ');
};

for (const line of lines) {
    const parts = line.split('\t');

    // Skip empty lines or header row ("品番")
    if (parts.length < 13 || parts[0] === '品番') continue;

    // UUID mapped to avoid collisions
    const id = crypto.randomUUID();
    const name_ja = sqlEscape(parts[1]).trim();
    const name_en = sqlEscape(parts[3]).trim();
    const name_zh = sqlEscape(parts[4]).trim();
    const harvest_season = sqlEscape(parts[5]).trim();
    const lineage = sqlEscape(parts[6]).trim();
    const origin = sqlEscape(parts[7]).trim();
    const image = sqlEscape(parts[8]?.trim() || parts[9]?.trim() || '');
    const harvest_category = sqlEscape(parts[12]).trim();
    const summary = sqlEscape(parts[13]).trim();
    const desc = sqlEscape(parts[14]).trim();

    // Prevent inserting empty names just in case
    if (!name_ja) continue;

    statements.push(`  ('${id}', '${name_ja}', '${name_en}', '${name_zh}', '${harvest_season}', '${harvest_category}', '${lineage}', '${origin}', '${image}', '', '${summary}', '${desc}')`);
}

if (statements.length > 0) {
    const sql = "INSERT INTO apple_varieties (id, name_ja, name_en, name_zh, harvest_season, harvest_category, lineage, origin, official_image_url, yokai_card_url, summary, description) VALUES \n" + statements.join(",\n") + ";\n";
    fs.writeFileSync('apples_seed.sql', sql);
    console.log("Seed SQL written to apples_seed.sql with " + statements.length + " inserts.");
} else {
    console.log("No valid rows found to insert. Lines:", lines.length);
}
