import sharp from 'sharp';
const photos=[['windows','210b46cb-d048-4b11-bb1f-5b3e51520dd5'],['balcony','0c26f840-5783-4059-a8b8-c8b14f790384'],['house','ff2b2db6-b8ba-4137-b25f-97f66112bf68']];
for(const [name,source] of photos){await sharp('C:/Users/User/Downloads/'+source+'.png').resize({width:430,withoutEnlargement:true}).webp({quality:82}).toFile('public/assets/home-hero-'+name+'.webp');}
