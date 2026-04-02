const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
    { url: "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?auto=format&fit=crop&w=800&q=80", name: "attr_gorilla.jpg" },
    { url: "https://images.unsplash.com/photo-1588619623869-70529d8463db?auto=format&fit=crop&w=800&q=80", name: "attr_kigali.jpg" },
    { url: "https://images.unsplash.com/photo-1555543788-2921b7747e94?auto=format&fit=crop&w=800&q=80", name: "attr_akagera_zebra.jpg" },
    { url: "https://images.unsplash.com/photo-1440342359726-c4081631828e?auto=format&fit=crop&w=800&q=80", name: "attr_nyungwe_canopy.jpg" },
    { url: "https://images.unsplash.com/photo-1579706836413-5a0451f04128?auto=format&fit=crop&w=800&q=80", name: "attr_lake_kivu.jpg" }
];

const destDir = path.join(__dirname, 'images');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
}

images.forEach(img => {
    const file = fs.createWriteStream(path.join(destDir, img.name));
    https.get(img.url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => console.log(`Downloaded ${img.name}`));
        });
    }).on('error', function (err) {
        fs.unlink(path.join(destDir, img.name)); // Delete the file async. (But we don't check the result)
        console.error(`Error downloading ${img.name}: ${err.message}`);
    });
});
