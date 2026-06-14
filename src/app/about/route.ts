import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const localAssetPath = "./ReCos - Framer Website Template for Founders_files/";
const publicAssetPath =
  "/framer-recos/ReCos%20-%20Framer%20Website%20Template%20for%20Founders_files/";

export async function GET() {
  const htmlPath = path.join(process.cwd(), "public", "framer-recos", "recos-landing.html");
  const source = await readFile(htmlPath, "utf8");
  const html = source.replaceAll(localAssetPath, publicAssetPath);

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
