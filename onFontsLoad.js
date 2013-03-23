var context = window;

(function() {
	
	var origWidth = null,
		origHeight = null,
		testDiv = null;
	
	/**
	 * This function waits until all specified font-families loaded and rendered and then executes the callback function.
	 * It doesn't add font-families to the document, all font-families should be added to the document elsewhere.
	 * If after specific threshold time fonts won't be loaded, the callback function will be invoked with an error.
	 * 
	 * The callback function is invoked with a single error parameter.
	 * If all fonts were loaded then this parameter will be null. Otherwise, object with message in the "message" field
	 * and array in "notLoadedFontFamilies" field with all not loaded font-families will be returned.
	 * 
	 * @param {Array}    fontFamiliesArray   Array of font-families to load
	 * @param {Function} fontsLoadedCallback Callback function to call after all font-families loaded
	 * @param {Object}   [options]           Optional object with "maxNumOfTries" and "tryIntervalMs" properties.
	 * @return {Object}
	 */
	this.onFontsLoad = function onFontsLoad(fontFamiliesArray, fontsLoadedCallback, options) {
		var testContainer, clonedDiv,
			notLoadedFontFamilies = [],
			referenceFontFamily = "serif",
			i, interval,
			callbackParameter,
			tryCount = 0,
			maxNumOfTries = 10,
			tryIntervalMs = 250;
		
		function testDivDimensions() {
			var i, testDiv;
			for (i = testContainer.childNodes.length - 1; i >= 0; i--) {
				testDiv = testContainer.childNodes[i];
				if (testDiv.offsetWidth !== origWidth || testDiv.offsetHeight !== origHeight) {
					// Div's dimensions changed, this means its font loaded, remove it from testContainer div
					testDiv.parentNode.removeChild(testDiv);
				}
			}
		}
		
		function finish() {
			var testDiv;
			window.clearInterval(interval);
			testContainer.parentNode.removeChild(testContainer);
			if (testContainer.childNodes.length !== 0) {
				for (i = testContainer.childNodes.length - 1; i >= 0; i--) {
					testDiv = testContainer.childNodes[i];
					notLoadedFontFamilies.push(testDiv._ff);
				}
				callbackParameter = {
					message: "Not all fonts are loaded",
					notLoadedFontFamilies: notLoadedFontFamilies
				};
			} else {
				callbackParameter = null;
			}
			fontsLoadedCallback(callbackParameter);
		}
		
		if (options !== undefined) {
			if (options.maxNumOfTries) {
				maxNumOfTries = options.maxNumOfTries;
			}
			if (options.tryIntervalMs) {
				tryIntervalMs = options.tryIntervalMs;
			}
		}
		
		// Use pretty big fonts "40px" so smallest difference between standard
		// "serif" fonts and tested font-family will be noticable.
		testContainer = document.createElement("div");
		testContainer.style.cssText = "position:absolute; left:-10000px; top:-10000px; font-family: " + referenceFontFamily + "; font-size:40px;"; 
		document.body.appendChild(testContainer);
		
		if (testDiv === null) {
			testDiv = document.createElement("div");
			testDiv.style.position = "absolute";
			testDiv.style.whiteSpace = "nowrap";
			testDiv.appendChild(document.createTextNode(" !\"\\#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`abcdefghijklmnopqrstuvwxyz{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿŒœŠšŸƒˆ˜ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρςστυφχψωϑϒϖ–—‘’‚“”„†‡•…‰′″‹›‾⁄€ℑ℘ℜ™ℵ←↑→↓↔↵⇐⇑⇒⇓⇔∀∂∃∅∇∈∉∋∏∑−∗√∝∞∠∧∨∩∪∫∴∼≅≈≠≡≤≥⊂⊃⊄⊆⊇⊕⊗⊥⋅⌈⌉⌊⌋〈〉◊♠♣♥♦"));
			
			// Get default dimensions
			testContainer.appendChild(testDiv);
			origWidth = testDiv.offsetWidth;
			origHeight = testDiv.offsetHeight;
			testDiv.parentNode.removeChild(testDiv);
		}
		
		// Add div for each font-family
		for (i = 0; i < fontFamiliesArray.length; i++) {
			clonedDiv = testDiv.cloneNode(true);
			testContainer.appendChild(clonedDiv);
			// Apply tested font-family
			clonedDiv.style.fontFamily = fontFamiliesArray[i] + ", " + referenceFontFamily;
			clonedDiv._ff = fontFamiliesArray[i];
		}
		
		// Check if dimension of all divs changed immediately after applying font-family
		// maybe all fonts were already loaded so we don't need to poll and wait.
		testDivDimensions();
		
		// Check that there is at least one div, means at least one not loaded font.
		if (testContainer.childNodes.length) {
			// Poll div for their dimensions every tryIntervalMs.
			interval = window.setInterval(function() {
				// Loop through all divs and check if their dimensions changed.
				testDivDimensions();
				// If no divs remained, then all fonts loaded.
				// We also won't wait too much time, maybe some fonts are broken.
				if (testContainer.childNodes.length === 0 || tryCount === maxNumOfTries) {
					// All fonts are loaded OR (maxNumOfTries * tryIntervalMs) ms passed.
					finish();
				} else {
					tryCount++;
				}
			}, tryIntervalMs);
		} else {
			// All fonts are loaded
			testContainer.parentNode.removeChild(testContainer);
			fontsLoadedCallback(null);
		}
	};

}).apply(context);