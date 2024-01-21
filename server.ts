import { PrismaClient } from "@prisma/client";
import express, { Request, Response, Router } from "express";
import { z } from "zod";
import { validateRequest } from "zod-express-middleware";
import { encryptPassword, passwordValidation } from "./encryption";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

const prisma = new PrismaClient();
const app = express();
const authController = Router();
dotenv.config();
app.use(express.json())
app.use(authController)

const port = 3000;

const userSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';

const authenticateToken = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) return res.sendStatus(403);
  
      req.body.user = user;
      next();
    });
  };
  

app.post('/signup', async (req: Request, res: Response) => {
    try {
        const { email, password } = userSchema.parse(req.body);

        const hashedPassword = await encryptPassword(password);
        await prisma.user.create({
            data: { email , password: hashedPassword }
        })
        
        res.status(201).send("User created")
    } catch (err) {
        res.status(404).send(err)
    }
});

app.post('/login', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { email, password } = userSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { email: email},
        })

        if (!user) {
            return res.status(404).send('User not found');
        }

        const isValid = await passwordValidation(password, user.password);
        if (!isValid) {
            return res.status(404).send("Invalid credentials");
        }

        const token = jwt.sign({ userId: user.id }, jwtSecret);

        res.json({ token });
    } catch (err) {
        res.status(500).send(err);
    }
})
  
















// find by name or email or username or all of these together
app.get("/user", validateRequest({
    query: z.object({
        nameHas: z.string().optional(),
        emailHas: z.string().optional(),
        userNameHas: z.string().optional()
    })
    .strict()
    .partial(),
}), async (req, res) => {
    const { nameHas, emailHas, userNameHas } = req.query;
    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    nameHas ? { name: { contains: nameHas } } : {},
                    emailHas ? { email: { contains: emailHas } } : {},
                    userNameHas ? { username: { contains: userNameHas } } : {}
                ].filter(Boolean)
            }
        });

        if (users.length === 0) {
            return res.status(404).send("User not found");
        }
        res.status(200).send(users);
    } catch (e) {
        console.error(e);
        res.status(500).send("An error occurred while fetching the user");
    }
});


// find by ID
app.get('/user/:id', validateRequest({
    params: z.object({
        id: z.number()
    })
}), async (req, res) => {
    const id = +req.params.id;

    if (isNaN(id)) {
        return res.status(400).send('Invalid ID');
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: id,
            },
        });
    
        if (!user) {
            return res.status(404).send('User not found');
        }
    
        res.send(user);
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the user');
    }
});

// to create a new user
// app.post('/user', validateRequest({
//     body: z.object({
//         name: z.string().optional(),
//         email: z.string(),
//         password: z.string()
//     })
//     .strict()
// }), async (req, res) => {

//     const { name, email, password } = req.body;
//     const hashedPassword = await encryptPassword(password);

//     try {
//         const newUser = await prisma.user.create({
//             data: {
//                 name,
//                 email,
//                 password: hashedPassword,
//             }
//         })
//         res.status(201).send(`${ newUser.name } successfully created`)
//     }catch (err) {
//         res.status(404).send(err);
//     }
// });

// to update a user
app.patch("/user/:id", validateRequest({
    body: z.object({
        name: z.string(),
        email: z.string().email().optional(),
    })
    .strict()
    .partial(),
}), async (req, res) => {
    const id = +req.params.id;

    try {
        const dataToUpdate = req.body;
        const updateUser = await prisma.user.update({
            where: {
                id: id,
            },
            data: dataToUpdate,
        });
        if (!updateUser) {
            return res.status(404).send("User not found");
        }
        res.status(200).send(`${ updateUser.name } successfully updated`)
        
    } catch (e) {
        return res.status(404).send(e)
    }
})

app.delete("/user/:id", validateRequest({
    params: z.object({
        id: z.string()
    })
}), async (req, res) => {
    const id = +req.params.id;

    if (isNaN(id)) {
        return res.status(400).send('Invalid ID');
    }

    try {

        const deleteUser = await prisma.user.delete({
            where: {
                id: id,
            }
        })

        if (!deleteUser) {
            return res.status(404).send('User not found');
        }

        res.status(200).send(`${ deleteUser.name } successfully deleted`);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching the user');
    }
})


app.listen(port, () => {
    console.log(`listening on port http://localhost:${port}`);
})