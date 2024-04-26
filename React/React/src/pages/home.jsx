import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './element/sidebar';
import './css/home.css';
import { useSelector } from 'react-redux';
import { GoHeartFill, GoHeart } from 'react-icons/go';
import { IoChatbubbleOutline } from 'react-icons/io5';
import { FiSend } from 'react-icons/fi';
import { HiOutlineBookmark } from 'react-icons/hi';
import { useNavigate } from "react-router-dom";
import { IoSearchCircleOutline } from "react-icons/io5";
import { format, parseISO } from 'date-fns';
import ListModal from './element/listmodal.jsx';

function HomePage() {
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [postLikes, setPostLikes] = useState({});
  const [isAnimating, setIsAnimating] = useState({});
  const [isLikeHovered, setIsLikeHovered] = useState({});
  const loggedInUserId = useSelector((state) => state.user.value.id);
  const [showList, setShowList] = useState(false);
  const [numberList, setNumberList] = useState(null);
  const [id_post_list, setIdPostList] = useState(null);
  
  useEffect(() => {
    const getUserPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/homeposts/${loggedInUserId}`);
        setUserPosts(response.data);

        const likesPromises = response.data.map(post => {
          return axios.get(`http://localhost:8000/isLiked/${post.id}/${loggedInUserId}`);
        });
        const likesResponses = await Promise.all(likesPromises);
        
        const updatedPostLikes = {};
        likesResponses.forEach((likeResponse, index) => {
          const postId = response.data[index].id;
          const num_likes = response.data[index].num_like;
          const liked = likeResponse.data;
          updatedPostLikes[postId] = { num_likes, liked };
          setIsAnimating(prevState => ({ ...prevState, [postId]: false }));
          setIsLikeHovered(prevState => ({ ...prevState, [postId]: false }));
        });
        setPostLikes(updatedPostLikes);
      } catch (error) {
        console.error('Errore durante il recupero dei post:', error);
      }
    };
    getUserPosts();
  }, [loggedInUserId]);

  const handleLike = async (postId) => {
    try {
      await axios.post(`http://localhost:8000/like/${postId}/${loggedInUserId}`);
      setPostLikes(prevState => ({
        ...prevState,
        [postId]: { num_likes: prevState[postId].num_likes + 1, liked: true }
      }));
      setIsAnimating(prevState => ({ ...prevState, [postId]: true }));
      setIsLikeHovered(prevState => ({ ...prevState, [postId]: false }));
      setTimeout(() => {
        setIsAnimating(prevState => ({ ...prevState, [postId]: false }));
      }, 300);
    } catch (error) {
      console.error(`Errore durante l'aggiunta del like al post ${postId}:`, error);
    }
  };

  const handleUnlike = async (postId) => {
    try {
      const response = await axios.delete(`http://localhost:8000/unlike/${postId}/${loggedInUserId}`);
      if (response.status === 200) {
        setPostLikes(prevState => ({
          ...prevState,
          [postId]: { num_likes: prevState[postId].num_likes - 1, liked: false }
        }));
      } else {
        console.error(`Errore durante la rimozione del like dal post ${postId}:`, response.statusText);
      }
      setIsLikeHovered(prevState => ({ ...prevState, [postId]: false }));
    } catch (error) {
      console.error(`Errore durante la rimozione del like dal post ${postId}:`, error);
    }
  };

  const handleUserSearchedProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleCloseList = () => setShowList(false);
  const handleShowList = (numberList, id_post_list) => {
      setShowList(true);
      setNumberList(numberList);
      setIdPostList(id_post_list)
  };

  return (
    <div className="bg-dark" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div className="perTe">
        <div style={{ marginBottom: '30px' }}>
          <strong>Per te</strong>
          <hr />
        </div>
        {userPosts.length === 0 ? (
          <div className='divNoPostHome'>
            <div className='divImgNoPostHome'>
              <IoSearchCircleOutline size={200}/>
            </div>
            <div className='divTextNoPostHome'>
              <strong className='noPostHome'>Inizia a seguire qualcuno</strong>
            </div>
          </div>
        ) : (
          userPosts.map((post) => (
            <div key={post.id} style={{ padding: '10px', margin: '10px', width: '80%', marginLeft: '10%', marginTop: '-15px' }}>
              <img src={post.user_img} alt="User" style={{ width: '30px', borderRadius: '30px' }} />
              <span onClick={() => handleUserSearchedProfile(post.user_id)} style={{ marginLeft: '5px', verticalAlign: 'middle', cursor:'pointer' }}><strong>{post.username}</strong></span>
              <span style={{ verticalAlign: 'middle', color:'grey', fontSize:'14px' }}> - {format(parseISO(post.datepost), 'dd MMMM yyyy')}</span>
              <br />
              <img src={post.img_post} alt="Post" onDoubleClick={() => handleLike(post.id)} style={{ width: '100%', marginTop: '15px', borderRadius: '5px', border: '1px solid grey' }} />
              <br />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                <span>
                  {post.id in postLikes && postLikes[post.id].liked ? (
                    <GoHeartFill
                      size={25}
                      onClick={() => handleUnlike(post.id)}
                      onMouseEnter={() => setIsLikeHovered(prevState => ({ ...prevState, [post.id]: true }))}
                      onMouseLeave={() => setIsLikeHovered(prevState => ({ ...prevState, [post.id]: false }))}
                      style={{
                        color: 'red',
                        opacity: isLikeHovered[post.id] ? 0.8 : 1,
                        transition: 'opacity 0.3s ease',
                        cursor: 'pointer',
                        transform: isAnimating[post.id] ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  ) : (
                    <GoHeart
                      size={25}
                      onClick={() => handleLike(post.id)}
                      onMouseEnter={() => setIsLikeHovered(prevState => ({ ...prevState, [post.id]: true }))}
                      onMouseLeave={() => setIsLikeHovered(prevState => ({ ...prevState, [post.id]: false }))}
                      style={{
                        color: 'white',
                        opacity: isLikeHovered[post.id] ? 0.6 : 1,
                        transition: 'opacity 0.3s ease',
                        cursor: 'pointer',
                        transform: isAnimating[post.id] ? 'scale(1.2)' : 'scale(1)'
                      }}
                    />
                  )}
                  <IoChatbubbleOutline size={25} style={{ marginLeft: '10px' }} />
                  <FiSend size={25} style={{ marginLeft: '10px' }} />
                </span>
                <span style={{ marginLeft: 'auto' }}>
                  <HiOutlineBookmark size={25} />
                </span>
              </div>
              <strong style={{ fontSize: '15px', cursor:'pointer'}} onClick={() => handleShowList(3, post.id)}>Piace a {postLikes[post.id] ? postLikes[post.id].num_likes : 0} persone</strong>
              <p style={{ color: 'white', marginBottom: '0px' }}><strong>{post.username} </strong><span style={{ fontSize: '14px' }}>{post.descrizione}</span></p>
              <p>Commenti...</p>
              <hr />
            </div>
          ))
        )}
      </div>
      <ListModal
        show={showList}
        onHide={handleCloseList}
        backdrop="static"
        keyboard={false}
        number={numberList}
        id_post = {id_post_list}
      />
    </div>
  );
}

export default HomePage;
