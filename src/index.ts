import { createDbWorker } from "sql.js-httpvfs";

const workerUrl = new URL(
  "sql.js-httpvfs/dist/sqlite.worker.js",
  import.meta.url
);
const wasmUrl = new URL("sql.js-httpvfs/dist/sql-wasm.wasm", import.meta.url);

//type Entry = { [propKey: string]: string };
//entry: { year: string, author: string, diary_entry : string }

interface Entry {
    author: string;
    year: string;
    diary_entry: string;
}

async function load() {
  const worker = await createDbWorker(
    [
      {
        from: "inline",
        config: {
          serverMode: "full",
          url: "../data.db",
          requestChunkSize: 4096,
        },
      },
    ],
    workerUrl.toString(),
    wasmUrl.toString()
  );

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0; so +1
    var yyyy = today.getFullYear();

    console.log(dd)

    for (var author of ["kafka", "goethe"]) {
        document.getElementById("h_".concat(author))!.innerHTML = author;

        const entries = await worker.db.query(`SELECT author,year,month,diary_entry FROM data WHERE author='${ author }' and month='${ mm }' and day='${ dd }' `)

        //for (const entry in entries) {
        for (var i = 0; i < entries.length; i++) { 
            let e =  entries[i]

            // @ts-ignore
            let y = e["year"]

            // @ts-ignore
            let diary_entry = e["diary_entry"]
            
            // @ts-ignore
            let author = e["author"]

            var div = document.getElementById(author);

            div!.innerHTML += `<i> Heute vor ${yyyy-y} Jahren </i>  <br>`;
            div!.innerHTML += y;
            div!.innerHTML += "<br>";
            div!.innerHTML += diary_entry;
            div!.innerHTML += "<br> <br> <br>";
        }

        //document.getElementById(author)!.innerHTML = JSON.stringify(entries);
    }


}

load();
