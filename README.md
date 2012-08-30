#onFontsLoad
Javascript utility function that notifies when specific font families are loaded and rendered. It can be useful when you want to show alternative content before specific fonts are loaded. Оr when you need to get final dimensions of non-size-fixed containers that contain font families, as dimension of these containers may change after fonts are loaded.

##Usage
First define some fonts in your page:
```html
<style type="text/css">
	@font-face {
		font-family: DeliciousRoman;
		src: url(http://www.font-face.com/fonts/delicious/Delicious-Roman.otf);
		font-weight:400;
	}
	.myFont {
		font-family: DeliciousRoman, Helvetica, Arial, sans-serif;
		}
</style>
```
Then include the onFontsLoad.js
```html
<script type="text/javascript" src="path/to/onFontsLoad.js"></script>
```
And finally, add following function passing it array with all font-families you want to load and a callback function which will be executed once all fonts are loaded:
```javascript
onFontsLoad("DeliciousRoman", function(error) {
	if (!error) {
		// do something here, for example hide loading indicator and show elements with loaded font-family.
	}
});
```