// example from docs

import { showTooltip } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import { EditorView } from "@codemirror/view";

const cursorTooltipField = StateField.define({
  create: getCursorTooltips,

  update(tooltips, transaction) {
    if (!transaction.docChanged && !transaction.selection) return tooltips;
    return getCursorTooltips(transaction.state);
  },

  provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
});

/* looks for range.to == range.from, which is used to indicate cursor is positioned at range.to/from value.
believe that if we had multiple, it would create multiple tooltips.
assigns the text to be line and position in line.
what does strict side do? unclear
*/
function getCursorTooltips(state) {
  console.log("in getcursortooltips", state);
  return state.selection.ranges
    .filter((range) => range.empty)
    .map((range) => {
      let line = state.doc.lineAt(range.head);
      let text = line.number + ":" + (range.head - line.from);
      return {
        pos: range.head,
        above: true,
        strictSide: true,
        arrow: true,
        create: () => {
          let dom = document.createElement("div");
          dom.className = "cm-tooltip-cursor";
          dom.textContent = text;
          return { dom };
        },
      };
    });
}

// defining the style of the tooltip, so would want it to be dynamic
const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#66b",
    },
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent",
    },
  },
});

// extension
export function cursorTooltip() {
  return [cursorTooltipField, cursorTooltipBaseTheme];
}
