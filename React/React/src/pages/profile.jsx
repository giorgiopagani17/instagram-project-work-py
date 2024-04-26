import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './element/sidebar';
import Button from 'react-bootstrap/Button';
import { IoIosSettings } from "react-icons/io";
import { useNavigate, useParams } from "react-router-dom";
import { useProfileData, useUserPost } from '../features/api';
import './css/profile.css';
import { IoCameraOutline } from "react-icons/io5";
import { MdOutlinePersonAdd } from "react-icons/md";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import Modal from './element/modal.jsx';
import ListModal from './element/listmodal.jsx';

function ProfilePage() {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const image_path = `http://localhost:8000/img/${id}`;
  const loggedInUserId = useSelector((state) => state.user.value.id); // ID dell'utente nella sessione
  const [follow, setFollow] = useState(null);
  const [follower, setFollower] = useState(0);
  const [image, setImage] = useState(null);
  const [number, setNumber] = useState(null);
  // Ottieni i dati del profilo utilizzando la custom hook useProfileData
  const profileData = useProfileData(id);
  // Ottieni le immagini dell'utente utilizzando la custom hook useUserPost
  const userImages = useUserPost(id);

  //Check Number Follower
  useEffect(() => {
    const fetchFollower = async () => {
      try {
        const response = await fetch(`http://localhost:8000/follower/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Impostiamo follow direttamente al valore restituito dal backend
        setFollower(data.num_follower);
      } catch (error) {
        console.error('Error fetching follower:', error);
        // Gestire l'errore o visualizzare un messaggio all'utente
      }
    };
  
    fetchFollower();
  }, [navigate, loggedInUserId]);

  //Check Follow
  useEffect(() => {
    const fetchFollow = async () => {
      try {
        const response = await fetch(`http://localhost:8000/followinfo/${loggedInUserId}/${id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Impostiamo follow direttamente al valore restituito dal backend
        setFollow(data.follow);
      } catch (error) {
        console.error('Error fetching follow:', error);
        // Gestire l'errore o visualizzare un messaggio all'utente
      }
    };
  
    fetchFollow();
  }, [navigate, loggedInUserId, id]);  

  //Follow
  const handleFollow = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loggedInUserId: loggedInUserId, idUserFollowed: id }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Aggiorna lo stato del follow dopo aver eseguito con successo la chiamata API
      setFollow(true);
      setFollower(prevFollower => prevFollower + 1);
      // Puoi gestire ulteriormente la risposta qui se necessario
    } catch (error) {
      console.error('Error fetching user follow:', error);
    }
  };
  
  //Unfollow
  const handleUnfollow = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/unfollow/${loggedInUserId}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      // Aggiorna lo stato del follow dopo aver eseguito con successo la chiamata API
      setFollow(false); // Imposta follow a false perché l'utente non sta più seguendo
      setFollower(prevFollower => prevFollower - 1);
      // Puoi gestire ulteriormente la risposta qui se necessario
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = (number) => {
    if (parseInt(id) === loggedInUserId) {
      setShow(true);
      setNumber(number);
    }
  };

  const handleClose2 = () => setShow2(false);
  const handleShow2 = (imageUrl) => {
    setShow2(true);
    setImage(imageUrl);
  };

  const handleClose3 = () => setShow3(false);
  const handleShow3 = (number) => {
    setShow3(true);
    setNumber(number)
  };

  return (
    <div className='bg-dark' style={{ display: 'flex', height: 'auto', minHeight: '100vh' }}>
      <Sidebar/>
      <div className='profileDiv'>
        <div className='profileInfo'>
          <div>
            <img 
              src={image_path} 
              alt="User Image" 
              className="imageProfile" 
              onClick={() => handleShow(2)}
              onMouseOver={() => setIsHovered(true)} 
              onMouseLeave={() => setIsHovered(false)}
              style={{
                filter: parseInt(id) === loggedInUserId && isHovered ? 'brightness(0.7)' : 'brightness(1)',
                cursor: parseInt(id) === loggedInUserId && isHovered ? 'pointer' : 'default'
              }}
            />
          </div>
          <div className="info">
            {profileData && (
              <>
                <strong>{profileData.username}</strong>
                {loggedInUserId === parseInt(id) ? (
                  <>
                    <Button variant="dark" className='button1' onClick={() => handleShow(4)}>
                      Modifica profilo
                    </Button>{' '}
                    <Button variant="dark" className='button2'>
                      Visualizza archivio
                    </Button>{' '}
                    <IoIosSettings size={30} />
                  </>
                ) : (
                  <>
                    <Button className='button1' variant={follow ? "dark" : "primary"} onClick={follow ? handleUnfollow : handleFollow}>
                      {follow ? 'Segui già' : 'Segui'}
                    </Button>
                    <Button variant="dark" className='button2'>
                      <MdOutlinePersonAdd size={20} style={{verticalAlign:'sub'}}/>
                    </Button>{' '}
                    <HiOutlineDotsHorizontal size={20}/>
                  </>
                )}
                <br/>
                <div style={{ marginTop: '5%' }}>
                  <strong>{profileData.num_posts} post</strong>
                  <strong className='textInfo' style={{cursor:"pointer"}} onClick={() => handleShow3(1)}>{follower} follower</strong>
                  <strong className='textInfo' style={{cursor:"pointer"}} onClick={() => handleShow3(2)}>{profileData.num_following} seguiti</strong>
                </div>
                <br/>
                <p style={{color:'white', fontSize:'14px'}}>
                  {profileData.description}
                </p>
              </>
            )}
          </div>
        </div>
        <hr className='greca'/>
        <div>
          <div className='imageGallery'>
            {userImages && userImages.length > 0 ? (
              userImages.map((imageUrl, index) => (
                <div key={index} className='imageContainer'>
                  <img src={imageUrl} alt={`Image ${index}`} className='userImage' onClick={() => handleShow2(imageUrl)}/>
                </div>
              ))
            ) : (
              <div className='divNoPost'>
                <div className='divImgNoPost'>
                  <div className='circlePhoto'>
                    <IoCameraOutline size={100}/>
                  </div>
                </div>
                <div className='divTextNoPost'>
                  <strong className='noPost'>Ancora nessun post</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        number={number}
      />
      <Modal
        show={show2}
        onHide={handleClose2}
        backdrop="static"
        keyboard={false}
        number={3}
        image = {image}
      />
      <ListModal
        show={show3}
        onHide={handleClose3}
        backdrop="static"
        keyboard={false}
        number={number}
        id = {id}
      />
    </div>
  );
}

export default ProfilePage;
