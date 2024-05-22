// adding a cursor to the doc, want to add an id so can pick up that change in utils pullUpdates

import { EditorView, Decoration, WidgetType } from "@codemirror/view";
import { StateEffect, StateField } from "@codemirror/state";

class TooltipWidget extends WidgetType {
  constructor(name, color) {
    super(); // check WidgetType constructor
    this.suffix = `${(color % 8) + 1}`;
    this.name = name;
  }

  toDOM() {
    const dom = document.createElement("div");
    dom.className = "cm-tooltip-none";

    const cursor_tooltip = document.createElement("div");
    cursor_tooltip.className = `cm-tooltip-cursor cm-tooltip cm-tooltip-above cm-tooltip-${this.suffix}`; // are these all builtins?
    cursor_tooltip.textContent = this.name;

    const cursor_tooltip_arrow = document.createElement("div");
    cursor_tooltip_arrow.className = "cm-tooltip-arrow";

    cursor_tooltip.appendChild(cursor_tooltip_arrow);
    dom.appendChild(cursor_tooltip);

    // trying to add a vertical line beneath the arrow so can more easily see
    // where cursor is
    const cursor_indicator = document.createElement("div");
    cursor_indicator.className = "cm-cursor-indicator";
    cursor_tooltip.appendChild(cursor_indicator);
    return dom;
  }

  ignoreEvent() {
    return false; //so you can click "behind" it
  }
}

export const addCursor = StateEffect.define();

const cursorsItems = new Map();

const cursorField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(cursors, tr) {
    let cursorTransactions = cursors.map(tr.changes); // without this, doesn't update changes to doc

    for (const e of tr.effects)
      if (e.is(addCursor)) {
        const addUpdates = [];
        if (!cursorsItems.has(e.value.id))
          cursorsItems.set(e.value.id, cursorsItems.size); // keeping track of how many cursors, and their colors

        // this is the highlight
        if (e.value.from !== e.value.to) {
          addUpdates.push(
            Decoration.mark({
              class:
                e.value.id &&
                `cm-highlight-${(cursorsItems.get(e.value.id) % 8) + 1}`,
              id: e.value.id,
            }).range(e.value.from, e.value.to)
          );
        }

        addUpdates.push(
          Decoration.widget({
            widget: new TooltipWidget(e.value.id, cursorsItems.get(e.value.id)),
            block: false,
            id: e.value.id,
          }).range(e.value.to, e.value.to)
        );

        cursorTransactions = cursorTransactions.update({
          add: addUpdates,
          filter: (from, to, value) => {
            if (value?.spec?.id === e.value.id) return false;
            return true;
          },
        });
      }

    return cursorTransactions;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const cursorBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    position: "absolute",
    marginTop: "-40px",
    marginLeft: "-14px",
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent",
    },
    zIndex: "1000000",
    opacity: 0.9,
  },
  ".cm-cursor-indicator": {
    position: "absolute",
    height: "13px !important",
    width: "2px !important",
    left: "0",
    transform: "translateX(13px)",
    top: "calc(100% + 8px)",
    animationDuration: "1200ms",
    animationIterationCount: "infinite",
    animationName: "cm-blink",
    backgroundColor: "inherit",
  },
  ".cm-tooltip-none": {
    width: "0px",
    height: "0px",
    display: "inline-block",
  },
  ".cm-highlight-1": {
    backgroundColor: "#6666BB55",
  },
  ".cm-highlight-2": {
    backgroundColor: "#F76E6E55",
  },
  ".cm-highlight-3": {
    backgroundColor: "#0CDA6255",
  },
  ".cm-highlight-4": {
    backgroundColor: "#0CC5DA55",
  },
  ".cm-highlight-5": {
    backgroundColor: "#0C51DA55",
  },
  ".cm-highlight-6": {
    backgroundColor: "#980CDA55",
  },
  ".cm-highlight-7": {
    backgroundColor: "#DA0CBB55",
  },
  ".cm-highlight-8": {
    backgroundColor: "#DA800C55",
  },
  ".cm-tooltip-1": {
    backgroundColor: "#66b !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#66b !important",
    },
  },
  ".cm-tooltip-2": {
    backgroundColor: "#F76E6E !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#F76E6E !important",
    },
  },
  ".cm-tooltip-3": {
    backgroundColor: "#0CDA62 !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#0CDA62 !important",
    },
  },
  ".cm-tooltip-4": {
    backgroundColor: "#0CC5DA !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#0CC5DA !important",
    },
  },
  ".cm-tooltip-5": {
    backgroundColor: "#0C51DA !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#0C51DA !important",
    },
  },
  ".cm-tooltip-6": {
    backgroundColor: "#980CDA !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#980CDA !important",
    },
  },
  ".cm-tooltip-7": {
    backgroundColor: "#DA0CBB !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#DA0CBB !important",
    },
  },
  ".cm-tooltip-8": {
    backgroundColor: "#DA800C !important",
    position: "relative",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#DA800C !important",
    },
  },
});

export function cursorExtension(id = "") {
  return [
    cursorField,
    cursorBaseTheme,
    EditorView.updateListener.of((update) => {
      update.transactions.forEach((e) => {
        if (e.selection) {
          const cursor = {
            id,
            from: e.selection.ranges[0].from,
            to: e.selection.ranges[0].to,
          };
          update.view.dispatch({
            effects: addCursor.of(cursor), // make a state effect of this type
          });
        }
      });
    }),
  ];
}

// "cursor actually looks pretty good but will want to turn off the usual cursor"
// can we add the shared ruls for cursor indicator to the theme and just change
// the background color here?
