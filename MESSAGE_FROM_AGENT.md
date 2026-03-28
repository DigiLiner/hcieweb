I have completed the tasks you requested:

1.  **Selection Preview**: Selection tools (Rect, Ellipse, Lasso) now show a dashed preview while dragging, making them distinct from drawing tools.
2.  **Move Selection Visibility**: While dragging a selection, both the content and the "marching ants" border follow the mouse in real-time.
3.  **Move Selection Commit**: Releasing the mouse after moving a selection now correctly updates the selection mask and border to the new location (instead of cancelling it). The selection remains active and editable.
4.  **Shortcuts**: Fix for Ctrl+X/C/V/Z shortcuts to work reliably even if focus is not explicitly on the canvas (unless typing in a text input).

Please reload the page to test the changes.
