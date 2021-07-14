export type TagArg = {
    kind: "TagArg";
    name: string;
    type: string;
};

export function TagArg(name: string, type: string): TagArg {
    return {
        kind: "TagArg",
        name,
        type,
    };
}

export type Tag = {
    kind: "Tag";
    name: string;
    args: TagArg[];
};

export function Tag(name: string, args: TagArg[]): Tag {
    return {
        kind: "Tag",
        name,
        args,
    };
}

export type UnionType = {
    kind: "UnionType";
    name: string;
    tags: Tag[];
};

export function UnionType(name: string, tags: Tag[]): UnionType {
    return {
        kind: "UnionType",
        name,
        tags,
    };
}

export type SyntaxKinds = "UnionType";
export type Syntax = UnionType;

export type Module = {
    kind: "Module";
    name: string;
    body: Syntax[];
    errors: string[];
};

export function Module(name: string, body: Syntax[], errors: string[]): Module {
    return {
        kind: "Module",
        name,
        body,
        errors,
    };
}
