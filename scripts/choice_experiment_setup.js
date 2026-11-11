// =====================================================================
// COP31 survey – choice experiment set-up
// ---------------------------------------------------------------------
// WHERE: add this to the scenario-text question (the screen shown just
//        BEFORE the looped choice-task block). Embedded data set here is
//        only available for piping on LATER pages, so it must not sit on
//        the first choice task itself.
//
// WHAT IT DOES
//   1. Sets the labels and descriptions of the three attributes.
//   2. Randomises the order of the attributes (rows) once per respondent;
//      the order stays the same across all six tasks.
//   3. Draws two packages (A and B) for each of the six tasks, each
//      attribute level drawn independently; identical pairs are redrawn.
//   4. Saves (a) the text shown in each table row, for piping, and
//      (b) a code for every attribute of every package, for analysis.
//
// All fields are saved with the prefix "__js_" (Qualtrics adds it), so
// they must be declared in the Survey Flow as "__js_<name>".
// =====================================================================

Qualtrics.SurveyEngine.addOnload(function () {
    this.hidePreviousButton();

    var numChoice = 6;

    // -----------------------------
    // LABELS (English)
    // -----------------------------
    var optionName = "Package";
    var taskName = "Task";

    var attributes = {
        finance: {
            name: "International climate finance",
            description: "Money this country gives to help developing countries cut emissions and adapt to climate change, compared with today.",
            levels: {
                "cut25": "Cut by 25%",
                "keep": "Kept at current level",
                "inc25": "Increased by 25%"
            }
        },
        priority: {
            name: "Policy area receiving extra funding",
            description: "The area, other than climate finance, that gets the largest increase in this package.",
            levels: {
                "defence": "Defence and national security",
                "growth": "Economic growth, jobs and competitiveness",
                "energy": "Energy security and prices",
                "food_water": "Food and water security",
                "health": "Health and pandemic preparedness"
            }
        },
        size: {
            name: "Extra funding for that area",
            description: "How much more is spent on that area each year, as a share of the country’s economy (GDP).",
            levels: {
                "0.5": "+0.5% of GDP per year",
                "1.0": "+1.0% of GDP per year",
                "1.5": "+1.5% of GDP per year"
            }
        }
    };

    var attrKeys = ["finance", "priority", "size"];

    // -----------------------------
    // HELPERS
    // -----------------------------
    function shuffle(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function drawLevel(attr) {
        var codes = Object.keys(attributes[attr].levels);
        return codes[Math.floor(Math.random() * codes.length)];
    }

    function drawPackage() {
        var p = {};
        for (var k = 0; k < attrKeys.length; k++) {
            p[attrKeys[k]] = drawLevel(attrKeys[k]);
        }
        return p;
    }

    function samePackage(a, b) {
        for (var k = 0; k < attrKeys.length; k++) {
            if (a[attrKeys[k]] !== b[attrKeys[k]]) return false;
        }
        return true;
    }

    function setED(name, value) {
        Qualtrics.SurveyEngine.setJSEmbeddedData(name, value);
    }

    // -----------------------------
    // 1. GENERAL LABELS
    // -----------------------------
    setED("option_name", optionName);
    setED("task_name", taskName);

    // -----------------------------
    // 2. ATTRIBUTE (ROW) ORDER – once per respondent
    // -----------------------------
    var order = shuffle(attrKeys.slice());
    setED("attr_order", order.join("|"));   // e.g. "priority|finance|size"

    for (var r = 0; r < order.length; r++) {
        setED("row" + (r + 1) + "_name", attributes[order[r]].name);
        setED("row" + (r + 1) + "_description", attributes[order[r]].description);
    }

    // -----------------------------
    // 3. + 4. PACKAGES FOR EACH TASK
    // -----------------------------
    for (var i = 1; i <= numChoice; i++) {

        var pkgA = drawPackage();
        var pkgB = drawPackage();
        var redraws = 0;
        while (samePackage(pkgA, pkgB)) {   // identical pairs are redrawn
            pkgB = drawPackage();
            redraws++;
        }
        setED("task" + i + "_redraws", redraws);

        // (a) Codes by attribute, for analysis (independent of row order)
        for (var k = 0; k < attrKeys.length; k++) {
            var a = attrKeys[k];
            setED("task" + i + "_" + a + "_a_code", pkgA[a]);
            setED("task" + i + "_" + a + "_b_code", pkgB[a]);
        }

        // (b) Text by row, for piping into the table
        for (var r2 = 0; r2 < order.length; r2++) {
            var attr = order[r2];
            setED("task" + i + "_row" + (r2 + 1) + "_a", attributes[attr].levels[pkgA[attr]]);
            setED("task" + i + "_row" + (r2 + 1) + "_b", attributes[attr].levels[pkgB[attr]]);
        }
    }
});
