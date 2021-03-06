var fs = require('fs');
var _ = require('underscore');
var Promise = require('bluebird');

var Excel = require('../excel');

var filename = process.argv[2];

var wb = new Excel.Workbook();

var arialBlackUI14 = { name: "Arial Black", family: 2, size: 14, underline: true, italic: true };
var comicSansUdB16 = { name: "Comic Sans MS", family: 4, size: 16, underline: "double", bold: true };

var alignments = [
    { text: "Top Left", alignment: { horizontal: "left", vertical: "top" } },
    { text: "Middle Centre", alignment: { horizontal: "center", vertical: "middle" } },
    { text: "Bottom Right", alignment: { horizontal: "right", vertical: "bottom" } },
    { text: "Wrap Text", alignment: { wrapText: true } },
    { text: "Indent 1", alignment: { indent: 1 } },
    { text: "Indent 2", alignment: { indent: 2 } },
    { text: "Rotate 15", alignment: { horizontal: "right", vertical: "bottom", textRotation: 15 } },
    { text: "Rotate 30", alignment: { horizontal: "right", vertical: "bottom", textRotation: 30 } },
    { text: "Rotate 45", alignment: { horizontal: "right", vertical: "bottom", textRotation: 45 } },
    { text: "Rotate 60", alignment: { horizontal: "right", vertical: "bottom", textRotation: 60 } },
    { text: "Rotate 75", alignment: { horizontal: "right", vertical: "bottom", textRotation: 75 } },
    { text: "Rotate 90", alignment: { horizontal: "right", vertical: "bottom", textRotation: 90 } },
    { text: "Rotate -15", alignment: { horizontal: "right", vertical: "bottom", textRotation: -55 } },
    { text: "Rotate -30", alignment: { horizontal: "right", vertical: "bottom", textRotation: -30 } },
    { text: "Rotate -45", alignment: { horizontal: "right", vertical: "bottom", textRotation: -45 } },
    { text: "Rotate -60", alignment: { horizontal: "right", vertical: "bottom", textRotation: -60 } },
    { text: "Rotate -75", alignment: { horizontal: "right", vertical: "bottom", textRotation: -75 } },
    { text: "Rotate -90", alignment: { horizontal: "right", vertical: "bottom", textRotation: -90 } },
    { text: "Vertical Text", alignment: { horizontal: "right", vertical: "bottom", textRotation: "vertical" } }
];
var badAlignments = [
    { text: "Rotate -91", alignment: { textRotation: -91 } },
    { text: "Rotate 91", alignment: { textRotation: 91 } },
    { text: "Indent -1", alignment: { indent: -1 } },
    { text: "Blank", alignment: {  } }
];

var passed = true;
var assert = function(value, failMessage, passMessage) {
    if (!value) {
        if (failMessage) console.log(failMessage);
        passed = false;
    } else {
        if (passMessage) console.log(passMessage);        
    }
}

var assertFont = function(value, expected, address) {
    assert(value, "Expected to find font object at " + address);
    _.each(expected, function(item, name) {
        assert(value[name] == expected[name], "Expected " + address + ".font[" + name + "] to be " + expected[name] + ", but was " + value[name]);
    });
    _.each(value, function(item, name) {
        assert(expected[name], "Found unexpected " + address + ".font[" + name + "] = " + value[name]);
    });
}

// assuming file created by testBookOut
wb.xlsx.readFile(filename)
    .then(function() {
        var ws = wb.getWorksheet("blort");
        
        assert(ws, "Expected to find a worksheet called blort");
        
        var cols = ws.columns;
        assert(cols[0] && (cols[0].width == 25), "Expected column width of col 1 to be 25, was " + cols[0].width);
        
        assert(ws.getCell("A2").value == 7, "Expected A2 == 7");
        assert(ws.getCell("B2").value == "Hello, World!", 'Expected B2 == "Hello, World!", was "' + ws.getCell("B2").value + '"');
        assertFont(ws.getCell("B2").font, comicSansUdB16, "B2");
        
        assert(Math.abs(ws.getCell("C2").value + 5.55) < 0.000001, "Expected C2 == -5.55, was" + ws.getCell("C2").value);
        assert(ws.getCell("C2").numFmt == '"£"#,##0.00;[Red]\-"£"#,##0.00', 'Expected C2 numFmt to be "£"#,##0.00;[Red]\-"£"#,##0.00, was ' + ws.getCell("C2").numFmt);
        assertFont(ws.getCell("C2").font, arialBlackUI14, "C2");
        
        assert(ws.getCell("D2").value instanceof Date, "expected D2 to be a Date, was " + ws.getCell("D2").value);
        
        assert(ws.getCell("C5").value.formula, "Expected C5 to be a formula, was " + JSON.stringify(ws.getCell("C5").value));
        
        assert(ws.getCell("A9").numFmt == "# ?/?", 'Expected A9 numFmt to be "# ?/?", was ' + ws.getCell("A9").numFmt);
        assert(ws.getCell("B9").numFmt == "h:mm:ss", 'Expected B9 numFmt to be "h:mm:ss", was ' + ws.getCell("B9").numFmt);
        assert(ws.getCell("C9").numFmt == "0.00%", 'Expected C9 numFmt to be "0.00%", was ' + ws.getCell("C9").numFmt);
        assert(ws.getCell("D9").numFmt == "[Green]#,##0 ;[Red](#,##0)", 'Expected D9 numFmt to be "[Green]#,##0 ;[Red](#,##0)", was ' + ws.getCell("D9").numFmt);
        assert(ws.getCell("E9").numFmt == "#0.000", 'Expected E9 numFmt to be "#0.000", was ' + ws.getCell("E9").numFmt);
        assert(ws.getCell("F9").numFmt == "# ?/?%", 'Expected F9 numFmt to be "# ?/?%", was ' + ws.getCell("F9").numFmt);
        
        assert(ws.getCell("A10").value == "<", 'Expected A10 to be "<", was "' + ws.getCell("A10").value + '"');
        assert(ws.getCell("B10").value == ">", 'Expected A10 to be ">", was "' + ws.getCell("B10").value + '"');
        assert(ws.getCell("C10").value == "<a>", 'Expected A10 to be "<a>", was "' + ws.getCell("C10").value + '"');
        assert(ws.getCell("D10").value == "><", 'Expected A10 to be "><", was "' + ws.getCell("D10").value + '"');
        
        assert(ws.getRow(11).height == 40, 'Expected Row 11 to be height 40, was ' + ws.getRow(11).height);
        _.each(alignments, function(alignment, index) {
            var rowNumber = 11;
            var colNumber = index + 1;
            var cell = ws.getCell(rowNumber, colNumber);
            assert(cell.value == alignment.text, 'Expected Cell[' + rowNumber + ',' + colNumber + '] to be ' + alignment.text + ', was ' + cell.value);
            assert(cell.alignment == alignment.alignment, 'Expected Cell[' + rowNumber + ',' + colNumber + '] alignment to be ' + JSON.stringify(alignment.alignment) + ', was ' + JSON.stringify(cell.alignment));
        });
        
        
        assert(passed, "Something went wrong", "All tests passed!");
    });


