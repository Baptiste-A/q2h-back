import { PrismaClient } from '@prisma/client';


import {parse} from "csv-parse"
import * as fs from "fs";
import * as path from "path";
import {PrismaClientValidationError} from "@prisma/client/runtime/library";
import * as console from "console";
const prisma = new PrismaClient()
fs.createReadStream(path.resolve("./scripts/club.csv"))
    .pipe(parse({ delimiter: ",", from_line: 1 }))
    .on("data", async function (row) {
        try {
            await prisma.club.create({
                data: {
                    nom: row[0],
                    lieu: row[1],
                    departement: parseInt(row[2]),
                }
            })
        }catch (e : any){
            if (e instanceof PrismaClientValidationError){
                console.log(row)
            }
        }

    })
