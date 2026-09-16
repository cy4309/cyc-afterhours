import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const climbs = JSON.parse(readFileSync(path.join(ROOT, ".data", "climbs.json"), "utf8")).filter(
  (climb) => !String(climb.id).startsWith("demo-") && !String(climb.videoKey).startsWith("demo/"),
);

function sqlStr(value) {
  if (value == null || value === "") return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlNum(value) {
  if (value == null || value === "") return "NULL";
  return String(value);
}

for (const climb of climbs) {
  const file = path.join(ROOT, ".data", "uploads", ...climb.videoKey.split("/"));
  if (!existsSync(file)) {
    throw new Error(`Missing file for ${climb.id}: ${file}`);
  }

  const dest = `cyc-afterhours/${climb.videoKey}`;
  console.log(`R2 ${climb.videoKey}`);
  execSync(
    `npx wrangler r2 object put "${dest}" --file="${file}" --content-type="video/mp4" --remote`,
    { stdio: "inherit", cwd: ROOT, shell: true },
  );
}

const statements = climbs.map((climb) => {
  return `INSERT OR IGNORE INTO climbs (
  id, grade, date, gym, location, attempts, video_key, poster_key, duration, created_at, updated_at
) VALUES (
  ${sqlStr(climb.id)},
  ${sqlStr(climb.grade)},
  ${sqlStr(climb.date)},
  ${sqlStr(climb.gym)},
  ${sqlStr(climb.location)},
  ${sqlNum(climb.attempts)},
  ${sqlStr(climb.videoKey)},
  ${sqlStr(climb.posterKey)},
  ${sqlNum(climb.duration)},
  ${sqlStr(climb.createdAt)},
  ${sqlStr(climb.updatedAt)}
);`;
});

const sqlPath = path.join(ROOT, ".data", "sync-local-climbs.sql");
writeFileSync(sqlPath, `${statements.join("\n\n")}\n`, "utf8");
console.log(`D1 ${sqlPath}`);
execSync(`npx wrangler d1 execute cyc-afterhours --remote --file="${sqlPath}"`, {
  stdio: "inherit",
  cwd: ROOT,
  shell: true,
});

console.log(`Done. ${climbs.length} climbs.`);
