
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;


const mongoURI = "mongodb+srv://ysuraj18333:SrjCart@cluster0.abj2bd8.mongodb.net/";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(cors());

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    quantity: { type: Number, required: true },
});


const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    // email: { type: String, required: true },
    cart: [cartItemSchema],
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);


app.post('/signup', async (req, res) => {
    try {
        const { username, password, phone, email } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }


        const newUser = new User({ username, password, phone, email, cart: [] });
        await newUser.save();

        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid credentials' });
        } else {
            if (existingUser.password == password) {
                return res.status(200).json({ message: 'Login successful', user: existingUser });
            }
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }

})




const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    // Additional admin-related fields can be added here
});

const Admin = mongoose.model('Admin', adminSchema);

app.post('/admin-signup', async (req, res) => {
    try {
        const { username, password, phone, email } = req.body;

        const existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Admin username already exists' });
        }

        const newAdmin = new Admin({ username, password, phone, email });
        await newAdmin.save();

        res.status(201).json({ message: 'Admin signup successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



app.post('/add-to-cart', async (req, res) => {
    try {
        const { username, productId, quantity } = req.body;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existingCartItemIndex = user.cart.findIndex(item => item.productId === productId);

        if (existingCartItemIndex !== -1) {

            user.cart[existingCartItemIndex].quantity += quantity;
        } else {

            user.cart.push({ productId, quantity });
        }


        await user.save();

        res.status(200).json({ message: 'Item added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
