import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import image1 from './images/img1.jpg';  // 导入图片
import image2 from './images/img2.jpg';
import image3 from './images/img3.jpg';
import image4 from './images/img4.jpg';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Dropdown, Button } from 'react-bootstrap';


function Main({ setIsLoggedIn, username }) {
    const [articles, setArticles] = useState([]);
    const [newArticle, setNewArticle] = useState('');
    const [headline, setHeadline] = useState('');
    const [newheadline, setnewHeadline] = useState('');
    const [staticArticles, setstaticArticles] = useState([]);
    const [followers, setFollowers] = useState([]);
    const navigate = useNavigate();
    //const [userId, setUserId] = useState(null);
    const [avatar, setAvatar] = useState('');
    const [currentPage, setCurrentPage] = useState(1); // 当前页码
    const postsPerPage = 5; // 每页显示的文章数
    const [newArticleImage, setnewArticleImage] = useState(null);
    const [newArticleTitle, setNewArticleTitle] = useState('');
    const [addUserSearch, setAddUserSearch] = useState('');
    const [searchField, setSearchField] = useState('');
    const [isEditing, setIsEditing] = useState(false); // 是否处于编辑状态
    const [editingContent, setEditingContent] = useState(''); // 当前编辑的内容
    const [editingType, setEditingType] = useState(null); // 编辑类型 ('article' 或 'comment')
    const [editingId, setEditingId] = useState(null); // 当前正在编辑的文章或评论 ID
    const [editingParentId, setEditingParentId] = useState(null); // 如果是评论，存储其父文章 ID

    const [newComment, setNewComment] = useState({});
    const sortedArticles = [...articles].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = sortedArticles.slice(indexOfFirstPost, indexOfLastPost);




    useEffect(() => {
        const fetchHeadline = async () => {
            try {
                const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/headline', {
                    method: 'GET',
                    credentials: 'include',
                });
                const responseAvatar = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/avatar', {
                    method: 'GET',
                    credentials: 'include',
                });


                const avatardata = await responseAvatar.json();
                if(avatardata.avatar===''){
                    setAvatar(image4);
                }else if(avatardata.avatar){
                    setAvatar(avatardata.avatar);
                }else{
                    alert(avatardata.error);
                }

                const data = await response.json();
                if(data.username){
                    //console.log("success find headline!")
                    setHeadline(data.headline);
                }else{
                    alert(data.error);
                }


                 // 使用后端返回的数据设置 headline
            } catch (error) {
                console.error('Error fetching headline:', error);
                setHeadline('Failed to load headline'); // 设置默认值以防出错
            }
        };

        fetchHeadline();
    }, []); // 空依赖数组，确保只在组件加载时调用一次



    useEffect(() => {
        const fetchFollowersAndArticles = async () => {
            try {
                // 获取关注列表
                const followersResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/following/${username}`, {
                    method: 'GET',
                    credentials: 'include', // 确保发送 Cookie
                });

                const followersData = await followersResponse.json();
                let allAuthors = [username]; // 包括当前用户自己
                const followersList = []; // 用于存储完整的关注者信息

                if (followersData.following) {
                    const followingUsernames = followersData.following;

                    // 遍历每个用户名，获取 headline 和 avatar
                    for (const followerUsername of followingUsernames) {
                        try {
                            // 获取 headline
                            const headlineResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/headline/${followerUsername}`, {
                                method: 'GET',
                                credentials: 'include', // 确保发送 Cookie
                            });
                            const headlineData = await headlineResponse.json();

                            // 获取 avatar
                            const avatarResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/avatar/${followerUsername}`, {
                                method: 'GET',
                                credentials: 'include', // 确保发送 Cookie
                            });
                            const avatarData = await avatarResponse.json();

                            if (headlineResponse.ok && avatarResponse.ok) {
                                // 将 follower 信息合并到列表
                                followersList.push({
                                    follower: followerUsername,
                                    headline: headlineData.headline || '',
                                    avatar: avatarData.avatar || image4, // 如果没有头像，设置为 null
                                });
                                allAuthors.push(followerUsername); // 加到作者列表
                            }
                        } catch (error) {
                            console.error(`Error fetching data for follower ${followerUsername}:`, error);
                        }
                    }


                }
                setFollowers(followersList);

                // 获取每个作者的文章并合并到文章列表
                const allArticles = [];
                for (const author of allAuthors) {
                    const articlesResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/articles/${author}`, {
                        method: 'GET',
                        credentials: 'include', // 确保发送 Cookie
                    });

                    const articlesData = await articlesResponse.json();

                    if (articlesResponse.ok && articlesData.articles) {
                        const mappedArticles = articlesData.articles.map(article => ({
                            id: article.id,
                            title: article.title,
                            body: article.text,
                            timestamp: new Date(article.created), // 将后端的创建时间转换为 Date 对象
                            author: article.author,
                            image: article.image || null, // 如果有图片字段则显示
                            comments: article.comments || [],
                        }));

                        allArticles.push(...mappedArticles);
                    } else if (articlesData.error !== 'No articles') {
                        console.error(`Failed to fetch articles for ${author}:`, articlesData.error);
                    }
                }

                allArticles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // 按时间排序
                setArticles(allArticles);
                setstaticArticles(allArticles);
            } catch (error) {
                console.error('Error fetching followers and articles:', error);
            }
        };

        fetchFollowersAndArticles();
    }, []); // 空依赖数组确保只在组件加载时调用一次


    const handleEditClick = (type, id, parentId, currentContent) => {
        setIsEditing(true);
        setEditingType(type); // 'article' 或 'comment'
        setEditingId(id); // 当前文章或评论 ID
        setEditingParentId(parentId || null); // 如果是评论，设置其父文章 ID
        setEditingContent(currentContent); // 设置当前内容
    };

    const handleConfirmEdit = async () => {
        try {
            const url =
                editingType === 'article'
                    ? `https://xinyuserver-0542e75f2d7c.herokuapp.com/articles/${editingId}`
                    : `https://xinyuserver-0542e75f2d7c.herokuapp.com/articles/${editingParentId}`;
            const body =
                editingType === 'article'
                    ? { text: editingContent }
                    : { text: editingContent, commentId: editingId };

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (response.ok) {
                if (editingType === 'article') {
                    setArticles((prevArticles) =>
                        prevArticles.map((article) =>
                            article.id === editingId ? { ...article, body: editingContent } : article
                        )
                    );
                    setstaticArticles(articles);
                } else if (editingType === 'comment') {
                    setArticles((prevArticles) =>
                        prevArticles.map((article) =>
                            article.id === editingParentId
                                ? {
                                    ...article,
                                    comments: article.comments.map((comment) =>
                                        comment.id === editingId
                                            ? { ...comment, text: editingContent }
                                            : comment
                                    ),
                                }
                                : article
                        )
                    );
                    setstaticArticles(articles);
                }
                setIsEditing(false);
                setEditingContent('');
            } else {
                console.error('Error updating content:', data.error);
            }
        } catch (error) {
            console.error('Error updating content:', error);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingContent('');
    };



    const handleLogout = () => {
        setIsLoggedIn(false);

        //localStorage.removeItem('username');
        navigate('/');
    };
    const handleclear=()=>{
        setNewArticleTitle('');
        setNewArticle('');
        setnewArticleImage(null);
    }



    const handlePostArticle = async (e) => {
        e.preventDefault();

        // 检查是否填写了必要的文章信息
        if (!newArticle) {
            alert('Text content are required.');
            return;
        }


        try {
            let imageUrl = '';
            if (newArticleImage) {
                const formData = new FormData();
                formData.append('image', newArticleImage); // 添加图片文件
                const imageResponse = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/uploadImage', {
                    method: 'PUT',
                    credentials: 'include',
                    body: formData,
                });

                const imageData = await imageResponse.json();

                if (imageResponse.ok) {
                    imageUrl = imageData.image;
                } else {
                    console.error('Image upload failed:', imageData.error);
                    alert('Failed to upload image.');
                    return;
                }
            }


            // 向后端发送请求，添加新文章
            const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/article', {
                method: 'POST',
                credentials: 'include', // 确保发送 Cookie
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newArticleTitle,
                    text: newArticle,
                    image: imageUrl, // 图片 URL
                }),
            });

            const data = await response.json();

            if (response.ok && data.articles) {
                // 将返回的新文章添加到本地文章列表
                const newArt = data.articles.map(article => ({
                    id: article.id,
                    title: article.title,
                    body: article.text,
                    timestamp: new Date(article.created), // 将后端的创建时间转换为 Date 对象
                    author: article.author,
                    image: article.image || null, // 如果有图片字段则显示
                    comments: article.comments || [],
                }));
                setArticles(prevArticles => [...newArt, ...prevArticles]);
                setstaticArticles(articles);
                setNewArticle(''); // 清空输入框
                setNewArticleTitle('');
                setnewArticleImage(null);
            } else {
                alert(data.error || 'Failed to post article.');
            }
        } catch (error) {
            console.error('Error posting article:', error);
            alert('An error occurred while posting the article.');
        }
    };



    const handleUnfollow = async (followerId) => {
        try{
            const response = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/following/${followerId}`, {
                method: 'DELETE',
                credentials: 'include', // 确保发送 Cookie
            });
            const data = await response.json();

            if (response.ok) {
                // 更新前端关注者列表
                if (data.following) {
                    setFollowers(prevFollowers =>
                        prevFollowers.filter(following => following.follower !== followerId)
                    );

                    // 获取新关注用户的文章并更新文章列表
                    setArticles(prevArticles =>
                        prevArticles.filter(article => article.author !== followerId)
                    );
                    setstaticArticles(articles);

                }

            }else {
                console.error('Failed to unfollow user:', data.error);
            }
        }catch (error) {
            console.error('Error during follow operation:', error);
        }
         };
    const handleSearchUserToFollow = async () => {
        if(addUserSearch===username){
            alert('You cannot follow yourself!');
            setAddUserSearch('');
            return;
        }
        try {
            // 调用后端 API 添加关注
            const response = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/following/${addUserSearch}`, {
                method: 'PUT',
                credentials: 'include', // 确保发送 Cookie
            });

            const data = await response.json();

            if (response.ok) {
                const followersList = []; // 用于存储完整的关注者信息
                // 更新前端关注者列表
                if(data.following){
                    if (data.following) {
                        const followingUsernames = data.following;

                        // 遍历每个用户名，获取 headline 和 avatar
                        for (const followerUsername of followingUsernames) {
                            try {
                                // 获取 headline
                                const headlineResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/headline/${followerUsername}`, {
                                    method: 'GET',
                                    credentials: 'include', // 确保发送 Cookie
                                });
                                const headlineData = await headlineResponse.json();

                                // 获取 avatar
                                const avatarResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/avatar/${followerUsername}`, {
                                    method: 'GET',
                                    credentials: 'include', // 确保发送 Cookie
                                });
                                const avatarData = await avatarResponse.json();

                                if (headlineResponse.ok && avatarResponse.ok) {
                                    // 将 follower 信息合并到列表
                                    followersList.push({
                                        follower: followerUsername,
                                        headline: headlineData.headline || '',
                                        avatar: avatarData.avatar || image4, // 如果没有头像，设置为 null
                                    });

                                }
                            } catch (error) {
                                console.error(`Error fetching data for follower ${followerUsername}:`, error);
                            }
                        }


                    }
                    setFollowers(followersList);




                    // 获取新关注用户的文章并更新文章列表
                    const newArticlesResponse = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/articles/${addUserSearch}`, {
                        method: 'GET',
                        credentials: 'include',
                    });

                    const newArticlesData = await newArticlesResponse.json();

                    if (newArticlesResponse.ok) {
                        //console.log(newArticlesData.articles);
                        if(newArticlesData.articles){
                            const newArt = newArticlesData.articles.map(article => ({
                                id: article.id,
                                title: article.title, // 默认值处理
                                body: article.text, // 默认值处理
                                timestamp: article.created ? new Date(article.created) : new Date(), // 确保有 timestamp
                                author: article.author , // 默认值处理
                                image: article.image || null, // 如果没有图片，设置为 null
                                comments:article.comments || [],
                            }));
                            setArticles(prevArticles => [...newArt, ...prevArticles]);
                            setstaticArticles(articles);
                        }

                    }
                    else {
                        console.error('Failed to fetch new articles:', newArticlesData.error);
                    }
                }else if(data.error ==='User not found'){
                    alert('User not found');
                }else if(data.error ==='User already followed'){
                    alert('User already followed');
                }

                setAddUserSearch('');
            } else {
                console.error('Failed to follow user:', data.error);
            }
        } catch (error) {
            console.error('Error during follow operation:', error);
        }
    };


    const handleUpdateHeadline= async () => {
        try {
            const response = await fetch('https://xinyuserver-0542e75f2d7c.herokuapp.com/headline', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // 确保 Cookie 被发送和存储
                body: JSON.stringify({ headline:newheadline }), // 将用户名和密码传给后端
            });

            const data = await response.json();

            if (data.headline) {

                setHeadline(data.headline);
                setnewHeadline('');
            } else {
                // 登录失败
                console.error(data.error);
            }
        } catch (err) {
            console.error('Something went wrong. Please try again later.');
        }



    };



    const handleAddComment = async (articleId) => {
        if (!newComment[articleId] || newComment[articleId].trim() === '') return;

        try {
            const response = await fetch(`https://xinyuserver-0542e75f2d7c.herokuapp.com/articles/${articleId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ text: newComment[articleId], commentId: -1 }),
            });

            const data = await response.json();
            if (response.ok) {
                setArticles((prevArticles) =>
                    prevArticles.map((article) =>
                        article.id === articleId
                            ? { ...article, comments: data.articles[0].comments }
                            : article
                    )
                );
                setstaticArticles(articles);
                setNewComment((prev) => ({ ...prev, [articleId]: '' })); // 清空输入框
            } else {
                console.error('Error adding comment:', data.error);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };


    const handleSearch = () => {
        const filteredArticles = staticArticles.filter(article => {
            //const author = users.find(user => user.id === article.userId)?.username || 'Unknown Author';
            return (
                article.title.includes(searchField) ||
                article.body.includes(searchField) ||
                article.author.toLowerCase().includes(searchField.toLowerCase())
            );
        });
        setArticles(filteredArticles);
        setSearchField('');
    };
    /**
    const filteredArticles = articles.filter(article =>{
        const author = users.find(user => user.id === article.userId)?.username || 'Unknown Author';
        return (
            article.title.includes(searchTerm) ||
            article.body.includes(searchTerm) ||
            author.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);
    **/
    //const filteredArticles = articles.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    //console.log(filteredArticles);
    //console.log(users);
    return (

        <div className="container mt-4">
            <Navbar bg="light" expand="lg" className="mb-4">
                <Navbar.Brand>Welcome, {username}</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link onClick={() => navigate('/profile')}>Profile</Nav.Link>

                        <Nav.Link onClick={handleLogout}>Log Out</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>

            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body text-center">
                            <img src={avatar} alt="user-image" className="rounded-circle mb-3"
                                 style={{width: '100px', height: '100px'}}/>
                            <h4>{username}</h4>
                            <p>{headline}</p>
                            <input
                                type="text"
                                className="form-control mb-2"
                                value={newheadline}
                                placeholder="Update your headline here"
                                onChange={(e) => setnewHeadline(e.target.value)}
                            />
                            <button className="btn btn-primary" onClick={handleUpdateHeadline}>Update</button>
                        </div>
                    </div>
                    <div className="followers-section mt-4">
                        <h3>Following</h3>
                        <ul className="list-group">
                            {followers.map(following => (
                                <li key={following.follower}
                                    className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <img src={following.avatar || image3} alt={following.follower} className="rounded-circle me-2"
                                             style={{width: '50px', height: '50px'}}/>
                                        <strong>{following.follower}</strong>
                                        <p>{following.headline}</p>
                                    </div>
                                    <button className="btn btn-danger"
                                            onClick={() => handleUnfollow(following.follower)}>Unfollow
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-3">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search for user to follow"
                                    value={addUserSearch}
                                    onChange={(e) => setAddUserSearch(e.target.value)}
                                />
                                <button className="btn btn-primary" onClick={handleSearchUserToFollow}>
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">

                    <div className="card p-4 mb-4">
                        <form onSubmit={handlePostArticle}>
                            <div className="mb-3">
                                <h5>Write a New Post</h5>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    placeholder="Enter the title here..." // 添加标题输入框
                                    value={newArticleTitle}  // 新的state来存储标题
                                    onChange={(e) => setNewArticleTitle(e.target.value)}

                                />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Write your article here..."
                                    value={newArticle}
                                    required
                                    onChange={(e) => setNewArticle(e.target.value)}
                                />
                                <div className="mt-2">
                                    <input type="file" accept="image/*"  onChange={(e) =>setnewArticleImage(e.target.files[0])}/>

                                    <div className="mt-2">
                                        <button type="submit" className="btn btn-success me-2">Post Article
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleclear}>Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search articles by author or text..."
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                    </div>

                    <nav>
                        <ul className="pagination justify-content-center">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                            </li>
                            {Array.from({length: Math.ceil(articles.length / postsPerPage)}, (_, index) => (
                                <li
                                    key={index + 1}
                                    className={`page-item ${index + 1 === currentPage ? 'active' : ''}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(index + 1)}
                                    >
                                        {index + 1}
                                    </button>
                                </li>
                            ))}
                            <li
                                className={`page-item ${
                                    currentPage === Math.ceil(articles.length / postsPerPage) ? 'disabled' : ''
                                }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                    disabled={currentPage === Math.ceil(articles.length / postsPerPage)}
                                >
                                    Next
                                </button>
                            </li>
                        </ul>
                    </nav>


                    <div className="articles-section" data-testid="articles-section">
                        {currentPosts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).map((article) => (


                            <div key={article.id} className="card mb-3" data-testid="article">
                                <div className="card-body">

                                    {article.image &&
                                        <img src={article.image} alt="Article" className="img-fluid mb-2"/>}
                                    <h5 className="card-title">{article.title}</h5>
                                    <p className="card-text">{article.body}</p>
                                    <p className="text-muted">Author: {article.author}</p>
                                    <p className="text-muted">{new Date(article.timestamp).toLocaleString()}</p>

                                    <div className="comments-section mt-3">
                                        <h6>Comments</h6>
                                        <ul className="list-group">
                                            {article.comments.map((comment) => (
                                                <li key={comment.id} className="list-group-item">
                                                    <strong>{comment.author}:</strong> {comment.text}
                                                    {comment.author === username && (
                                                        <button
                                                            className="btn btn-sm btn-outline-secondary ms-2"
                                                            onClick={() => handleEditClick('comment', comment.id, article.id, comment.text)}
                                                        >
                                                            Edit
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <textarea
                                        className="form-control mt-2"
                                        placeholder="Write a comment..."
                                        value={newComment[article.id] || ''}
                                        onChange={(e) => setNewComment({...newComment, [article.id]: e.target.value})}
                                    />
                                    <button
                                        className="btn btn-outline-primary mt-2 me-2"
                                        onClick={() => handleAddComment(article.id)}
                                    >
                                        Leave a Comment
                                    </button>
                                    {article.author === username && (
                                        <button
                                            className="btn btn-outline-secondary mt-2"
                                            onClick={() => handleEditClick('article', article.id, null, article.body)}
                                        >
                                            Edit Article
                                        </button>
                                    )}
                                </div>
                            </div>

                        ))}
                    </div>
                </div>
            </div>
            {isEditing && (
                <div
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: 'white',
                            padding: '20px',
                            borderRadius: '8px',
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                            width: '400px',
                            textAlign: 'center',
                        }}
                    >
                        <h5>Edit {editingType === 'article' ? 'Article' : 'Comment'}</h5>
                        <textarea
                            className="form-control"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            style={{marginBottom: '10px'}}
                        />

                        <div
                            className="d-flex justify-content-center mt-3"
                            style={{
                                gap: '10px', // 设置按钮之间的间距
                            }}
                        >
                            <button className="btn btn-primary" onClick={handleConfirmEdit} style={{flex: '1'}}>
                                Confirm
                            </button>
                            <button className="btn btn-secondary" onClick={handleCancelEdit} style={{flex: '1'}}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>


    );
}

export default Main;
