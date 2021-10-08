import { generateTypescript } from "../generator";
import { parse } from "../parser";
import {
    Addition,
    Const,
    Division,
    FixedType,
    Function,
    FunctionArg,
    GenericType,
    IfStatement,
    ListValue,
    Module,
    Multiplication,
    StringValue,
    Subtraction,
    Tag,
    Type,
    UnionType,
    UnparsedBlock,
    Value,
} from "../types";

import { intoBlocks, blockKind } from "../blocks";
import * as assert from "assert";
import { Ok } from "@eeue56/ts-core/build/main/lib/result";
import { compileTypescript } from "../compile";

const oneLine = `
add: number -> number -> number
add x y = x + y

sub: number -> number -> number
sub x y = x - y

addThree: number -> number -> number -> number
addThree x y z = x + y + z

mixOperators: number -> number -> number -> number
mixOperators x y z = x + y - z * x / y
`.trim();

const multiLine = `
add: number -> number -> number
add x y =
    x + y

sub: number -> number -> number
sub x y =
    x - y

addThree: number -> number -> number -> number
addThree x y z =
    x + y + z

mixOperators: number -> number -> number -> number
mixOperators x y z =
    x + y - z * x / y
`.trim();

const expectedOutput = `
function add(x: number, y: number): number {
    return x + y;
}

function sub(x: number, y: number): number {
    return x - y;
}

function addThree(x: number, y: number, z: number): number {
    return x + y + z;
}

function mixOperators(x: number, y: number, z: number): number {
    return x + y - z * x / y;
}
`.trim();

export function testIntoBlocks() {
    const split = oneLine.split("\n");
    assert.deepStrictEqual(intoBlocks(oneLine), [
        UnparsedBlock("FunctionBlock", 0, split.slice(0, 2)),
        UnparsedBlock("FunctionBlock", 3, split.slice(3, 5)),
        UnparsedBlock("FunctionBlock", 6, split.slice(6, 8)),
        UnparsedBlock("FunctionBlock", 9, split.slice(9, 11)),
    ]);
}

export function testIntoBlocksMultiLine() {
    const split = multiLine.split("\n");
    assert.deepStrictEqual(intoBlocks(multiLine), [
        UnparsedBlock("FunctionBlock", 0, split.slice(0, 3)),
        UnparsedBlock("FunctionBlock", 4, split.slice(4, 7)),
        UnparsedBlock("FunctionBlock", 8, split.slice(8, 11)),
        UnparsedBlock("FunctionBlock", 12, split.slice(12, 15)),
    ]);
}

export function testBlockKind() {
    assert.deepStrictEqual(blockKind(oneLine), Ok("Function"));
}

export function testBlockKindMultiLine() {
    assert.deepStrictEqual(blockKind(multiLine), Ok("Function"));
}

export function testParse() {
    assert.deepStrictEqual(
        parse(oneLine),
        Module(
            "main",
            [
                Function(
                    "add",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    Addition(Value("x"), Value("y"))
                ),
                Function(
                    "sub",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    Subtraction(Value("x"), Value("y"))
                ),
                Function(
                    "addThree",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    Addition(Value("x"), Addition(Value("y"), Value("z")))
                ),
                Function(
                    "mixOperators",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    Addition(
                        Value("x"),
                        Subtraction(
                            Value("y"),
                            Multiplication(
                                Value("z"),
                                Division(Value("x"), Value("y"))
                            )
                        )
                    )
                ),
            ],
            [ ]
        )
    );
}

export function testParseMultiLine() {
    assert.deepStrictEqual(
        parse(multiLine),
        Module(
            "main",
            [
                Function(
                    "add",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    Addition(Value("x"), Value("y"))
                ),
                Function(
                    "sub",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                    ],
                    Subtraction(Value("x"), Value("y"))
                ),
                Function(
                    "addThree",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    Addition(Value("x"), Addition(Value("y"), Value("z")))
                ),
                Function(
                    "mixOperators",
                    FixedType("number", [ ]),
                    [
                        FunctionArg("x", FixedType("number", [ ])),
                        FunctionArg("y", FixedType("number", [ ])),
                        FunctionArg("z", FixedType("number", [ ])),
                    ],
                    Addition(
                        Value("x"),
                        Subtraction(
                            Value("y"),
                            Multiplication(
                                Value("z"),
                                Division(Value("x"), Value("y"))
                            )
                        )
                    )
                ),
            ],
            [ ]
        )
    );
}

export function testGenerate() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testGenerateOneLine() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    assert.strictEqual(generated, expectedOutput);
}

export function testCompile() {
    const parsed = parse(oneLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
    );
}

export function testCompileMultiLine() {
    const parsed = parse(multiLine);
    const generated = generateTypescript(parsed);
    const compiled = compileTypescript(generated);

    assert.deepStrictEqual(
        compiled.kind,
        "ok",
        (compiled.kind === "err" && compiled.error.toString()) || ""
    );
}