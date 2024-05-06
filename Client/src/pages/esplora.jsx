import React, { useState, useEffect } from 'react';
import { useExplorePost } from '../features/api';
import './css/esplora.css';
import { useSelector } from 'react-redux';
import Sidebar from './element/sidebar';
import Modal from './element/modal.jsx';

function ExplorePage() {
    const [show, setShow] = useState(false);
    const loggedInUserId = useSelector((state) => state.user.value.id); // ID dell'utente nella sessione
    const explorePosts = useExplorePost(loggedInUserId);
    const [image, setImage] = useState(null);

    const handleClose = () => setShow(false);
    const handleShow = (imageUrl) => {
        setShow(true);
        setImage(imageUrl);
      };

    return (
        <div className='bg-dark' style={{ display: 'flex', height: 'auto', minHeight: '100vh', width:'100%'}}>
            <Sidebar/>
            <div style={{marginLeft:'30%', marginTop:'3%', marginRight:'10%'}}>
                <div className='postGallery'>
                    {explorePosts.map((imageUrl, index) => (
                        <div key={index} className='postContainer'>
                            <img src={imageUrl} alt={`Image ${index}`} className='postImage' onClick={() => handleShow(imageUrl)}/>
                        </div>
                    ))}
                </div>
            </div>
            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                number={3}
                image = {image}
            />
        </div>
    )
}

export default ExplorePage;
