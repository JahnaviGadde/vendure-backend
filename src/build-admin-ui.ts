// build-admin-ui.ts

import { compileUiExtensions } from '@vendure/ui-devkit/compiler';
import path from 'path';

// Import the UI extension definitions from your built plugin files
import { MyAdminUiPlugin } from './dist/src/plugins/my-admin-ui/my-admin-ui.plugin';
import { WebContentPlugin } from './dist/src/plugins/web-content/web-content.plugin';

async function buildAdminUI() {
  try {
    await compileUiExtensions({
      outputPath: path.join(__dirname, 'admin-ui'),
      extensions: [
        MyAdminUiPlugin.ui,
        WebContentPlugin.ui,
      ],
      devMode: false, // use true only during local dev
    });
    console.log('✅ Admin UI built successfully!');
  } catch (err) {
    console.error('❌ Failed to build Admin UI:', err);
    process.exit(1);
  }
}

buildAdminUI();
