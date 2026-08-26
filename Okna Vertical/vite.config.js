import { defineConfig } from "vite";
import fs from "node:fs";
import path from "node:path";

const createHouseGlazingPage = () => ({
	name: "create-house-glazing-page",
	writeBundle(options) {
		const outputDir = options.dir;
		if (!outputDir) return;

		let page = fs.readFileSync(path.join(outputDir, "index.html"), "utf8");
		const houseTitle = "\u041e\u0441\u0442\u0435\u043a\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u0433\u043e\u0440\u043e\u0434\u043d\u044b\u0445 \u0434\u043e\u043c\u043e\u0432 \u043f\u043e\u0434 \u043a\u043b\u044e\u0447 \u0432 \u0420\u044b\u0431\u0438\u043d\u0441\u043a\u0435";
		const houseDescription = "\u041e\u0441\u0442\u0435\u043a\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u0433\u043e\u0440\u043e\u0434\u043d\u044b\u0445 \u0434\u043e\u043c\u043e\u0432, \u043e\u043a\u043e\u043d \u041f\u0412\u0425, \u0432\u0445\u043e\u0434\u043d\u044b\u0445 \u0434\u0432\u0435\u0440\u0435\u0439 \u0438 \u043f\u0430\u043d\u043e\u0440\u0430\u043c\u043d\u044b\u0445 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u0439 \u043f\u043e\u0434 \u043a\u043b\u044e\u0447 \u0432 \u0420\u044b\u0431\u0438\u043d\u0441\u043a\u0435 \u0438 \u042f\u0440\u043e\u0441\u043b\u0430\u0432\u0441\u043a\u043e\u0439 \u043e\u0431\u043b\u0430\u0441\u0442\u0438. \u0420\u0430\u0441\u0447\u0451\u0442, \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u0438 \u043c\u043e\u043d\u0442\u0430\u0436.";

		page = page
			.replace('<html lang="ru">', '<html lang="ru" class="page-house">')
			.replaceAll("https://okna-vertikal.ru/", "https://okna-vertikal.ru/osteklenie-kottedzhey/")
			.replaceAll('href="#windows"', 'href="#solutions"')
			.replaceAll('href="#works"', 'href="#objects"')
			.replaceAll("\u041e\u043a\u043d\u0430 \u043f\u043e\u0434 \u043a\u043b\u044e\u0447 \u0441 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u043e\u0439 \u0432 \u0420\u044b\u0431\u0438\u043d\u0441\u043a\u0435", houseTitle)
			.replaceAll("\u041e\u043a\u043d\u0430 \u041f\u0412\u0425, \u0434\u0432\u0435\u0440\u0438 \u0438 \u043f\u0430\u043d\u043e\u0440\u0430\u043c\u043d\u044b\u0435 \u043a\u043e\u043d\u0441\u0442\u0440\u0443\u043a\u0446\u0438\u0438 \u043f\u043e\u0434 \u043a\u043b\u044e\u0447 \u0441 \u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043a\u043e\u0439 \u0432 \u0420\u044b\u0431\u0438\u043d\u0441\u043a\u0435. \u0420\u0430\u0441\u0447\u0451\u0442, \u0434\u043e\u0441\u0442\u0430\u0432\u043a\u0430 \u0438 \u043c\u043e\u043d\u0442\u0430\u0436.", houseDescription)
			.replace(/<title>[\s\S]*?<\/title>/, `<title>${houseTitle} — Окна Вертикаль</title>`)
			.replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${houseTitle}$2`)
			.replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${houseDescription}$2`)
			.replace(/(<meta name="twitter:title" content=")[^"]*(" \/>)/, `$1${houseTitle} — Окна Вертикаль$2`)
			.replace(/(<meta name="twitter:description" content=")[^"]*(" \/>)/, `$1${houseDescription}$2`)
			.replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${houseDescription}$2`)
			.replace(
				/(<main id="top" class="legacy-page">[\s\S]*?<h1>)[\s\S]*?(<\/h1>)/,
				`$1\n\t\t\t\t\t\t\u041e\u0441\u0442\u0435\u043a\u043b\u0435\u043d\u0438\u0435 \u0437\u0430\u0433\u043e\u0440\u043e\u0434\u043d\u044b\u0445 \u0434\u043e\u043c\u043e\u0432\n\t\t\t\t\t\t<span class="hero-accent">\u043f\u043e\u0434 \u043a\u043b\u044e\u0447</span>\n\t\t\t\t\t\t<span class="hero-city-offer"> \u0432&nbsp;\u0420\u044b\u0431\u0438\u043d\u0441\u043a\u0435 \u0438&nbsp;\u042f\u0440\u043e\u0441\u043b\u0430\u0432\u0441\u043a\u043e\u0439 \u043e\u0431\u043b\u0430\u0441\u0442\u0438</span>\n\t\t\t\t\t$2`,
			);

		const pageDir = path.join(outputDir, "osteklenie-kottedzhey");
		fs.mkdirSync(pageDir, { recursive: true });
		fs.writeFileSync(path.join(pageDir, "index.html"), page);
	},
});

export default defineConfig({
	plugins: [createHouseGlazingPage()],
	build: {
		rollupOptions: {
			output: {
				entryFileNames: "assets/app.js",
				chunkFileNames: "assets/[name].js",
				assetFileNames: ({ name }) =>
					name?.endsWith(".css") ? "assets/app.css" : "assets/[name][extname]",
			},
		},
	},
});
