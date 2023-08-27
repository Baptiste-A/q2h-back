import {PrismaClient} from "@prisma/client";
import fs from "fs";
import path from "path";
import {parse} from "csv-parse";
import {PrismaClientValidationError} from "@prisma/client/runtime/library";
import console from "console";

const prisma = new PrismaClient()
fs.createReadStream(path.resolve("./scripts/lieu.csv"))
    .pipe(parse({ delimiter: ",", from_line: 1 }))
    .on("data", async function (row) {
        try {
            await prisma.lieu.create({
                data: {
                    nom: row[0],
                }
            })
        }catch (e : any){
            if (e instanceof PrismaClientValidationError){
                console.log(row)
            }
        }

    })
