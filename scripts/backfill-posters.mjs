import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const dataFile = path.join(ROOT, ".data", "climbs.json");
const climbs = JSON.parse(readFileSync(dataFile, "utf8"));

function posterKeyFromVideoKey(videoKey) {
  const dot = videoKey.lastIndexOf(".");
  const withoutExt = dot > 0 ? videoKey.slice(0, dot) : videoKey;
  return `${withoutExt}.jpg`;
}

function sqlStr(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const updates = [];

for (const climb of climbs) {
  if (String(climb.id).startsWith("demo-") || String(climb.videoKey).startsWith("demo/")) {
    continue;
  }

  const videoPath = path.join(ROOT, ".data", "uploads", ...climb.videoKey.split("/"));
  if (!existsSync(videoPath)) {
    console.warn(`skip missing video ${climb.videoKey}`);
    continue;
  }

  const posterKey = posterKeyFromVideoKey(climb.videoKey);
  const posterPath = path.join(ROOT, ".data", "uploads", ...posterKey.split("/"));
  mkdirSync(path.dirname(posterPath), { recursive: true });

  console.log(`poster ${posterKey}`);
  execFileSync(
    "ffmpeg",
    ["-y", "-ss", "0.12", "-i", videoPath, "-frames:v", "1", "-vf", "scale=1280:-2:force_original_aspect_ratio=decrease", "-q:v", "4", posterPath],
    { stdio: "inherit" },
  );

  climb.posterKey = posterKey;
  updates.push(climb);

  execSync(
    `npx wrangler r2 object put "cyc-afterhours/${posterKey}" --file="${posterPath}" --content-type="image/jpeg" --remote`,
    { stdio: "inherit", cwd: ROOT, shell: true },
  );
}

writeFileSync(dataFile, `${JSON.stringify(climbs, null, 2)}\n`, "utf8");

if (updates.length > 0) {
  const sql = updates
    .map(
      (climb) =>
        `UPDATE climbs SET poster_key = ${sqlStr(climb.posterKey)} WHERE id = ${sqlStr(climb.id)};`,
    )
    .join("\n");
  const sqlPath = path.join(ROOT, ".data", "backfill-posters.sql");
  writeFileSync(sqlPath, `${sql}\n`, "utf8");
  execSync(`npx wrangler d1 execute cyc-afterhours --remote --file="${sqlPath}"`, {
    stdio: "inherit",
    cwd: ROOT,
    shell: true,
  });
}

console.log(`Done. ${updates.length} posters.`);
