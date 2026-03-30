# Memory Bank Logging Rules

## Purpose
This file defines the logging and tracking rules for the AI agent's workspace. It ensures that the agent's internal state is properly persisted and can be quickly recovered.

## File Structure
Each AI agent state must be saved in a separate file with a timestamp and task ID.
- Format: `task_{task_id}_{YYYY-MM-DD_HH-MM-SS}.md`

## Logging Rules
1. **Every task** must have a detailed log file in memory-bank/ with:
   - Current progress
   - Decisions made
   - Open questions
   - Next steps

2. **Agent Context** must be updated after each significant change:
   - Current focus
   - Active task
   - Pending tasks
   - State of ongoing processes

3. **Daily Status** must be written to `MESSAGE_FROM_AGENT.md`:
   - Summary of progress
   - Bottlenecks
   - Upcoming tasks

## Implementation Details
- All logs are plain text in Markdown format
- Use `#`, `##`, `###` for hierarchy
- Include timestamps in all files
- Keep logs concise but comprehensive

## Sample Log Entry Format
```markdown
# Task 1000: Pen Tool Shape Theme
## Progress
- [x] Investigated SVG shape rendering for dark theme
- [ ] Identified color mapping issue
- [ ] Updated shape color references

## Decisions
- Will implement new color mapping system
- Will adjust SVG palettes for dark theme

## Next Steps
1. Modify SVG shape color parameters
2. Test dark theme rendering
3. Update toolbox icons
```

## Recovery Process
1. Find latest log file for a given task
2. Copy relevant sections to `activeContext.md`
3. Update task state
4. Proceed with next steps