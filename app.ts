import { PrismaClient } from "@prisma/client";
import express from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";

const prisma = new PrismaClient();
const app = express();
app.use(express.json())


app.get('/user', validateRequest({
    query: z.object({
        nameHas: z.string(),
    })
    .strict()
    .partial()
}), async (req, res) => {
    const nameHas = req.query.nameHas;
    try {
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: nameHas,
                }
            }
        })
        res.send(users)
    } catch (err) {
        return res.status(404).send(err);
    }
})


app.post('/user', validateRequest({
    body: z.object({
        name: z.string(),
        email: z.string(),
    })
    .strict()
}), async (req, res) => {

    try {
        const newUser = await prisma.user.create({
            data: {
                ...req.body,
            }
        })
        res.status(201).send(newUser)
    }catch (err) {
        res.status(404).send(err);
    }
});


app.listen(3000, () => {
    console.log("Running on 3000 port");
});