document.addEventListener('DOMContentLoaded', (event) => {
    loadPosts();
});

const deletePassword = "hamsterisfood"; // 삭제 비밀번호 설정
let postToDeleteIndex = null; // 삭제할 게시물 인덱스를 저장

function addPost() {
    const postContent = document.getElementById('postContent').value;
    if (postContent.trim() === '') {
        alert('글을 작성하세요.');
        return;
    }

    const post = {
        content: postContent,
        likes: 0,
        dislikes: 0
    };

    savePost(post);
    document.getElementById('postContent').value = '';
    updateCharacterCount(); // 글 작성 후 남은 글자 수 업데이트
    loadPosts();
}

function savePost(post) {
    const posts = getPosts();
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

function getPosts() {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
}

function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';

    const posts = getPosts();
    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <p>${post.content}</p>
            <div class="vote-buttons">
                <span id="likes-${index}">추천: ${post.likes}</span>
                <button onclick="vote(${index}, 'like')">추천</button>
                <span id="dislikes-${index}">비추천: ${post.dislikes}</span>
                <button onclick="vote(${index}, 'dislike')">비추천</button>
            </div>
            <div class="delete-button">
                <button onclick="showModal(${index})">삭제</button>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

function vote(postIndex, type) {
    const posts = getPosts();
    if (type === 'like') {
        posts[postIndex].likes += 1;
    } else if (type === 'dislike') {
        posts[postIndex].dislikes += 1;
    }
    localStorage.setItem('posts', JSON.stringify(posts));
    loadPosts();
}

function showModal(postIndex) {
    postToDeleteIndex = postIndex; // 삭제할 게시물 인덱스를 저장
    document.getElementById('passwordModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('passwordModal').style.display = 'none';
}

function confirmDelete() {
    const inputPassword = document.getElementById('deletePassword').value;
    if (inputPassword === deletePassword) {
        deletePost(postToDeleteIndex);
        closeModal();
    } else {
        alert('비밀번호가 올바르지 않습니다.');
    }
}

function deletePost(postIndex) {
    const posts = getPosts();
    posts.splice(postIndex, 1);
    localStorage.setItem('posts', JSON.stringify(posts));
    loadPosts();
}

function updateCharacterCount() {
    const maxChars = 200;
    const postContent = document.getElementById('postContent').value;
    const charCount = document.getElementById('charCount');
    charCount.textContent = `남은 글자 수: ${maxChars - postContent.length}`;
}
const db = firebase.firestore();

// 글 작성 함수
function submitPost() {
  const postContent = document.getElementById('postContent').value;
  if (postContent.trim() === '') {
    alert('글을 작성해주세요.');
    return;
  }

  // Firestore에 글 저장
  db.collection("posts").add({
    content: postContent,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    alert('글이 작성되었습니다.');
    loadPosts(); // 게시글 목록 갱신
  })
  .catch((error) => {
    console.error("Error adding document: ", error);
  });
}

// 게시글 목록 불러오기
function loadPosts() {
  const postsContainer = document.getElementById('postsContainer');
  postsContainer.innerHTML = ''; // 기존 내용 지우기

  db.collection("posts")
    .orderBy("timestamp", "desc")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
          <p>${post.content}</p>
        `;
        postsContainer.appendChild(postElement);
      });
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

// 페이지 로딩 시 게시글 불러오기
window.onload = loadPosts;
