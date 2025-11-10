import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Function to strip quotes from values
const stripQuotes = (value: string): string => {
  if (!value) return value;
  value = value.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
};

// Debug: Try multiple .env file locations
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
];

let envLoaded = false;
let loadedPath = '';

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    // Read and debug the file first
    try {
      let fileContent = fs.readFileSync(envPath, 'utf-8');
      
      // Remove BOM (Byte Order Mark) if present
      if (fileContent.charCodeAt(0) === 0xFEFF) {
        fileContent = fileContent.slice(1);
        console.log('⚠️  Removed BOM from .env file');
      }
      
      // Remove any null bytes or other problematic characters
      fileContent = fileContent.replace(/\0/g, '');
      
      console.log('\n🔍 Raw .env file content:');
      console.log('---');
      const lines = fileContent.split('\n');
      lines.forEach((line, index) => {
        if (line.trim() && !line.trim().startsWith('#')) {
          console.log(`Line ${index + 1}: ${line.trim()}`);
        }
      });
      console.log('---\n');
      
      // Write cleaned content to temp file and load it
      const tempPath = envPath + '.tmp';
      fs.writeFileSync(tempPath, fileContent, 'utf-8');
      
      // Try loading with dotenv
      const result = dotenv.config({ path: tempPath });
      
      // Clean up temp file
      try {
        fs.unlinkSync(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      // Check if dotenv successfully parsed
      if (result.error || !result.parsed || Object.keys(result.parsed).length === 0) {
        console.warn(`⚠️  dotenv parsing failed, trying manual parser...`);
        
        // Manual parser as fallback
        const envVars: Record<string, string> = {};
        const lines = fileContent.split(/\r?\n/);
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          
          const match = trimmed.match(/^([^=]+)=(.*)$/);
          if (match) {
            let key = match[1].trim();
            let value = match[2].trim();
            
            // Remove quotes
            value = stripQuotes(value);
            
            envVars[key] = value;
            process.env[key] = value;
          }
        }
        
        if (Object.keys(envVars).length > 0) {
          console.log(`✓ Manually parsed ${Object.keys(envVars).length} variables`);
          console.log('  Keys:', Object.keys(envVars).join(', '));
          console.log('');
          
          envLoaded = true;
          loadedPath = envPath;
        } else {
          console.warn(`⚠️  Manual parser also found no variables`);
          continue;
        }
      } else {
        // dotenv succeeded
        envLoaded = true;
        loadedPath = envPath;
        
        // Debug: Show what dotenv actually parsed
        console.log('🔍 Variables parsed by dotenv:');
        const parsedKeys = Object.keys(result.parsed || {});
        parsedKeys.forEach(key => {
          const value = result.parsed![key];
          const masked = key.includes('SECRET') || key.includes('PASSWORD') 
            ? (value?.substring(0, 10) + '***') 
            : (value?.length > 50 ? value.substring(0, 50) + '...' : value);
          console.log(`  ${key}: ${masked} (length: ${value?.length || 0})`);
        });
        console.log('');
      }
      
      // Strip quotes from all environment variables
      for (const key in process.env) {
        if (process.env[key]) {
          const original = process.env[key]!;
          const stripped = stripQuotes(original);
          if (original !== stripped) {
            process.env[key] = stripped;
            console.log(`  ✓ Stripped quotes from ${key}`);
          }
        }
      }
      
      console.log(`✓ Loaded .env from: ${envPath}`);
      break;
    } catch (error) {
      console.error(`❌ Error reading .env file at ${envPath}:`, error);
    }
  }
}

if (!envLoaded) {
  console.warn('⚠️  No .env file found in common locations. Trying default dotenv/config.');
  // Fallback to default behavior
  try {
    dotenv.config();
    
    // Strip quotes even from default load
    for (const key in process.env) {
      if (process.env[key]) {
        process.env[key] = stripQuotes(process.env[key]!);
      }
    }
    
    envLoaded = true;
    console.log('✓ Loaded .env using default dotenv/config');
  } catch (error) {
    console.error('❌ Failed to load environment variables:', error);
  }
}

// Log critical env vars on startup (masked)
if (process.env.NODE_ENV === 'development' || !process.env.DATABASE_URL) {
  console.log('\n📋 Environment Variables Check (after loading):');
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const masked = dbUrl.replace(/:([^:@]+)@/, ':***@');
    console.log(`  DATABASE_URL: ✓ Set (${masked.substring(0, 60)}...)`);
    console.log(`    Raw value length: ${dbUrl.length}`);
    console.log(`    Starts with quote: ${dbUrl.startsWith('"') || dbUrl.startsWith("'")}`);
    console.log(`    Ends with quote: ${dbUrl.endsWith('"') || dbUrl.endsWith("'")}`);
  } else {
    console.log('  DATABASE_URL: ✗ NOT SET');
    if (loadedPath) {
      console.log(`  ⚠️  .env file exists at: ${loadedPath}`);
      console.log('  ⚠️  Check if DATABASE_URL line is formatted correctly (no extra spaces, quotes are optional)');
    }
  }
  
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set (defaults to development)'}`);
  console.log(`  PORT: ${process.env.PORT || 'not set (defaults to 4000)'}`);
  console.log(`  JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Set' : '✗ NOT SET'}`);
  console.log(`  JWT_REFRESH_SECRET: ${process.env.JWT_REFRESH_SECRET ? '✓ Set' : '✗ NOT SET'}`);
  console.log('');
}

export { envLoaded, loadedPath };
