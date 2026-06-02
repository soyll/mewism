import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

export class PackService {
  async unpack(
    gameDir: string,
    outputDir: string,
    progressCallback?: (current: number, total: number) => void
  ): Promise<void> {
    const gpakPath = join(gameDir, "resources.gpak");
    if (!existsSync(gpakPath)) {
      throw new Error(`resources.gpak not found in: ${gameDir}`);
    }

    await mkdir(outputDir, { recursive: true });

    const { open } = await import("node:fs/promises");
    const fh = await open(gpakPath, "r");
    try {
      const countBuf = Buffer.alloc(4);
      await fh.read(countBuf, 0, 4, 0);
      const count = countBuf.readInt32LE(0);

      const entries: { path: string; fileLen: number }[] = [];
      let offset = 4;

      for (let i = 0; i < count; i++) {
        const pathLenBuf = Buffer.alloc(2);
        await fh.read(pathLenBuf, 0, 2, offset);
        offset += 2;
        const pathLen = pathLenBuf.readInt16LE(0);

        const pathBuf = Buffer.alloc(pathLen);
        await fh.read(pathBuf, 0, pathLen, offset);
        offset += pathLen;
        const filePath = pathBuf.toString("utf-8");

        const fileLenBuf = Buffer.alloc(4);
        await fh.read(fileLenBuf, 0, 4, offset);
        offset += 4;
        const fileLen = fileLenBuf.readInt32LE(0);

        entries.push({ path: filePath, fileLen });
      }

      for (let i = 0; i < entries.length; i++) {
        const { path: relPath, fileLen } = entries[i];
        const outPath = join(outputDir, relPath);
        await mkdir(join(outPath, ".."), { recursive: true });

        const dataBuf = Buffer.alloc(fileLen);
        await fh.read(dataBuf, 0, fileLen, offset);
        offset += fileLen;

        const { writeFile } = await import("node:fs/promises");
        await writeFile(outPath, dataBuf);

        progressCallback?.(i + 1, count);
      }
    } finally {
      await fh.close();
    }
  }

  async repack(
    sourceDir: string,
    outputGpak: string,
    progressCallback?: (current: number, total: number) => void
  ): Promise<void> {
    if (!existsSync(sourceDir)) {
      throw new Error(`Source folder does not exist: ${sourceDir}`);
    }

    const { readdir, stat } = await import("node:fs/promises");
    const files: string[] = [];

    async function walk(dir: string, base: string) {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
          await walk(full, base);
        } else {
          const rel = full.slice(base.length + 1).replaceAll("\\", "/");
          files.push(rel);
        }
      }
    }

    await walk(sourceDir, sourceDir);

    await mkdir(join(outputGpak, ".."), { recursive: true });
    const { createWriteStream: cws } = await import("node:fs");

    const ws = cws(outputGpak);
    const write = (buf: Buffer) =>
      new Promise<void>((resolve, reject) => {
        ws.write(buf, (err) => (err ? reject(err) : resolve()));
      });

    const countBuf = Buffer.alloc(4);
    countBuf.writeInt32LE(files.length, 0);
    await write(countBuf);

    for (const rel of files) {
      const relBytes = Buffer.from(rel, "utf-8");
      const pathLenBuf = Buffer.alloc(2);
      pathLenBuf.writeInt16LE(relBytes.length, 0);
      await write(pathLenBuf);
      await write(relBytes);

      const fullPath = join(sourceDir, rel);
      const st = await stat(fullPath);
      const fileLenBuf = Buffer.alloc(4);
      fileLenBuf.writeInt32LE(st.size, 0);
      await write(fileLenBuf);
    }

    for (let i = 0; i < files.length; i++) {
      const rel = files[i];
      const fullPath = join(sourceDir, rel);
      const rs = createReadStream(fullPath);
      await new Promise<void>((resolve, reject) => {
        rs.pipe(ws, { end: false });
        rs.on("end", () => resolve());
        rs.on("error", reject);
      });
      progressCallback?.(i + 1, files.length);
    }

    ws.end();
  }
}
