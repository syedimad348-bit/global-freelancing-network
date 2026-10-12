const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT = path.join(__dirname, "..", "data", "total_users");

function ensureDir() {
  fs.mkdirSync(ROOT, { recursive: true });
}

/**
 * Append registration to JSONL and regenerate total_users.xlsx (one sheet, all columns).
 * @param {{ name: string, email: string, plan?: string, degradedMode?: boolean }} row
 */
function recordRegisteredUser(row) {
  try {
    ensureDir();
    const jsonlPath = path.join(ROOT, "registry.jsonl");
    const entry = {
      name: row.name,
      email: row.email,
      plan: row.plan || "free",
      degradedMode: !!row.degradedMode,
      registeredAt: new Date().toISOString(),
    };
    fs.appendFileSync(jsonlPath, `${JSON.stringify(entry)}\n`, "utf8");

    const lines = fs
      .readFileSync(jsonlPath, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(lines);
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, path.join(ROOT, "total_users.xlsx"));
  } catch (e) {
    console.error("userRegistryExport:", e.message);
  }
}

module.exports = { recordRegisteredUser, REGISTRY_DIR: ROOT };
