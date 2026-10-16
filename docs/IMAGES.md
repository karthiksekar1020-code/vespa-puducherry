# Getting the Vespa images onto your site

The original site blocks automated downloads, so save the images with your own browser, then import them.
Only use images you are authorised to use (e.g. your dealer media rights with Piaggio).

## Option A: save each page
For each page you want (home, /vespa, /vespa-s, /vespa-tech, /vespa-qala, ...): open it in Chrome, scroll to the bottom so everything loads,
press Ctrl+S, choose "Webpage, Complete" and save into one parent folder, e.g. `C:\Users\New User\Downloads\vespa-images`.

## Option B: console helper (downloads only product images from the open page)
Open a page, wait for it to load, scroll down once, press F12 > Console, paste, Enter. Repeat for each model page.
Files go to your Downloads folder, named `<folder>__<file>` so the importer can tell models apart.

```js
const urls = new Set();
document.querySelectorAll("img").forEach(i => { [i.currentSrc, i.src, ...(i.srcset||"").split(",").map(s => s.trim().split(" ")[0])].forEach(u => u && urls.add(u)); });
document.querySelectorAll("*").forEach(e => { const m = getComputedStyle(e).backgroundImage.match(/url\("?([^")]+)"?\)/); if (m) urls.add(m[1]); });
const wanted = [...urls].map(u => new URL(u, location.href)).filter(u => u.origin === location.origin && /\/images\/.+\.(webp|png|jpe?g|avif)$/i.test(u.pathname) && !/logo|icon|rotate|footer/i.test(u.pathname));
for (const u of wanted) {
  const parts = u.pathname.split("/");
  const name = parts.slice(-2).join("__");
  const b = await (await fetch(u)).blob();
  Object.assign(document.createElement("a"), { href: URL.createObjectURL(b), download: name }).click();
  await new Promise(r => setTimeout(r, 400));
}
console.log("downloaded", wanted.length);
```
Chrome may ask to allow multiple downloads: click Allow.

## Import
```
npm run import-images -- "C:\Users\New User\Downloads\vespa-images"
npm run seed-catalogue
```
Images are copied into `public/scooters/<model-slug>/` and served from your own domain. Files that can't be matched to a model go to `public/scooters/_unsorted/` for you to move.
