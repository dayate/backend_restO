import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Skrip kombinasi untuk menjalankan semua skrip setup awal
const runSetupScripts = async () => {
  console.log('Starting setup scripts...');

  try {
    // Jalankan skrip membuat admin
    console.log('\n1. Creating admin user...');
    const adminResult = await execPromise('bun run create-admin.ts');
    console.log(adminResult.stdout);
    if (adminResult.stderr) console.error(adminResult.stderr);

    // Jalankan skrip membuat menu
    console.log('\n2. Creating sample menu items...');
    const menuResult = await execPromise('bun run create-menu.ts');
    console.log(menuResult.stdout);
    if (menuResult.stderr) console.error(menuResult.stderr);

    // Jalankan skrip membuat pesanan
    console.log('\n3. Creating sample orders...');
    const ordersResult = await execPromise('bun run create-orders.ts');
    console.log(ordersResult.stdout);
    if (ordersResult.stderr) console.error(ordersResult.stderr);

    console.log('\n✅ All setup scripts completed successfully!');
    console.log('\nNext steps:');
    console.log('- Run the server with: bun run index.ts');
    console.log('- Login to admin panel with username: admin, password: admin123');
    console.log('- Access API endpoints as documented in test.md');
  } catch (error) {
    console.error('❌ Error running setup scripts:', error);
  }
};

runSetupScripts();