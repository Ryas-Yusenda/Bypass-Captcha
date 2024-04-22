const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { spawn } = require("child_process");

puppeteer.use(StealthPlugin());

const run = async function () {
	const configBrowser = {
		headless: "new",
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--window-position=000,000",
			"--disable-dev-shm-usage",
			"--disable-web-security",
			"--disable-features=IsolateOrigins",
			"--disable-site-isolation-trials",
		],
	};

	const browser = await puppeteer.launch(configBrowser);
	const page = await browser.newPage();
	await page.goto(
		"https://bsinet.bankbsi.co.id/",
		(waitUntil = "networkidle0")
	);

	// PASS CAPTCHA
	let captchaPassed = false;
	while (!captchaPassed) {
		captchaElement = await page.$("#captcha-img");

		if (captchaElement) {
			const captcha = await captchaElement.boundingBox();
			await page.screenshot({
				path: "captcha.png",
				clip: captcha,
			});

			// Version 1
			// const captchaText = await readCaptcha1("captcha.png");
			// console.log(captchaText);

			// Version 2
			const captchaText = await readCaptcha2("captcha.png");
			const ocrOutputLines = captchaText.split("\n");
			const filteredTextLines = ocrOutputLines
				.map((line) => {
					const match = line.match(
						/\[\[\[.*?\]\], \('(.+?)', (\d.\d+)\)\]/
					);
					return match && match[1] && match[2] ? match[1] : "";
				})
				.filter(
					(text) =>
						text.length > 0 &&
						!text.startsWith("Tulis nama") &&
						!text.includes("You typed")
				);

			const captchaResult = filteredTextLines.join(" ").trim();
			console.log(captchaResult);
		}
		// captchaPassed = true;
	}

	await browser.close();
};

async function readCaptcha1(imagePath) {
	const { createWorker } = require("tesseract.js");

	(async () => {
		const worker = await createWorker("eng");
		const ret = await worker.recognize(imagePath);
		console.log(ret.data.text);
		await worker.terminate();
	})();
}

async function readCaptcha2(imagePath) {
	// pip install "paddleocr>=2.0.1"
	return new Promise((resolve, reject) => {
		const ocr = spawn("paddleocr", [
			"--image_dir",
			imagePath,
			"--use_angle_cls",
			"true",
			"--lang",
			"en",
			"--use_gpu",
			"true",
		]);
		let result = "";

		ocr.stdout.on("data", (data) => {
			result += data.toString();
		});

		ocr.stderr.on("data", (data) => {
			console.error(`stderr: ${data}`);
		});

		ocr.on("close", (code) => {
			if (code === 0) {
				resolve(result);
			} else {
				reject("Error");
			}
		});
	});
}

run();
