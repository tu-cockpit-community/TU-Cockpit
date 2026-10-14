# TU Slide Vault (`tu-slide-vault`) Standalone Community Repository Blueprint

> **Repository:** [`https://github.com/tu-cockpit-community/tu-slide-vault`](https://github.com/tu-cockpit-community/tu-slide-vault)  
> **Plugin ID:** `tuwien.community.slide-vault`  
> **Target Runtime:** TU Cockpit Sandboxed Plugin Execution Engine  
> **Architecture:** Standalone Client-Side React 19 + TypeScript + Vite SPA  

---

## 1. Overview & Architecture

**TU Slide Vault** is a high-performance offline lecture slide indexer and search companion built for TU Wien students. By separating Slide Vault into an autonomous community plugin repository, the core TU Cockpit binary remains lightweight and free of heavy PDF parsing dependencies and WebAssembly binaries.

```
+-----------------------------------------------------------------------------------+
|                       tu-cockpit-community / tu-slide-vault                       |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  |   manifest.json    |   |  index.html (Vite)    |   |  .github/workflows/    |  |
|  | - Scoped Network   |   |  - React 19 UI        |   |    release-plugin.yml  |  |
|  | - Quota (100MB)    |   |  - PDF.js / Worker    |   |  - Bundles plugin.zip  |  |
|  | - IndexedDB Perms  |   |  - IndexedDB Storage  |   |  - Signs release asset |  |
|  +--------------------+   +-----------------------+   +------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                Automated GitHub Releases (tags: v1.0.0, etc.)
                                          v
+-----------------------------------------------------------------------------------+
|                           TU COCKPIT COMMUNITY STORE                              |
|  - Auto-discovered via GitHubPluginService / CommunityOrgService                  |
|  - Validated by Community Security Auditor                                        |
|  - Installed into sandboxed iframe runtime                                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Repository File Structure

```
tu-slide-vault/
├── .github/
│   └── workflows/
│       └── release-plugin.yml      # Automated CI/CD for plugin bundling & GitHub Releases
├── manifest.json                   # TU Cockpit Plugin Manifest Specification
├── package.json                    # Standalone dependencies (React 19, Vite, pdfjs-dist)
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build config with relative base & worker bundling
├── index.html                      # HTML root template
└── src/
    ├── main.tsx                    # React mounting entrypoint
    ├── App.tsx                     # Main Slide Vault UI (Course Explorer, PDF Reader, Search)
    ├── index.css                   # Tailwind v4 / TU Cockpit CSS Design Tokens
    ├── services/
    │   ├── pdfIndexer.ts           # Web Worker client-side PDF text extraction
    │   └── storageService.ts       # IndexedDB storage within 100MB sandboxed quota
    └── components/
        ├── SlideSearchBar.tsx      # Instant fuzzy full-text query input
        └── PDFViewerModal.tsx      # Dark-mode tile inversion PDF reader
```

---

## 3. Configuration Files

### 3.1 `manifest.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/tu-cockpit-community/TU-Cockpit/main/schemas/plugin-manifest.v1.json",
  "id": "tuwien.community.slide-vault",
  "name": "TU Slide Vault",
  "version": "1.0.0",
  "description": "Offline lecture slide indexer, instant full-text search across course PDF materials, and dark-mode slide viewer.",
  "author": {
    "name": "TU Cockpit Community Contributors",
    "github": "tu-cockpit-community",
    "url": "https://github.com/tu-cockpit-community"
  },
  "entrypoint": "index.html",
  "category": "Academic",
  "homepage": "https://github.com/tu-cockpit-community/tu-slide-vault",
  "capabilities": {
    "network": [
      "https://tuwel.tuwien.ac.at/*",
      "https://vowi.fsinf.at/*"
    ],
    "storage": {
      "quotaBytes": 104857600
    },
    "notifications": true,
    "systemClipboard": true
  },
  "permissions": [
    "storage.indexeddb",
    "network.fetch"
  ]
}
```

### 3.2 `package.json`

```json
{
  "name": "tu-slide-vault",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^1.16.0",
    "pdfjs-dist": "^4.10.38",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.5.0",
    "vite": "^6.2.0"
  }
}
```

### 3.3 `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// TU Cockpit Sandboxed plugins require relative assets ('./') so they can be loaded from file:/// or blob: origins
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          pdfjs: ["pdfjs-dist"],
        },
      },
    },
  },
});
```

---

## 4. Frontend Implementation Blueprint

### 4.1 Storage Service (`src/services/storageService.ts`)

```ts
const DB_NAME = "tu_slide_vault_db";
const STORE_NAME = "pdf_blobs";
const DB_VERSION = 1;

export interface StoredSlideFile {
  id: string;
  courseId: string;
  courseName: string;
  fileName: string;
  blob: Blob;
  size: number;
  cachedAt: string;
}

export class SlideStorageService {
  private static async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("courseId", "courseId", { unique: false });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  public static async saveFile(file: StoredSlideFile): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(file);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  public static async getAllFiles(): Promise<StoredSlideFile[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  public static async deleteFile(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
```

### 4.2 PDF Web Worker Indexer (`src/services/pdfIndexer.ts`)

```ts
import * as pdfjsLib from "pdfjs-dist";

// Worker-safe full text extraction
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface IndexedPage {
  pageNumber: number;
  text: string;
}

export class PDFIndexer {
  public static async extractText(arrayBuffer: ArrayBuffer): Promise<IndexedPage[]> {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const pages: IndexedPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(" ");
      pages.push({ pageNumber: i, text: pageText });
    }

    return pages;
  }
}
```

### 4.3 Dark-Inverted PDF Viewer Component (`src/components/PDFViewerModal.tsx`)

```tsx
import React, { useState } from "react";
import { X, ZoomIn, ZoomOut, Moon, Sun } from "lucide-react";

interface PDFViewerModalProps {
  file: { fileName: string; dataUrl: string };
  onClose: () => void;
}

export const PDFViewerModal: React.FC<PDFViewerModalProps> = ({ file, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col p-4">
      <div className="h-12 bg-neutral-900 border-b border-neutral-800 px-4 flex items-center justify-between text-white text-xs">
        <span className="font-semibold truncate">{file.fileName}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            className="p-1 hover:bg-neutral-800 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="font-mono">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="p-1 hover:bg-neutral-800 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1 hover:bg-neutral-800 rounded"
            title="Toggle Dark Invert Filter"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-neutral-800 rounded ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-neutral-950 flex justify-center p-4">
        <iframe
          src={file.dataUrl}
          className="w-full h-full rounded shadow-xl"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
            filter: isDarkMode ? "invert(0.9) hue-rotate(180deg)" : "none",
          }}
        />
      </div>
    </div>
  );
};
```

---

## 5. Automated CI/CD Packaging Pipeline (`.github/workflows/release-plugin.yml`)

```yaml
name: Release Community Plugin Bundle

on:
  push:
    tags:
      - 'v*'

jobs:
  bundle-plugin:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout Source
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Standalone Bundle
        run: npm run build

      - name: Package Plugin Bundle Archive
        run: |
          cp manifest.json dist/
          cd dist
          zip -r ../plugin.zip ./*
          cd ..
          sha256sum plugin.zip > checksum.sha256

      - name: Publish GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          files: |
            plugin.zip
            checksum.sha256
            manifest.json
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 6. Turnkey Initialization Runbook

To instantiate the repository from scratch:

```bash
# 1. Initialize local directory
mkdir tu-slide-vault && cd tu-slide-vault
git init -b main

# 2. Initialize project configuration
npm init -y
npm install react react-dom lucide-react pdfjs-dist
npm install -D vite @vitejs/plugin-react typescript tailwindcss @types/react @types/react-dom

# 3. Create manifest.json, vite.config.ts, and workflow
# (Copy snippets from sections 3 and 5 above)

# 4. Commit and push to community org
git remote add origin https://github.com/tu-cockpit-community/tu-slide-vault.git
git add .
git commit -m "feat: initial scaffold for tu-slide-vault community plugin"
git push -u origin main

# 5. Create first release tag to trigger bundling
git tag v1.0.0
git push origin v1.0.0
```

Once tagged, the GitHub Action automatically creates the `v1.0.0` release asset containing `plugin.zip`, `manifest.json`, and `checksum.sha256`. TU Cockpit's `CommunityOrgService` will automatically discover the repository under `https://github.com/tu-cockpit-community` and make it installable with 1-click in the Community Store HUB.
