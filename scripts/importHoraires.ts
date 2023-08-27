import {PrismaClient} from "@prisma/client";
import * as console from "console";

const prisma = new PrismaClient()

const horaires = [
    '8h30',
    '10h15',
    '14h30',
    '16h15',
    '14h',
    '15h15',
    '16h30',
]
async function load(){
    for (const horaire of horaires) {
        const dbHoraire = await prisma.horaire.findFirst({
            where: {heure: horaire}
        })
        if (dbHoraire === null) {
            await prisma.horaire.create({
                data: {heure: horaire}
            })
        }
    }
}

load().then(t => console.log("horaires importé"))
