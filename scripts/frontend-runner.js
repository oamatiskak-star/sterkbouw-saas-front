import { execSync } from "child_process";

console.log("▶ SterkBouw Frontend Runner gestart");

try {
  console.log("▶ Building Next.js frontend");
  execSync("npm run build", { stdio: "inherit" });

  console.log("▶ Starting Next.js production server");
  execSync("npm run start", { stdio: "inherit" });

} catch (err) {
  console.error("FRONTEND RUNNER FOUT");
  console.error(err);
  process.exit(1);
}
