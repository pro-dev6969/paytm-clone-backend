const express = require('express');
const {User , Account} = require('../Schema/db')
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require('../config');
const {authMiddleware} = require('../middleware');

const app = express();
const z = require('zod');

app.use(express.json());

const router = express.Router();



const newUser = z.object({
    username:z.string().email(),
    firstname: z.string(),
    lastName: z.string(),
    password: z.string(),
})

router.post('/signup',async (req,res)=>{
    const {username , firstName , lastName , password} = req.body;

    const parseData = newUser.safeParse({username:username , firstName:firstName , lastName:lastName , password:password});

    if(!parseData){
        return res.status(411).json({
            msg: 'email already taken / invalid inputs'});
    }
    
    const existingUser = await User.findOne({
        username: username,
    })

    if(existingUser){
        return res.status(411).json({
            msg: "email already taken / invalid inputs"
        })
    }

    const user = await User.create({
        username:username,
        firstName:firstName,
        lastName:lastName,
        password:password,
    })

    const userId = user._id;

    // assigning a random account details

    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        msg: "User Created Successfully",
        token: token
    })

})

const signinBody = z.object({
    username: z.string().email(),
    password: z.string(),
})

router.post('/signin' ,async (req,res)=>{
    const {username , password} = req.body;

    const parseData = signinBody.safeParse(req.body)

    if(!parseData.success){
        return res.status(411).json({
            message: "invalid user inputs",
        })
    }

    const user = await User.findOne({
        username,
        password
    });

    if(!user){
        return res.status(411).json({message: "user does not exist"});
    }

    if((user.username !== username ) || (user.password !== password )){
        return res.status(411).json({message: "invalid username and password combination"});
    }

    const userId = user._id;
    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.status(200).json({
        message: "successfully logged in" , token
    })
    return;
})

const updateBody = z.object({
	password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

router.put('/', authMiddleware ,async (req,res)=>{
    const newData = req.body;
    const parseData = updateBody.safeParse(newData);

    if(!parseData.success){
        return res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne({_id: req.userId}, newData);

    res.status(200).json({
        message: "Updated Successfully !"
    })

    return;
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;