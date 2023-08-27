import {Router} from "express";

import passport from "~/strategies/passport";
import {PrismaClient} from "@prisma/client";
import {User} from "@prisma/client"
import console from "console";

const CartonController = Router()
const prisma = new PrismaClient()
CartonController.use(passport.authenticate('jwt', {session: false}))



CartonController.get('/categories', async (req, res) => {
    const user = req.user as User
    const categories =  await prisma.categorie.findMany({
        where:{
          sexe: user.sexe
        },
        orderBy: {nom: 'asc'}})
    res.json(categories)
})
export default CartonController
