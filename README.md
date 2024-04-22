<h3 align="center">BYPASS CAPTCHA</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()

</div>

---

<p align="center"> A simple project to bypass captcha using python and javascript
    <br> 
</p>

## 🎈 Usage <a name="usage"></a>

-   Version 1

```javascript
const captchaText = await readCaptcha1("captcha.png");
console.log(captchaText);
```

-   Version 2

```javascript
const captchaText = await readCaptcha2("captcha.png");
const ocrOutputLines = captchaText.split("\n");
const filteredTextLines = ocrOutputLines
	.map((line) => {
		const match = line.match(/\[\[\[.*?\]\], \('(.+?)', (\d.\d+)\)\]/);
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
```
