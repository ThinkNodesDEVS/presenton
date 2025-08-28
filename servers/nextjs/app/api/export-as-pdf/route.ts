// No node path/fs needed; we upload directly to Supabase
// Use global fetch provided by Next.js runtime
import { auth } from '@clerk/nextjs/server';
import puppeteer from 'puppeteer';

import { sanitizeFilename } from '@/app/(presentation-generator)/utils/others';
import { NextResponse, NextRequest } from 'next/server';


export async function POST(req: NextRequest) {
  const { id, title } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing Presentation ID" }, { status: 400 });
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

  await page.goto(`http://localhost/pdf-maker?id=${id}`, { waitUntil: 'networkidle0', timeout: 300000 });

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

  // Upload to Supabase Storage via REST (using service role key on the server)
  const supabaseUrl = process.env.SUPABASE_URL as string;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET as string;
  if (!supabaseUrl || !supabaseKey || !bucket) {
    return NextResponse.json({ error: 'Supabase storage not configured' }, { status: 500 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const key = `users/${userId}/exports/${filename}`;

  // Convert Node Buffer -> ArrayBuffer for fetch body
  const body = pdfBuffer.buffer.slice(pdfBuffer.byteOffset, pdfBuffer.byteOffset + pdfBuffer.byteLength) as ArrayBuffer;
  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${key}` as string, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/pdf'
    },
    body
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    return NextResponse.json({ error: `Upload failed: ${uploadRes.status} ${text}` }, { status: 500 });
  }

  // Create signed URL (1 hour)
  const signRes = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}` as string, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ expiresIn: 3600, paths: [key] })
  });
  if (!signRes.ok) {
    const text = await signRes.text();
    return NextResponse.json({ error: `Sign failed: ${signRes.status} ${text}` }, { status: 500 });
  }
  const signJson = await signRes.json() as any[];
  const signed = signJson?.[0]?.signedURL || signJson?.[0]?.signedUrl;
  const signedUrl = `${supabaseUrl}/storage/v1/object/sign/${bucket}/${signed}`;

  return NextResponse.json({ success: true, path: signedUrl });
}
