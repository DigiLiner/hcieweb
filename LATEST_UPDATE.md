I have fixed the **Rounded Rectangle** drawing logic.

**The Fix:**
1.  **Normalization:** The tool now correctly calculates the top-left corner  and positive width/height regardless of which direction you drag (e.g., bottom-right to top-left).
2.  **Radius Clamping:** I added logic to ensure the corner radius never exceeds half the size of the rectangle, preventing self-intersecting loops on small shapes.
3.  **Path Logic:** Switched to explicit  path construction to ensure consistent corners in all scenarios.

Please try drawing a Rounded Rectangle from **bottom-right to top-left** to confirm the artifact is gone.
**Wait for approval:** Let me know if it works, and I will proceed.
