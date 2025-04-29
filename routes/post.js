const router = require('express').Router();
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });
        req.userId = decoded.id;
        next();
    });
}

router.post('/', verifyToken, async (req, res) => {
    const newPost = new Post(req.body);
    try {
        const savedPost = await newPost.save();
        res.json(savedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/', async (req, res) => {
    const query = req.query.search;
    try {
        let posts;
        if (query) {
            posts = await Post.find({ title: { $regex: query, $options: 'i' } });
        } else {
            posts = await Post.find();
        }
        res.json(posts);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
            $set: req.body,
        }, { new: true });
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post has been deleted..." });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
