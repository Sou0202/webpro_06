"use strict";
const express = require("express");
const app = express();
const PORT = 8080;

// 静的ファイルを提供
app.use(express.static('public'));

// サーバー起動（ここで1回だけ呼び出す）
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

let bbs = []; // 投稿データを蓄積
let idCounter = 1; // 投稿 ID 用のカウンタ

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 以下は既存のBBS関連コード
app.post("/check", (req, res) => res.json({ number: bbs.length }));

app.post("/read", (req, res) => {
    const start = Number(req.body.start);
    res.json({ messages: start ? bbs.slice(start) : bbs });
});

app.post("/post", (req, res) => {
  const { name, message } = req.body;
  const post = { 
      id: idCounter++, // 一意の ID を割り当て
      name, 
      message, 
      likes: 0, 
      comments: [] 
  };
  bbs.push(post);
  res.json({ number: bbs.length, id: post.id }); // 新規投稿の ID を返す
});

// 1. いいね機能
app.post("/bbs/:id/like", (req, res) => {
    const postId = Number(req.params.id);
    const post = bbs.find((post) => post.id === postId);

    if (post) {
        // いいねの制限：10を超えないようにする
        if (post.likes >= 10) {
            return res.status(400).json({ success: false, error: "Maximum likes reached" });
        }
        post.likes = (post.likes || 0) + 1;
        res.json({ success: true, likes: post.likes });
    } else {
        res.status(404).json({ success: false, error: "Post not found" });
    }
});


// 2. コメント機能
app.post("/bbs/:id/comment", (req, res) => {
    const postId = Number(req.params.id);
    const { comment } = req.body;
    const post = bbs.find((post, index) => index + 1 === postId);

    if (post) {
        post.comments = post.comments || [];
        post.comments.push(comment);
        res.json({ success: true, comments: post.comments });
    } else {
        res.status(404).json({ success: false, error: "Post not found" });
    }
});

// 3. 投稿編集機能
app.put("/bbs/:id", (req, res) => {
    const postId = Number(req.params.id);
    const { message } = req.body;
    const post = bbs.find((post, index) => index + 1 === postId);

    if (post) {
        post.message = message;
        res.json({ success: true, message: post.message });
    } else {
        res.status(404).json({ success: false, error: "Post not found" });
    }
});