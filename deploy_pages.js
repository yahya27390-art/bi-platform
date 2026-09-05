import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting deployment to GitHub Pages...');

try {
  // 1. Build project
  console.log('📦 Building production bundle...');
  execSync('npm.cmd run build', { stdio: 'inherit', cwd: __dirname });

  const distDir = path.join(__dirname, 'dist');
  const indexHtml = path.join(distDir, 'index.html');
  const fallback404 = path.join(distDir, '404.html');

  // 2. Duplicate index.html to 404.html for SPA routing
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, fallback404);
    console.log('✓ Created 404.html for SPA routing fallback');
  }

  // 3. Push dist to gh-pages branch
  console.log('📤 Pushing to gh-pages branch on GitHub...');
  const repoUrl = 'https://github.com/yahya27390-art/bi-platform.git';

  // Ensure clean git state in dist
  fs.rmSync(path.join(distDir, '.git'), { recursive: true, force: true });

  execSync('git init', { cwd: distDir, stdio: 'ignore' });
  execSync('git config user.name "yahya27390-art"', { cwd: distDir, stdio: 'ignore' });
  execSync('git config user.email "yahya9031@gmail.com"', { cwd: distDir, stdio: 'ignore' });
  execSync('git config http.postBuffer 524288000', { cwd: distDir, stdio: 'ignore' });
  execSync('git checkout -B gh-pages', { cwd: distDir, stdio: 'ignore' });
  execSync('git add -A', { cwd: distDir, stdio: 'ignore' });
  execSync('git commit --allow-empty -m "deploy: automated live release to GitHub Pages"', { cwd: distDir, stdio: 'ignore' });
  execSync(`git push -f ${repoUrl} gh-pages`, { cwd: distDir, stdio: 'inherit' });

  // Clean up dist/.git
  fs.rmSync(path.join(distDir, '.git'), { recursive: true, force: true });

  console.log('\n✅ Successfully deployed to GitHub Pages!');
  console.log('🔗 Live URL: https://yahya27390-art.github.io/bi-platform/\n');
} catch (err) {
  try {
    fs.rmSync(path.join(__dirname, 'dist', '.git'), { recursive: true, force: true });
  } catch (e) {}
  console.error('❌ Deployment failed:', err.message);
  process.exit(1);
}
