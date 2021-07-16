import { generateTypescript } from "./generator";
import { blockKind, parse } from "./parser";
import {
    FixedType,
    Function,
    FunctionArg,
    IfStatement,
    Module,
    Tag,
    Type,
    UnionType,
    Value,
} from "./types";

import { intoBlocks } from "./blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";

const oneLine = `
isTrue: boolean -> boolean
isTrue value = if value then true else false
`.trim();

const multiLine = `
isTrue: boolean -> boolean
isTrue value =
    if value then
        true
    else
        false
`.trim();

const expectedOutput = `
function isTrue(value: boolean): boolean {
    if (value) {
        return true;
    } else {
        return false;
    }
}
`.trim();

export function testIntoBlocksSimpleFunction() {
    assert.deepStrictEqual(intoBlocks(multiLine), [ multiLine ]);
}

export function testIntoBlocksSimpleFunctionOneLine() {
    assert.deepStrictEqual(intoBlocks(oneLine), [ oneLine ]);
}

export function testBlockKindSimpleFunction() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testBlockKindSimpleFunctionOneLine() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testParseSimpleFunction() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                Function(
                    "isTrue",
                    FixedType("boolean", [ ]),
                    [ FunctionArg("value", FixedType("boolean", [ ])) ],
                    IfStatement(Value("value"), Value("true"), Value("false"))
                ),
            ],
            [ ]
        )
    );
}

export function testParseSimpleFunctionOneLine() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "isTrue",
                    FixedType("boolean", [ ]),
                    [ FunctionArg("value", FixedType("boolean", [ ])) ],
                    IfStatement(Value("value"), Value("true"), Value("false"))
                ),
            ],
            [ ]
        )
    );
}

export function testGenerateSimpleFunction() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateSimpleFunctionOneLine() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}
