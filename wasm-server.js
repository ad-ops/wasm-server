import { parse } from "https://deno.land/std@0.71.0/flags/mod.ts";
import { Application, Router, send, Status } from "https://deno.land/x/oak@v5.4.0/mod.ts";


const args = parse(Deno.args);
console.dir(args);
const port = args.port || 8000;
const wasmPath = args.wasm;
if (!wasmPath) throw new Error("Expecting arg --wasm to be a file path!");
let wasmModules = await readModules(wasmPath);

const router = new Router();
router
.get("/", (context) => {
  context.response.redirect("/index.html");
})
.get("/modules", (context) => {
  context.response.body = wasmModules;
})
.delete("/modules", async (context) => {
  wasmModules = await readModules(wasmPath);
  context.response.status = Status.NoContent;
})
.post("/:module/:method", (context) => {
  if (context.params && context.params.id) {
    context.response.body = "book" + context.params.id;
  }
})
.get("/:file", async (context) => {
  await send(context, context.request.url.pathname, {
    brotli: true,
    root: `${Deno.cwd()}/static`,
    index: "index.html",
  });
})

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: port });

// const s = serve({ port: port });
// console.log(`Serving on: http://localhost:${port}/`);

// for await (const req of s) {
//   console.log(req);
//   let calcStartTs = performance.now();
//   console.log(wasmModules["main_bg.wasm"].greet());
//   console.log(wasmModules["wasm_bindgen_test.wasm"].add(2, 2));
//   const calculated = wasmModules["fact.wasm"].fac(20);
//   let calcEndTs = performance.now();
//   console.log("serving request and calculated using wasm:", calculated, "it took:", calcEndTs - calcStartTs);
//   req.respond({ body: `Hello World!\n By the way the factorial of 4 is ${calculated}\n` });
// }

async function readModules(path) {
  const startTs = performance.now();
  const wasmModules = {};
  const wasmDir = Deno.readDir(path);
  for await (const entry of wasmDir) {
    if (entry.isFile) {
      const wasmCode = await Deno.readFile(path + "\\" + entry.name);
      console.log(entry.name, wasmCode.byteLength, "bytes");
      const wasmModule = new WebAssembly.Module(wasmCode);
      console.log(WebAssembly.Module.exports(wasmModule));
      console.log(WebAssembly.Module.imports(wasmModule));
  
      const importObject = {};
      for (const imports of WebAssembly.Module.imports(wasmModule)) {
        importObject[imports.module] = importObject[imports.module] || {};
        importObject[imports.module][imports.name] = (arg) => console.log(arg);
      }
      const wasmInstance = new WebAssembly.Instance(wasmModule, importObject);
      wasmModules[entry.name] = wasmInstance.exports;
    }
  }
  const instansiatedWasmTs = performance.now();
  console.log("Time to instansiate wasm files", instansiatedWasmTs - startTs, "ms");
  return wasmModules;
}