import fs from "node:fs/promises";
import sharp from "sharp";
const manifest=JSON.parse(await fs.readFile("docs/generated-dish-images.json","utf8"));
await fs.mkdir("public/images/dishes",{recursive:true});
await fs.mkdir("test-results",{recursive:true});
for(const entry of manifest){await sharp(entry.source).resize({width:900,withoutEnlargement:true}).webp({quality:86}).toFile(`public/images/dishes/${entry.id}.webp`);}
const cells=await Promise.all(manifest.map(async(entry,index)=>({input:await sharp(`public/images/dishes/${entry.id}.webp`).resize(180,180,{fit:"cover"}).toBuffer(),left:(index%6)*184,top:Math.floor(index/6)*184})));
await sharp({create:{width:1100,height:Math.ceil(manifest.length/6)*184,channels:3,background:"#162019"}}).composite(cells).webp({quality:85}).toFile("test-results/dish-proof-sheet.webp");
console.log(`Imported ${manifest.length} dish photographs.`);
