const express = require('express');
const { authMiddleware } = require('../middleware');
const {User , Account} = require('../Schema/db')
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const router = express.Router();

router.get('/balance', authMiddleware ,async (req,res)=>{
    
    const newUser = await Account.findOne({userId: req.userId});

    res.status(200).json({balance: newUser.balance});
    
})

// transaction route for atomic transaction
router.post('/transfer',authMiddleware, async (req,res)=>{

    // creating session
    const session = await mongoose.startSession();

    session.startTransaction();

    const { amount,to } = req.body;

    // Fetch the accounts within the transaction
    const account = await Account.findOne({ userId: req.userId}).session(session);


    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Insuficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({
            message: "Invalid Account"
        });
    }

    //perform transfer
    await Account.updateOne({ userId: req.userId }, { $inc: {balance: -amount }}).session(session);
    await Account.updateOne({ userId: to }, {$inc: {balance: amount}}).session(session);

    //commit the transaction
    await session.commitTransaction();

    res.json({
        message: "Transaction Successful"
    })
})

module.exports = router;