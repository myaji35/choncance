
import chalk from 'chalk';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * [5500] Visual Sentinel
 * Role: Design Integrity Guardian
 * 
 * Usage: 
 *   npx tsx src/scripts/visual_sentinel.ts --mode=snapshot --label=before
 *   npx tsx src/scripts/visual_sentinel.ts --mode=snapshot --label=after
 *   npx tsx src/scripts/visual_sentinel.ts --mode=diff
 */

const SNAPSHOT_DIR = path.resolve('.bmad/snapshots');
const URL = 'http://localhost:3010';
const VIEWPORT = { width: 1920, height: 1080 };

async function ensureDir() {
    if (!fs.existsSync(SNAPSHOT_DIR)) {
        fs.mkdirSync(SNAPSHOT_DIR, { recursive: true });
    }
}

async function takeSnapshot(label: string) {
    await ensureDir();
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    console.log(chalk.blue(`📸 Sentinel Eyes: Scanning ${URL}...`));

    try {
        await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 });
        const filePath = path.join(SNAPSHOT_DIR, `${label}.png`);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(chalk.green(`✅ Snapshot saved: ${filePath}`));
    } catch (error) {
        console.log(chalk.red(`❌ Sentinel Blinded: Could not access ${URL}. Is server running?`));
        console.log(chalk.gray(`Error details: ${error}`));
        process.exit(1);
    } finally {
        await browser.close();
    }
}

async function compareSnapshots() {
    const img1Path = path.join(SNAPSHOT_DIR, 'before.png');
    const img2Path = path.join(SNAPSHOT_DIR, 'after.png');
    const diffPath = path.join(SNAPSHOT_DIR, 'diff.png');

    if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
        console.log(chalk.red("❌ Missing snapshots for comparison."));
        process.exit(1);
    }

    const img1 = PNG.sync.read(fs.readFileSync(img1Path));
    const img2 = PNG.sync.read(fs.readFileSync(img2Path));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    const totalPixels = width * height;
    const changeRate = (numDiffPixels / totalPixels) * 100;

    console.log(chalk.magenta(`🔍 Visual Diff Analysis:`));
    console.log(` - Diff Pixels: ${numDiffPixels}`);
    console.log(` - Change Rate: ${changeRate.toFixed(4)}%`);
    console.log(` - Diff Map: ${diffPath}`);

    if (changeRate > 5.0) { // 5% 이상 변화 시 경고
        console.log(chalk.red(`🚨 ALERT: Significant Visual Change Detected (${changeRate.toFixed(2)}%)!`));
        console.log(chalk.yellow(`Make sure this design change was intentional.`));
    } else {
        console.log(chalk.green(`✅ Visual Integrity Maintained.`));
    }
}

const args = process.argv.slice(2);
const modeArg = args.find(a => a.startsWith('--mode='));
const labelArg = args.find(a => a.startsWith('--label='));

const mode = modeArg ? modeArg.split('=')[1] : 'help';
const label = labelArg ? labelArg.split('=')[1] : 'snapshot';

(async () => {
    if (mode === 'snapshot') {
        await takeSnapshot(label);
    } else if (mode === 'diff') {
        await compareSnapshots();
    } else {
        console.log("Usage: --mode=[snapshot|diff] [--label=name]");
    }
})();
