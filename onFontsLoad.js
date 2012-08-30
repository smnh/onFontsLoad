var context = window;

(function() {

	/**
	 * This function waits until all specified font-families loaded and then executes a callback function.
	 * Supplied font-families should be already defined in the document, by URL or base64.
	 * If after specific threshold time fonts won't be loaded, callback will be invoked.
	 * 
	 * Callback invoked with a single parameter specifying if an error occurred and not all fonts were successfully loaded.
	 * If all fonts were loaded then this parameter will be null.
	 * Otherwise, object with message in "message" field and array with all the font-families that weren't loaded in
	 * "notLoadedFontFamilies" field will be returned.
	 * 
	 * @param {Array} fontFamiliesArray Array of font-families to test
	 * @param {Function} fontsLoadedCallback Callback function to call after all font-families loaded
	 * @param {Object} options Optional object with maxNumOfTries and tryIntervalMs properties.
	 * @return {Object}
	 */
	this.onFontsLoad = function onFontsLoad(fontFamiliesArray, fontsLoadedCallback, options) {
		var testContainer, testDiv, clonedDiv,
			notLoadedFontFamilies = [],
			referenceFontFamily = "serif",
			origHeight, origWidth,
			i, interval,
			callbackParameter,
			tryCount = 0,
			maxNumOfTries = 5,
			tryIntervalMs = 500;
		
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
		testContainer.style.cssText = "position:absolute; left:-1000px; top:-1000px; font-family: " + referenceFontFamily + "; font-size:40px;"; 
		document.body.appendChild(testContainer);
		
		testDiv = document.createElement("div");
		testDiv.appendChild(document.createTextNode("The quick brown fox jumps over the lazy dog"));
		
		// Get default dimensions
		clonedDiv = testDiv.cloneNode(true);
		clonedDiv.style.position = "absolute";
		clonedDiv.style.whiteSpace = "nowrap";
		testContainer.appendChild(clonedDiv);
		origWidth = clonedDiv.offsetWidth;
		origHeight = clonedDiv.offsetHeight;
		clonedDiv.parentNode.removeChild(clonedDiv);
		
		// Add div for each font-family
		for (i = 0; i < fontFamiliesArray.length; i++) {
			clonedDiv = testDiv.cloneNode(true);
			clonedDiv.style.position = "absolute";
			clonedDiv.style.whiteSpace = "nowrap";
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