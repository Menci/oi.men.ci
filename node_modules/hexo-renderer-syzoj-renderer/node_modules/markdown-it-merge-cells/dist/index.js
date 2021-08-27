'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseTokens(tokens) {
  var tableOpen = tokens.shift(),
      tableClose = tokens.pop();
  var tokensTHead = tokens.splice(0, tokens.findIndex(function (token) {
    return token.type === 'thead_close';
  }) + 1),
      theadOpen = tokensTHead.shift(),
      theadClose = tokensTHead.pop();
  var tokensTBody = tokens.splice(0, tokens.findIndex(function (token) {
    return token.type === 'tbody_close';
  }) + 1),
      tbodyOpen = tokensTBody.shift(),
      tbodyClose = tokensTBody.pop();

  // row = tr_open (td_open inline td_close)+ tr_close
  var columnCount = (tokensTHead.length - 2) / 3;
  var trs = [];
  var inlineMatrix = [],
      tdMatrix = [];

  var tableContents = [].concat((0, _toConsumableArray3.default)(tokensTHead), (0, _toConsumableArray3.default)(tokensTBody));
  while (tableContents.length > 0) {
    var inlineRow = [],
        tdRow = [];

    var trOpen = tableContents.shift();

    for (var i = 0; i < columnCount; i++) {
      var tdOpen = tableContents.shift(),
          inline = tableContents.shift(),
          tdClose = tableContents.shift();

      inlineRow.push(inline);
      tdRow.push({
        open: tdOpen,
        close: tdClose
      });
    }

    var trClose = tableContents.shift();

    trs.push({
      open: trOpen,
      close: trClose
    });

    inlineMatrix.push(inlineRow);
    tdMatrix.push(tdRow);
  }

  return {
    columnCount: columnCount,
    rowCount: inlineMatrix.length,
    table: {
      open: tableOpen,
      close: tableClose
    },
    thead: {
      open: theadOpen,
      close: theadClose
    },
    tbody: {
      open: tbodyOpen,
      close: tbodyClose
    },
    trs: trs,
    inlineMatrix: inlineMatrix,
    tdMatrix: tdMatrix
  };
}

module.exports = function (md) {
  // Get table's rule function via a hidden API __rules__
  var ruler = md.block.ruler,
      rule = md.block.ruler.__rules__.find(function (rule) {
    return rule.name === 'table';
  }),
      oldFn = rule.fn;
  ruler.at('table', function (state, startLine, endLine, silent) {
    // Call old rule function first, get only the state added by table.
    var originalTokens = state.tokens,
        tableTokens = [];
    state.tokens = tableTokens;
    var success = oldFn(state, startLine, endLine, silent);
    state.tokens = originalTokens;
    if (!success) {
      return false;
    }

    var parsedTokens = parseTokens(tableTokens),
        processMatrix = parsedTokens.inlineMatrix.map(function (inlineRow) {
      return inlineRow.map(function (inline) {
        return {
          mergedTo: null,
          content: inline.content,
          cellCountInColumn: 1, // 0 if merged to cells above
          cellCountInRow: 1 // 0 if merged to cells on the left
        };
      });
    });

    // Merge cells in a *column* first.
    for (var column = 0; column < parsedTokens.columnCount; column++) {
      // Titles mustn't be merged with contents. So row 1 doesn't have any
      // mergable rows above, so start from row 2.
      for (var row = 2; row < parsedTokens.rowCount; row++) {
        var thisCell = processMatrix[row][column];

        if (thisCell.content === processMatrix[row - 1][column].content) {
          thisCell.mergedTo = processMatrix[row - 1][column].mergedTo // if cell above merged
          || processMatrix[row - 1][column]; // if cell above NOT merged

          thisCell.mergedTo.cellCountInColumn += thisCell.cellCountInColumn;
          thisCell.cellCountInColumn = 0;
        }
      }
    }

    // Merge cells in a *row* then.
    for (var _row = 0; _row < parsedTokens.rowCount; _row++) {
      for (var _column = 1; _column < parsedTokens.columnCount; _column++) {
        var _thisCell = processMatrix[_row][_column];

        // Skip if this cell or the cell on the left is already merged to one above.
        if (_thisCell.cellCountInColumn === 0) continue;
        if (processMatrix[_row][_column - 1].cellCountInColumn === 0) continue;

        if (_thisCell.content !== processMatrix[_row][_column - 1].content) continue;

        var mergeTo = processMatrix[_row][_column - 1].mergedTo // if cell on the left merged
        || processMatrix[_row][_column - 1]; // if cell on the left NOT merged

        // If both cells have cells merged to itself, we can only merge them if
        // they have same count of cells in a column.
        if (_thisCell.cellCountInColumn !== mergeTo.cellCountInColumn) continue;

        _thisCell.mergedTo = mergeTo;
        _thisCell.mergedTo.cellCountInRow += _thisCell.cellCountInRow;
        _thisCell.cellCountInRow = 0;
      }
    }

    function renderRow(row) {
      state.tokens.push(parsedTokens.trs[row].open);

      for (var _column2 = 0; _column2 < parsedTokens.columnCount; _column2++) {
        var _thisCell2 = processMatrix[row][_column2];

        // Cells merged to above or the left generate nothing.
        if (_thisCell2.mergedTo) continue;

        var tdOpen = parsedTokens.tdMatrix[row][_column2].open;
        if (_thisCell2.cellCountInColumn > 1 || _thisCell2.cellCountInRow > 1) {
          tdOpen.attrs = tdOpen.attrs || [];

          // 'rowspan' is how many rows (in a column) the cell is on.
          if (_thisCell2.cellCountInColumn > 1) {
            tdOpen.attrs.push(['rowspan', _thisCell2.cellCountInColumn.toString()]);
          }

          // 'colspan' is how many columns (in a row) the cell is on.
          if (_thisCell2.cellCountInRow > 1) {
            tdOpen.attrs.push(['colspan', _thisCell2.cellCountInRow.toString()]);
          }
        }

        state.tokens.push(tdOpen);
        state.tokens.push(parsedTokens.inlineMatrix[row][_column2]);
        state.tokens.push(parsedTokens.tdMatrix[row][_column2].close);
      }

      state.tokens.push(parsedTokens.trs[row].close);
    }

    state.tokens.push(parsedTokens.table.open);
    state.tokens.push(parsedTokens.thead.open);
    renderRow(0); // The first row is titles.
    state.tokens.push(parsedTokens.thead.close);

    // Table can have no tbody.
    if (parsedTokens.rowCount !== 0) {
      state.tokens.push(parsedTokens.tbody.open);
      for (var _row2 = 1; _row2 < parsedTokens.rowCount; _row2++) {
        renderRow(_row2);
      }
      state.tokens.push(parsedTokens.tbody.close);
    }

    state.tokens.push(parsedTokens.table.close);

    return true;
  });
};