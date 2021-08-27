function parseTokens(tokens) {
  const tableOpen = tokens.shift(), tableClose = tokens.pop();
  const tokensTHead = tokens.splice(0, tokens.findIndex(token => token.type === 'thead_close') + 1),
        theadOpen = tokensTHead.shift(), theadClose = tokensTHead.pop();
  const tokensTBody = tokens.splice(0, tokens.findIndex(token => token.type === 'tbody_close') + 1),
        tbodyOpen = tokensTBody.shift(), tbodyClose = tokensTBody.pop();

  // row = tr_open (td_open inline td_close)+ tr_close
  const columnCount = (tokensTHead.length - 2) / 3;
  const trs = [];
  const inlineMatrix = [], tdMatrix = [];

  const tableContents = [...tokensTHead, ...tokensTBody];
  while (tableContents.length > 0) {
    const inlineRow = [], tdRow = [];

    const trOpen = tableContents.shift();

    for (let i = 0; i < columnCount; i++) {
      const tdOpen = tableContents.shift(),
            inline = tableContents.shift(),
            tdClose = tableContents.shift();
      
      inlineRow.push(inline);
      tdRow.push({
        open: tdOpen,
        close: tdClose
      });
    }
    
    const trClose = tableContents.shift();

    trs.push({
      open: trOpen,
      close: trClose
    });

    inlineMatrix.push(inlineRow);
    tdMatrix.push(tdRow);
  }

  return {
    columnCount,
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
    trs,
    inlineMatrix,
    tdMatrix
  };
}

module.exports = md => {
  // Get table's rule function via a hidden API __rules__
  const ruler = md.block.ruler,
        rule = md.block.ruler.__rules__.find(rule => rule.name === 'table'),
        oldFn = rule.fn;
  ruler.at('table', (state, startLine, endLine, silent) => {
    // Call old rule function first, get only the state added by table.
    const originalTokens = state.tokens, tableTokens = [];
    state.tokens = tableTokens;
    const success = oldFn(state, startLine, endLine, silent);
    state.tokens = originalTokens;
    if (!success) {
      return false;
    }

    const parsedTokens = parseTokens(tableTokens),
          processMatrix = parsedTokens.inlineMatrix.map(
            inlineRow => inlineRow.map(inline => ({
              mergedTo: null,
              content: inline.content,
              cellCountInColumn: 1, // 0 if merged to cells above
              cellCountInRow: 1     // 0 if merged to cells on the left
            }))
          );
    
    // Merge cells in a *column* first.
    for (let column = 0; column < parsedTokens.columnCount; column++) {
      // Titles mustn't be merged with contents. So row 1 doesn't have any
      // mergable rows above, so start from row 2.
      for (let row = 2; row < parsedTokens.rowCount; row++) {
        const thisCell = processMatrix[row][column];

        if (thisCell.content === processMatrix[row - 1][column].content) {
          thisCell.mergedTo = processMatrix[row - 1][column].mergedTo // if cell above merged
                           || processMatrix[row - 1][column];         // if cell above NOT merged
          
          thisCell.mergedTo.cellCountInColumn += thisCell.cellCountInColumn;
          thisCell.cellCountInColumn = 0;
        }
      }
    }

    // Merge cells in a *row* then.
    for (let row = 0; row < parsedTokens.rowCount; row++) {
      for (let column = 1; column < parsedTokens.columnCount; column++) {
        const thisCell = processMatrix[row][column];

        // Skip if this cell or the cell on the left is already merged to one above.
        if (thisCell.cellCountInColumn === 0) continue;
        if (processMatrix[row][column - 1].cellCountInColumn === 0) continue;

        if (thisCell.content !== processMatrix[row][column - 1].content) continue;

        const mergeTo = processMatrix[row][column - 1].mergedTo // if cell on the left merged
                     || processMatrix[row][column - 1];         // if cell on the left NOT merged
        
        // If both cells have cells merged to itself, we can only merge them if
        // they have same count of cells in a column.
        if (thisCell.cellCountInColumn !== mergeTo.cellCountInColumn) continue;

        thisCell.mergedTo = mergeTo;
        thisCell.mergedTo.cellCountInRow += thisCell.cellCountInRow;
        thisCell.cellCountInRow = 0;
      }
    }

    function renderRow(row) {
      state.tokens.push(parsedTokens.trs[row].open);

      for (let column = 0; column < parsedTokens.columnCount; column++) {
        const thisCell = processMatrix[row][column];
        
        // Cells merged to above or the left generate nothing.
        if (thisCell.mergedTo) continue;

        const tdOpen = parsedTokens.tdMatrix[row][column].open;
        if (thisCell.cellCountInColumn > 1 || thisCell.cellCountInRow > 1) {
          tdOpen.attrs = tdOpen.attrs || [];

          // 'rowspan' is how many rows (in a column) the cell is on.
          if (thisCell.cellCountInColumn > 1) {
            tdOpen.attrs.push(['rowspan', thisCell.cellCountInColumn.toString()]);
          }

          // 'colspan' is how many columns (in a row) the cell is on.
          if (thisCell.cellCountInRow > 1) {
            tdOpen.attrs.push(['colspan', thisCell.cellCountInRow.toString()]);
          }
        }

        state.tokens.push(tdOpen);
        state.tokens.push(parsedTokens.inlineMatrix[row][column]);
        state.tokens.push(parsedTokens.tdMatrix[row][column].close);
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
      for (let row = 1; row < parsedTokens.rowCount; row++) {
        renderRow(row);
      }
      state.tokens.push(parsedTokens.tbody.close);
    }

    state.tokens.push(parsedTokens.table.close);

    return true;
  });
};
