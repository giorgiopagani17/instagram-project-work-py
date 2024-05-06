import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import '../css/listmodal.css';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";

function ListModal(props) {
    const { number, id, id_post } = props;
    console.log(number)
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    
    function handleClose() {
        setSearchQuery('');
        setUsers([]);
        props.onHide();
    }

    useEffect(() => {
        if (props.show) {
            search('');
        }
    }, [props.show]);
    
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        search(query);
    }

    const search = async (query) => {
        switch (number) {
            case 1:
                fetchUsersFollowed(query);
                break;
            case 2:
                fetchUsersSeguiti(query);
                break;
            case 3:
                fetchUsersLike(query);
                break;
            default:
                console.error('Invalid number');
        }
    };
    
    const fetchUsersFollowed = async (query) => {
        try {
            const response = await fetch(`http://localhost:8000/api/followers?id=${id}&search=${query}`);
            if (!response.ok) {
                throw new Error('Errore nella richiesta');
            }
            const data = await response.json();
            setUsers(data);
            return data;
        } catch (error) {
            console.error('Errore durante il recupero degli utenti:', error);
            return [];
        }
    };

    const fetchUsersSeguiti = async (query) => {
        try {
            const response = await fetch(`http://localhost:8000/api/seguiti?id=${id}&search=${query}`);
            if (!response.ok) {
                throw new Error('Errore nella richiesta');
            }
            const data = await response.json();
            setUsers(data);
            return data;
        } catch (error) {
            console.error('Errore durante il recupero degli utenti:', error);
            return [];
        }
    };

    const fetchUsersLike = async (query) => {
        try {
            const response = await fetch(`http://localhost:8000/api/userslike?id_post=${id_post}&search=${query}`);
            if (!response.ok) {
                throw new Error('Errore nella richiesta');
            }
            const data = await response.json();
            setUsers(data);
            return data;
        } catch (error) {
            console.error('Errore durante il recupero degli utenti:', error);
            return [];
        }
    };

    const handleUserSearchedProfile = (userId) => {
        navigate(`/profile/${userId}`);
        handleClose()
    };

    return (
        <Modal
            {...props}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            dialogClassName="custom-modal modal-dark"
            centered
        >
            <Modal.Header style={{ height: '60px' }}>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <th className='left'></th>
                            <th className='center'>
                                {number === 1 ? 'Follower' : number === 3 ? 'Mi piace' : 'Chi segui'}
                            </th>
                            <th className='right'><button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={handleClose}></button></th>
                        </tr>
                    </tbody>
                </table>
            </Modal.Header>
            <Modal.Body style={{ height: '250px', overflowY: 'auto' }}>
                <Form.Control type="text" placeholder="Cerca" value={searchQuery} onChange={handleSearchChange} />
                {users.length > 0 ? (
                    <div style={{ marginTop: "10px", marginBottom: "-10px" }}>
                        {users.map((user) => (
                            <p key={user.id} className="searched" onClick={() => handleUserSearchedProfile(user.id)}>
                                <img src={`http://localhost/instagram/imgprofile.php?user_id=${user.id}`} style={{ marginRight: '10px', width: '35px', height: '35px', borderRadius: '35px' }} alt={`User ${user.id}`} />
                                <span style={{ verticalAlign: '0px', fontSize: '15px', cursor: 'pointer' }}>{user.username}</span>
                            </p>
                        ))}
                    </div>
                ) : (
                    <div style={{ marginTop: "20px", paddingLeft: "5px" }}>
                        <p style={{ color: 'white' }}>Nessun utente trovato.</p>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default ListModal;
