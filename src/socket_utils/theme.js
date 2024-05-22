import { EditorView } from "@codemirror/view";

export const withYPadding = EditorView.theme({
  "&": {
    borderRadius: "3px",
    overflow: "hidden",
    border: "1px solid rgb(221, 221, 221)",
  },
  ".cm-content": {
    padding: "30px 0",
  },
});

// need to find out where the current styling is coming from...

// layout, classes of editor:

{
  /* <div class="cm-editor [cm-focused] [generated classes]">
  <div class="cm-scroller">
    <div class="cm-gutters">
      <div class="cm-gutter [...]">
        <!-- One gutter element for each line -->
        <div class="cm-gutterElement">...</div>
      </div>
    </div>
    <div class="cm-content" contenteditable="true">
      <!-- The actual document content -->
      <div class="cm-line">Content goes here</div>
      <div class="cm-line">...</div>
    </div>
    <div class="cm-selectionLayer">
      <!-- Positioned rectangles to draw the selection -->
      <div class="cm-selectionBackground"></div>
    </div>
    <div class="cm-cursorLayer">
      <!-- Positioned elements to draw cursors -->
      <div class="cm-cursor"></div>
    </div>
  </div>
</div> */
}
