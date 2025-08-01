#!/usr/bin/env node

/**
 * Script to update environment variables for different deployment environments
 * Usage: node scripts/update-env.js <environment> <site-url>
 * Example: node scripts/update-env.js production https://my-site.netlify.app
 */

const fs = require('fs');
const path = require('path');

const environment = process.argv[2];
const siteUrl = process.argv[3];

if (!environment || !siteUrl) {
  console.error('Usage: node scripts/update-env.js <environment> <site-url>');
  console.error('Example: node scripts/update-env.js production https://my-site.netlify.app');
  process.exit(1);
}

const envFile = environment === 'production' ? '.env.production' : '.env.local';
const envPath = path.join(process.cwd(), envFile);

// Read current env file
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
}

// Update or add the API base URL
const apiUrlRegex = /^NEXT_PUBLIC_API_BASE_URL=.*$/m;
const newApiUrl = `NEXT_PUBLIC_API_BASE_URL=${siteUrl}`;

if (apiUrlRegex.test(envContent)) {
  envContent = envContent.replace(apiUrlRegex, newApiUrl);
} else {
  envContent = envContent.trim() + '\n' + newApiUrl + '\n';
}

// Write updated content
fs.writeFileSync(envPath, envContent);

console.log(`✅ Updated ${envFile} with API URL: ${siteUrl}`);

// Also update netlify.toml if it's production
if (environment === 'production') {
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
  if (fs.existsSync(netlifyTomlPath)) {
    let netlifyContent = fs.readFileSync(netlifyTomlPath, 'utf8');
    const netlifyApiUrlRegex = /NEXT_PUBLIC_API_BASE_URL = ".*"/;
    const newNetlifyApiUrl = `NEXT_PUBLIC_API_BASE_URL = "${siteUrl}"`;
    
    if (netlifyApiUrlRegex.test(netlifyContent)) {
      netlifyContent = netlifyContent.replace(netlifyApiUrlRegex, newNetlifyApiUrl);
      fs.writeFileSync(netlifyTomlPath, netlifyContent);
      console.log(`✅ Updated netlify.toml with API URL: ${siteUrl}`);
    }
  }
}

console.log('\n📝 Next steps:');
console.log('1. Commit and push your changes');
console.log('2. Redeploy your site on Netlify');
console.log('3. Test form submission on the deployed site');