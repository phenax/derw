import * as assert from "@eeue56/ts-assert";
import { readdir, readFile } from "fs/promises";
import path from "path";
import { generateTypescript } from "../generator";
import { parse } from "../parser";

const emptyLineAtEndOfFile = "\n";

export async function testExamples() {
    const files = await readdir("./examples");

    const filePairs = files
        .filter((file) => file.endsWith("derw"))
        .map((derwFile) => {
            return {
                derw: path.join("examples", derwFile),
                ts: path.join("examples", derwFile.split(".")[0] + ".ts"),
            };
        });

    await Promise.all(
        filePairs.map(async ({ derw, ts }) => {
            const derwContents = (await readFile(derw)).toString();
            const tsContents = (await readFile(ts)).toString();

            const parsed = parse(derwContents);
            const generated = generateTypescript(parsed) + emptyLineAtEndOfFile;

            try {
                assert.deepStrictEqual(tsContents, generated);
            } catch (e) {
                console.log(`Failed to correctly generate ${derw}`);
                throw e;
            }
        })
    );
}
