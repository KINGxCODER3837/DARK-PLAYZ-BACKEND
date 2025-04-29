const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const adminEmail = "icefiregod45@gmail.com";
const adminPasswordHash = bcrypt.hashSync("XYZ@123", 10);

User.findOne({ email: adminEmail }).then(user => {
    if (!user) {
        const newUser = new User({ email: adminEmail, password: adminPasswordHash });
        newUser.save();
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token });
});

module.exports = router;
