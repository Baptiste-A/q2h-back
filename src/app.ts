import cors from 'cors'
import * as timers from "timers";
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import express from 'express'
import moment from "moment";
import {body, validationResult} from "express-validator";
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client';
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import * as console from "console";


const bodyParser = require('body-parser')
const config = dotenv.config()

const prisma = new PrismaClient()
/**
 * On créé une nouvelle "application" express
 */
const app = express()

/**
 * On dit à Express que l'on souhaite parser le body des requêtes en JSON
 *
 * @example app.post('/', (req) => req.body.prop)
 */
app.use(express.json())
/**
 * On dit à Express que l'on souhaite autoriser tous les noms de domaines
 * à faire des requêtes sur notre API.
 */
app.use(cors({origin: /(localhost|quilles2huit\.fr$)/, credentials:true}))

/**
 * Toutes les routes CRUD pour les animaux seronts préfixées par `/pets`
 */
//app.use('/batch', BatchController)
//app.use('/makers', MakerController)
//app.use('/marketplace', MarketPlaceController)

/**
 * Homepage (uniquement necessaire pour cette demo)
 */
app.get('/', (req, res) => res.send('🏠'))

app.use(bodyParser.urlencoded({extended :true}))
/**
 * Pour toutes les autres routes non définies, on retourne une erreur
 */
//app.all('*', UnknownRoutesHandler)
app.post('/register',
    body('identifiant')
        .notEmpty(),
    body('nom').isLength({min:2 , max:50 })
        .not().isEmpty(),
    body('prenom')
        .isLength({min:2 , max:50 })
        .not()
        .isEmpty(),
    body('password')
        .isLength({min: 8}),
    body('sexe').notEmpty(),
    body('licence').not().isEmpty()
    ,async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('new registration',req.body)
            return res.status(400).json({ errors: errors.array() });
        }
        await prisma.$connect()
        console.log('new registration',req.body)
        req.body.password = await bcrypt.hash(req.body.password, 10)
        req.body.date_naissance = moment(req.body.date_naissance).toISOString()
        try {

            const user = await prisma.user.create({data: req.body})
            //await fsPromise.mkdir(__dirname+`/../upload/${user.id}/bikes`, {recursive: true})

            //await sendRegisterEmail(user)
            res.status(201)
            res.send()

        }
        catch (e:any) {
            if (e instanceof PrismaClientKnownRequestError){
                if (e.code === 'P2002') {
                    console.log(
                        'There is a unique constraint violation, a new user cannot be created with this email'
                    )
                    res.json({error: 'un compte existe déja avec cette adresse email'})
                }
            }else {
                console.log(e)
            }

        }

    })



/**
 * Route pour la réinitialisation du mot de passe
 *//*
app.post('/resetpass', async (req, res) => {
    //logger.info("ask reset pass called", {headers: req.headers, ip: req.ip})
    const today = new Date();
    await prisma.$connect()
    const user = await prisma.user.findUnique({
        where:{email: req.body.email},
        include: {PassReset: true}
    })

    let ip = 'x-real-ip' in req.headers ?  req.headers['x-real-ip'] : req.ip
    const resp = await axios.post(`http://ip-api.com/json/${ip}`)
    const ipInfo = resp.data
    if (user){
        if (user.PassReset !== null){
            await prisma.passReset.delete({where: {userId: user.id}})
        }
        // suppression des anciens
        const expirationDate = moment().add(2,"hours").toDate()
        const passReset = await prisma.passReset.create({data: {userId: user.id, expireAt:expirationDate}})

        const context = {
            user: user,
            link: process.env.FRONT_URL + '/resetpass/' + passReset.id,
            year: (new Date()).getFullYear(),
            hour: `${today.toLocaleString('fr-FR')}`,
            ipInfo: undefined
        }
        if (ipInfo.status !== 'fail'){
            context.ipInfo = resp.data
        }
        let mail = {
            to: req.body.email,
            template: 'resetpass',
            context,
            subject: "Réinitialisation de votre mot de passe",
            attachments: [{
                filename: 'icon.png',
                path: path.resolve('templates/mails/img/icon.png'),
                cid: 'icon'
            },
                {
                    filename: 'heasder-bg.png',
                    path: path.resolve('templates/mails/img/heasder-bg.png'),
                    cid: 'header'
                },
                {
                    filename: 'vrooom.png',
                    path: path.resolve('templates/mails/img/vrooom.png'),
                    cid: 'vrooom'
                }]
        }
        try {
            if (process.env.NODE_ENV !== 'test'){
                await transport.sendMail(mail)
            }
        }catch (e){
            //logger.error('unable to send reset pass email', {reason: e})
            res.status(404)
                .send()
        }

    }
    res.status(200)
        .send({})
})

app.route('/resetpass/:id')
    .get(async (req, res) => {
        const resp = {
            error: false
        }
        await prisma.$connect()
        const passReset = await prisma.passReset.findUnique({where:{id: req.params.id}})
        if (passReset){
            const expireAt = moment(passReset.expireAt)
            if (moment().diff(expireAt) > 0){
                // lien expirer
                resp.error = true

            }
        }else {
            resp.error = true
        }
        res.json(resp)


    })
    .post(async (req, res) => {
        await prisma.$connect()
        const passReset = await prisma.passReset.findUnique({where:{id: req.params.id}})
        console.log(passReset)
        console.log(req.params.id)
        if (passReset) {
            await prisma.user.update({where:{id: passReset.userId}, data:{password: await bcrypt.hash(req.body.password, 10)}})
            await prisma.passReset.delete({where: {id: passReset.id}})
            res.status(200)
            res.send()
        }


    })
    */
app.post('/login', async (req, res, nextPassReset) => {
    //logger.info('login', req.body.email)
    await prisma.$connect()
    const user =await prisma.user.findFirst({where:{identifiant: req.body.identifiant}})

    if (user != null && user.password !== null){
        //logger.info('user found', {user: user?.email})
        let ok = await bcrypt.compare(req.body.password, user.password)
        if (ok){
            //logger.info('login success')
            let token = jwt.sign({identifiant:user.identifiant},'caca', {expiresIn: "24h",issuer: "quilles2huit.fr", audience: "quilles2huit.fr"})
            res.cookie('token', token, {domain: process.env.NODE_ENV === 'development' ? 'localhost': 'quilles2huit.fr'})
                .json({token})


        }else{
            //logger.info("login failed", {reason: 'bad password'})
            res.status(200)
            res.json({status:false})
        }
    }
    else {
        //logger.info("login failed", {reason: 'user not found'})
        res.status(200)
        res.json({status:false})
    }

})
/*
app.post('/logout',(req, res) => (res.status(200).send()))
*//**
 * Gestion des erreurs
 * /!\ Cela doit être le dernier `app.use`
 */
//app.use(ExceptionsHandler)

export default app
/**
 * On demande à Express d'ecouter les requêtes sur le port défini dans la config
 */
