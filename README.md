# Deno WebAssembly Loader
Simple Deno app to instansiate wasm in a dir and then expose the methods as APIs.

## wasm-server
Http server which reads wasm-files, instansiates them and exposes them as APIs. It offers an API to reinstansiate the wasm-files.

Run with:
`deno run --allow-read --allow-net .\wasm-server.js --port 8080 --wasm .\modules`

## filewatcher
Listens to events in a dir and sends reinstansiate request to wasm-server.

Run with:
`deno run --allow-read --allow-net .\filewatcher.ts --url http://localhost:8080/modules --wasm .\modules`