# יום ההולדת של לרה 🎉

עמוד משפחתי ל-GitHub Pages בסגנון ובצבעי benedict.co.il: קצת על לרה → טריוויה → חשיפת היעד + ניווט.

## מבנה

```
index.html          עמוד המשפחה (הראשי – חובה בשורש)
css/style.css       עיצוב
js/config.js        ★ כל הטקסטים בעברית וברוסית + פרטי המקום (בנדיקט, ביג אשדוד, 28.08 16:30)
js/games.js         4 מיני-משחקים (קפה, מדבקות, אנג'ל, בלונים)
js/gate.js          מסך כניסה: עוגה עם נרות (לחיצה / נשיפה למיקרופון)
js/countdown.js     ספירה לאחור
js/gallery.js       גלריית זיכרונות + lightbox
js/sfx.js           צלילים מסונתזים + רטט
js/main.js          שפה, טריוויה וחשיפת היעד
assets/images/      family.jpg, benedict-ashdod.jpg, benedict-logo.png, gallery/ (תמונות לגלריה)
assets/audio/       song.mp3 – מוזיקת רקע (מתחילה אחרי כיבוי הנר, כפתור 🎵 בניווט)
.nojekyll           מגיש את הקבצים כמו שהם, בלי Jekyll
```

## מה לערוך

פותחים את `js/config.js`. הטקסטים מחולקים לבלוק `he` ולבלוק `ru`; פרטי הניווט ב-`venue.query`.
העמוד נפתח בבורר שפה, והבחירה נשמרת בדפדפן.

למלא ב-`config.js`: `wish.phone` (מספר ויטלי לברכות ב-WhatsApp) ו-`gallery` (תמונות ב-`assets/images/gallery/`).

## העלאה ל-GitHub Pages

```bash
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

ואז ב-GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
הכתובת: `https://<username>.github.io/<repo>/`
