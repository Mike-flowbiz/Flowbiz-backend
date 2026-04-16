import { saveBlobUpload, isBlobConfigured } from '../src/backend/utils/blobUpload';

async function main() {
  console.log('BLOB_READ_WRITE_TOKEN present:', !!process.env.BLOB_READ_WRITE_TOKEN);
  console.log('isBlobConfigured():', isBlobConfigured());

  if (!isBlobConfigured()) {
    console.log('\nSkipping live upload - no BLOB_READ_WRITE_TOKEN set.');
    console.log('To run a live test:');
    console.log('  1. Create a Blob store at https://vercel.com/dashboard/stores');
    console.log('  2. Copy the BLOB_READ_WRITE_TOKEN into .env');
    console.log('  3. Re-run: npx tsx scripts/test-blob-upload.ts');
    return;
  }

  const png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  console.log('\nUploading logos/test.png ...');
  const logoUrl = await saveBlobUpload(png1x1, 'logos', 'test logo.png', 'image/png');
  console.log('  url:', logoUrl);

  console.log('\nUploading receipts/test.png ...');
  const receiptUrl = await saveBlobUpload(png1x1, 'receipts', 'receipt (1).png', 'image/png');
  console.log('  url:', receiptUrl);

  console.log('\nFetching uploaded logo to verify it is public and readable ...');
  const res = await fetch(logoUrl);
  console.log('  status:', res.status, '  content-type:', res.headers.get('content-type'));
  const bodyLen = (await res.arrayBuffer()).byteLength;
  console.log('  bytes:', bodyLen, '(expected', png1x1.length + ')');

  if (res.status === 200 && bodyLen === png1x1.length) {
    console.log('\nPASS: blob upload + fetch round-trip works.');
  } else {
    console.log('\nFAIL: blob round-trip mismatch.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('FAIL:', err);
  process.exitCode = 1;
});
