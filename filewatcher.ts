import { parse } from "https://deno.land/std@0.71.0/flags/mod.ts";

const args = parse(Deno.args);
console.dir(args);
const url = args.url;
if (!url) throw new Error("Expecting arg --url");
const wasmPath = args.wasm;
if (!wasmPath) throw new Error("Expecting arg --wasm to be a file path!");
const watcher = Deno.watchFs(wasmPath);
for await (const event of watcher) {
    console.log(">>>> event", event);
    fetch(url, {method: "DELETE"})
        .then((response) => {
            console.log(response.status);
        })
        .catch((error) => {
            console.error(error);
        });
}