import app from "~/app";


app.listen(3002, () => console.log('Silence, ça tourne en '+process.env.NODE_ENV+' \n BASE : '+ process.env.DATABASE_URL))
