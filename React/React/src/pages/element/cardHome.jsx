import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import '../css/cardHome.css';
import { useNavigate } from "react-router-dom";

const Card = () => {
    const loggedInUserId = useSelector((state) => parseInt(state.user.value.id));
    const loggedInUserUsername = useSelector((state) => state.user.value.username);
    const [suggeriti, setSuggeriti] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSuggeriti = async () => {
            if (loggedInUserId) {
                try {
                    const response = await axios.get(`http://localhost:8000/suggeriti/${loggedInUserId}`);
                    setSuggeriti(response.data); // Assicurati di passare response.data per impostare correttamente lo stato
                } catch (error) {
                    console.error('Error:', error);
                }
            }
        };
        fetchSuggeriti();
    }, [loggedInUserId]); // Dipendenza per useEffect

    const handleUserSearchedProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className='card'>
            <div style={{marginTop:'35%'}}>
                <img src={`http://localhost/instagram/imgprofile.php?user_id=${loggedInUserId}`} style={{height:'35px', width:'35px', borderRadius:'35px'}}/>
                <strong style={{color:'white', fontSize:'16px', marginLeft:'7px', cursor:'pointer'}} onClick={() => handleUserSearchedProfile(loggedInUserId)}>{loggedInUserUsername}</strong>
                <p style={{fontSize:'14px', marginTop:'14px', color:'grey'}}><strong>Suggeriti per te</strong></p>
                <div>
                    {suggeriti.map((suggerito) => (
                        <p key={suggerito.id}>
                            <img src={`http://localhost/instagram/imgprofile.php?user_id=${suggerito.id}`} style={{height:'35px', width:'35px', borderRadius:'35px'}}/>
                            <strong style={{color:'white', fontSize:'16px', marginLeft:'7px', cursor:'pointer'}} onClick={() => handleUserSearchedProfile(suggerito.id)}>{suggerito.username}</strong>
                        </p>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default Card;
