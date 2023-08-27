import { PrismaClient ,Distance} from '@prisma/client';


import {parse} from "csv-parse"
import * as fs from "fs";
import * as path from "path";
import {PrismaClientValidationError} from "@prisma/client/runtime/library";
import * as console from "console";
const prisma = new PrismaClient()
fs.createReadStream(path.resolve("./scripts/c.csv"))
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", async function (row) {
        const categ =  await prisma.categorie.findFirst({where: {nom:  row[0]}})
        if (categ === null){

            // création de la categorie
            const categorie = await prisma.categorie.create({
                data: {
                    nom: row[0],
                    age_min: parseInt(row[4]),
                    age_max: row[5] === row[4] ? null : parseInt(row[5]),
                    sexe: row[1] === 'f' ? 'Femme': 'Homme'
                }
            })
            let distanceEntities : Distance[]
            let distances = row[3].split(';')
            let pattern = row[2].split(';')
            for (let i = 0; i < pattern.length ; i++){
                await prisma.distance.create({
                    data: {
                        nb_coup : parseInt(pattern[i]),
                        ordre: i + 1,
                        distance: parseFloat(distances[i].replace(',', '.')),
                        categorieId: categorie.id
                    }
                })
            }
        }
    })
