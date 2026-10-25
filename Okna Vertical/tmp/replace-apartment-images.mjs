import sharp from 'sharp';
const images = [
 ['28ab40b3-807a-4a58-92e6-696ea84acab1.png','apartment-two-sash-card.webp'],
 ['4bb1112c-6a3e-44bd-8dc7-8e2b2c2c8ec8.png','apartment-three-sash-card.webp'],
 ['27859744-89b3-4ecb-9f38-fc4c63e1c6ec.png','apartment-balcony-block-card.webp'],
 ['9e6257f2-cd6d-4498-bbef-8b703b8d21ee.png','apartment-quiet-window-card.webp'],
];
for (const [input,output] of images) {
 const info=await sharp(`C:/Users/User/Downloads/${input}`).resize({width:535,withoutEnlargement:true}).webp({quality:82}).toFile(`public/assets/${output}`);
 console.log({file:output,width:info.width,height:info.height,bytes:info.size});
}
