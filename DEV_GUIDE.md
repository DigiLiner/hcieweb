# Development Guide

## Running on Localhost

### Option 1: Webpack Dev Server (Recommended)
This provides hot reload and automatic browser refresh:

```bash
npm run web:dev
```

- Opens automatically at `http://localhost:8080`
- Hot module replacement enabled
- TypeScript compiles automatically
- Changes reflected instantly

### Option 2: Simple HTTP Server
For quick testing without webpack:

```bash
# First compile TypeScript
npm run build

# Then serve
npm run serve
```

- Serves at `http://localhost:8000`
- No hot reload, manual refresh needed
- Faster startup

### Option 3: Electron Desktop App
To run as Electron desktop application:

```bash
npm run dev
```

---

## Development Workflow

### 1. Start Development Server
```bash
npm run web:dev
```

### 2. Make Code Changes
Edit `.ts` files in the project root:
- `tools.ts` - Drawing tools
- `filters.ts` - Image filters
- `global.ts` - Global settings
- `drawing_canvas.ts` - Canvas logic

### 3. See Changes Live
Webpack dev server will automatically:
- Recompile TypeScript
- Refresh the browser
- Show compilation errors in overlay

---

## Build for Production

### Web Version
```bash
npm run web:build
```
Output: `dist/bundle.js`

### Electron App
```bash
npm run app:dist
```

---

## Project Structure

```
/run/media/hc/DATA/00_PROJECTS/Electron/hcie/
├── index.html          # Main HTML (works for both Electron & Web)
├── global.ts           # Global state and Tool class
├── tools.ts            # Drawing tools (Pen, Brush, Eraser, etc.)
├── filters.ts          # Image filters (Sepia, Blur, Melt, etc.)
├── drawing_canvas.ts   # Canvas event handling
├── renderer.ts         # Renderer entry point
├── main.ts             # Electron main process (desktop only)
├── webpack.config.web.js  # Webpack config for web
└── dist/               # Compiled output
```

---

## Troubleshooting

### Port Already in Use
If port 8080 is taken:
```bash
# Edit webpack.config.web.js, change port: 8080 to another port
# Or kill the process using the port
```

### TypeScript Errors
```bash
# Check for compilation errors
npm run build
```

### Module Not Found
```bash
# Install dependencies
npm install
```

---

## IDE Configuration

### VS Code
1. Install recommended extensions:
   - ESLint
   - TypeScript and JavaScript Language Features

2. Open project folder in VS Code

3. Press `F5` or use Run > Start Debugging for Electron mode

4. For web mode, use terminal: `npm run web:dev`

### WebStorm/IntelliJ
1. Right-click `package.json`
2. Select "Show npm Scripts"
3. Double-click `web:dev` to start

---

## Testing

### Quick Test
1. Run `npm run web:dev`
2. Browser opens automatically
3. Try drawing with Pen tool
4. Test new Brush with hardness
5. Try Eraser tool
6. Test filters (need UI buttons - coming next)

