import sharp from 'sharp';
await sharp('C:/Users/User/Downloads/64b9d3ce-f8bf-4011-8b22-4f26170bd905.png').resize({width:638,withoutEnlargement:true}).webp({quality:85}).toFile('public/assets/comparison-estimate.webp');
console.log(await sharp('public/assets/comparison-estimate.webp').metadata());
