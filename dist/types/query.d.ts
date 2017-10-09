declare class Query {
    Out<T>(): T | null;
    OutMany<T>(): T[] | null;
    Scan(): void;
}
