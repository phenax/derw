import { Err, Ok, Result } from "@eeue56/ts-core/build/main/lib/result";
import { intoBlocks } from "./blocks";
import { SyntaxKinds, UnionType, TagArg, Tag, Syntax, Module } from "./types";

export function blockKind(block: string): Result<string, SyntaxKinds> {
    if (block.startsWith("type")) {
        return Ok("UnionType");
    }

    return Err("Unknown block type");
}

function parseUnionType(block: string): Result<string, UnionType> {
    // always after "type", one joined token
    const name = block.split(" ")[1].trim();

    // anything after the =, split based on pipes
    const tagParts = block.split("=").slice(1).join("=").split("|");

    const tags = tagParts.map((tag) => {
        if (tag.startsWith("|")) {
            tag = tag.slice(1);
        }
        tag = tag.trim();

        const tagName = tag.split(" ")[0];
        let argsAsJson = tag.split(" ").slice(1).join(" ");
        const args = argsAsJson
            .split(" ")
            // remove brackets
            .filter((j) => j !== "{" && j !== "}")
            .join(" ")
            // split args by commmas
            .split(",")
            .filter((arg) => arg.trim().length > 0)
            .map((arg) => {
                // name: type
                const split = arg.split(":");
                const splitTypes = split[1].trim().split(" ");
                const typeName = splitTypes[0];
                const typeArguments = splitTypes
                    .slice(1)
                    .map((name) => Type(name, [ ]));

                return TagArg(split[0].trim(), Type(typeName, typeArguments));
            });

        return Tag(tagName, args);
    });

    return Ok(UnionType(Type(name, [ ]), tags));
}

function parseBlock(block: string): Result<string, Syntax> {
    const kind = blockKind(block);

    if (kind.kind === "err") return kind;

    switch (kind.value) {
        case "UnionType": {
            return parseUnionType(block);
        }
    }

    return Err("");
}

export function parse(body: string): Module {
    const blocks = intoBlocks(body);
    const syntax = blocks.map(parseBlock);
    const errors = syntax
        .filter((syn) => syn.kind === "err")
        .map((syn) => (syn as Err<string>).error);

    return Module(
        "main",
        syntax
            .filter((syn) => syn.kind === "ok")
            .map((syn) => (syn as Ok<any>).value),
        errors
    );
}
