"use strict";

let number = 0;
const bbs = document.querySelector('#bbs');

// APIリクエスト用のヘルパー関数
const apiRequest = async (url, method = "POST", body = {}) => {
    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error(await response.json().then((res) => res.error || 'Error'));
        return await response.json();
    } catch (err) {
        console.error(err.message);
        alert(err.message);
    }
};

// 投稿をHTMLに追加する
const addPostToDOM = (post) => {
    const { id, name, message, likes = 0, comments = [] } = post;

    const cover = document.createElement('div');
    cover.className = 'cover';

    // 名前表示
    const nameArea = document.createElement('span');
    nameArea.className = 'name';
    nameArea.innerText = name;

    // メッセージ表示
    const messageArea = document.createElement('span');
    messageArea.className = 'mes';
    messageArea.innerText = message;

    // いいねボタン
    const likeButton = document.createElement('button');
    likeButton.innerText = `👍 (${likes})`;
    likeButton.addEventListener('click', async () => {
        const res = await apiRequest(`/bbs/${id}/like`);
        if (res) likeButton.innerText = `👍 (${res.likes})`;
    });

    // コメントエリア
    const commentArea = document.createElement('div');
    commentArea.className = 'comments';

    // 既存コメントを追加
    comments.forEach((comment) => {
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerText = comment;
        commentArea.appendChild(commentDiv);
    });

    // コメント入力と送信
    const commentInput = document.createElement('input');
    commentInput.placeholder = 'コメントを追加';
    const commentButton = document.createElement('button');
    commentButton.innerText = '送信';
    commentButton.addEventListener('click', async () => {
        const res = await apiRequest(`/bbs/${id}/comment`, "POST", { comment: commentInput.value });
        if (res) {
            const newComment = document.createElement('div');
            newComment.className = 'comment';
            newComment.innerText = res.comments.slice(-1)[0];
            commentArea.appendChild(newComment);
            commentInput.value = '';
        }
    });

    // 投稿編集ボタン
    const editButton = document.createElement('button');
    editButton.innerText = '編集';
    editButton.addEventListener('click', () => {
        const editInput = document.createElement('input');
        editInput.value = message;
        const saveButton = document.createElement('button');
        saveButton.innerText = '保存';
        saveButton.addEventListener('click', async () => {
            const res = await apiRequest(`/bbs/${id}`, "PUT", { message: editInput.value });
            if (res) {
                messageArea.innerText = res.message;
                cover.removeChild(editInput);
                cover.removeChild(saveButton);
            }
        });
        cover.appendChild(editInput);
        cover.appendChild(saveButton);
    });

    // DOM構成
    cover.append(nameArea, messageArea, likeButton, commentArea, commentInput, commentButton, editButton);
    bbs.appendChild(cover);
};


// 投稿送信
document.querySelector('#post').addEventListener('click', async () => {
    const name = document.querySelector('#name').value;
    const message = document.querySelector('#message').value;

    const res = await apiRequest('/post', "POST", { name, message });
    if (res) {
        document.querySelector('#message').value = '';
    }
});

// 投稿確認・読み込み
document.querySelector('#check').addEventListener('click', async () => {
    const checkRes = await apiRequest('/check');
    if (checkRes && number !== checkRes.number) {
        const readRes = await apiRequest('/read', "POST", { start: number });
        if (readRes && readRes.messages) {
            number += readRes.messages.length;
            readRes.messages.forEach((post) => addPostToDOM(post));
        }
    }
});
