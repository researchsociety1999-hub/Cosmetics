# Legacy Static Prototype

This folder contains the original static HTML/CSS/JS prototype of the Mystique storefront,
built before the Next.js migration. It is **not deployed** and is kept here for reference only.

The production application lives in `/next-app` and is deployed at:
https://cosmetics-wjwz.vercel.app

**Do not edit these files.** If you need to reference design decisions, use the live site
or the Next.js source in `/next-app/src`.

## Files in this folder

| File | Description |
|---|---|
| `script.js` | Original vanilla JS storefront logic (cart, filters, Supabase fallback). Superseded by Next.js. |
| `cleanse.jpg` | Legacy product image — cleanser prototype shot. Now served via Supabase Storage. |
| `treat.jpg` | Legacy product image — treatment prototype shot. Now served via Supabase Storage. |
| `default.jpg` | Legacy fallback product image. Now served via Supabase Storage. |
