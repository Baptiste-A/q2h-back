import passport from "passport";
import {PrismaClient} from "@prisma/client";
import {Request} from "express";
import {Strategy as CustomStrategy} from 'passport-custom'
import * as jwt from 'jsonwebtoken'
import console from "console";


var cookieExtractor = (req: Request)  =>{
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['token'];
    }
    console.log(token)
    return token;
};
const  JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {

    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: 'caca',
    issuer: "quilles2huit.fr",
    audience: "quilles2huit.fr",
}

const prisma = new PrismaClient()
passport.use(new JwtStrategy(opts, async function(jwt_payload: any, done: any) {
    await prisma.$connect()
    const user = await prisma.user.findUnique({where: {identifiant: jwt_payload.identifiant}})
    if (user) {
        return done(null, user);
    } else {
        return done(null, false);
    }
}));


export default passport
