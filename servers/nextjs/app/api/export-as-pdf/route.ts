// No node path/fs needed; we upload directly to Supabase
// Use global fetch provided by Next.js runtime
import { auth } from '@clerk/nextjs/server';
import puppeteer from 'puppeteer';

import { sanitizeFilename } from '@/app/(presentation-generator)/utils/others';
import { NextResponse, NextRequest } from 'next/server';
import { Storage } from '@google-cloud/storage';


export async function POST(req: NextRequest) {
  const { id, title } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing Deck ID" }, { status: 400 });
  }
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-web-security',
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  page.setDefaultNavigationTimeout(300000);
  page.setDefaultTimeout(300000);

  await page.goto(`http://127.0.0.1:3000/pdf-maker?id=${id}`, { waitUntil: 'networkidle0', timeout: 300000 });

  await page.waitForFunction('() => document.readyState === "complete"')

  try {
    await page.waitForFunction(
      `
      () => {
        const allElements = document.querySelectorAll('*');
        let loadedElements = 0;
        let totalElements = allElements.length;
        
        for (let el of allElements) {
            const style = window.getComputedStyle(el);
            const isVisible = style.display !== 'none' && 
                            style.visibility !== 'hidden' && 
                            style.opacity !== '0';
            
            if (isVisible && el.offsetWidth > 0 && el.offsetHeight > 0) {
                loadedElements++;
            }
        }
        
        return (loadedElements / totalElements) >= 0.99;
      }
      `,
      { timeout: 300000 }
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error) {
    console.log("Warning: Some content may not have loaded completely:", error);
  }


  const pdfBuffer = await page.pdf({
    width: "1280px",
    height: "720px",
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });

  browser.close();

  const sanitizedTitle = sanitizeFilename(title ?? 'presentation');
  const filename = `${sanitizedTitle}.pdf`;

  // Upload to Google Cloud Storage
  const gcsBucket = process.env.GCS_BUCKET as string;
  if (!gcsBucket) {
    return NextResponse.json({ error: 'GCS bucket not configured' }, { status: 500 });
  }
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const key = `users/${userId}/exports/${filename}`;
  const storage = new Storage();
  const bucket = storage.bucket(gcsBucket);
  const file = bucket.file(key);
  await file.save(pdfBuffer, { contentType: 'application/pdf' });
  try { await file.makePublic(); } catch {}
  const publicUrl = `https://storage.googleapis.com/${gcsBucket}/${encodeURIComponent(key)}`;
  return NextResponse.json({ success: true, path: publicUrl });
}
