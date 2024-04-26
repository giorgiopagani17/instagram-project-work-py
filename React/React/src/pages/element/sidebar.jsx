import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { logout } from '../../features/user.js';
import Modal from './modal.jsx';
import '../css/sidebar.css';
import { Form, FormControl } from 'react-bootstrap';
import fetchUsers from '../../features/api'; // Importa la funzione fetchUsers
import { BsFillHouseDoorFill, BsSearch, BsCompassFill, BsFillSendFill } from "react-icons/bs";
import { BiMoviePlay } from "react-icons/bi";
import { FaRegHeart, FaRegPlusSquare, FaInstagram } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";

const Sidebar = () => {
    const [show, setShow] = useState(false);
    const [isOpen1, setIsOpen1] = useState(true);
    const [isOpen2, setIsOpen2] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const user = useSelector((state) => state.user.value);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const username = user ? user.username : '';
    const id = user ? user.id : '';
    const image_path = 'http://localhost:8000/img/' + id;

    const toggle = () => {
        setIsOpen1(!isOpen1);
        setIsOpen2(!isOpen2);
        handleSearchAll(!isOpen2 ? '' : searchQuery);
    }

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  
    const handleLogout = () => {
        dispatch(logout());
        localStorage.setItem("user", "");
        navigate("/");
    }

    const menuItem = [
        {
            name: "Reels",
            icon: <BiMoviePlay size={20} className='icons' />
        },
        {
            name: "Messaggi",
            icon: <BsFillSendFill size={20} className='icons' />
        },
        {
            name: "Notifiche",
            icon: <FaRegHeart size={20} className='icons' />
        },
    ];

    const handleSearchChange = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        console.log(query);

        try {
            const data = await fetchUsers(query);
            if (data) {
                setUsers(data);
            }
        } catch (error) {
            console.error('Errore durante il recupero degli utenti:', error);
        }
    };

    const handleSearchAll = async () => {
        const query = "";
        setSearchQuery(query);
        console.log(query);

        try {
            const data = await fetchUsers(query); // Utilizza la funzione fetchUsers per recuperare gli utenti
            setUsers(data);
        } catch (error) {
            console.error('Errore durante il recupero degli utenti:', error);
        }
    };

    const handleUserSearchedProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const handleExplore = () => {
        navigate(`/esplora`);
    };

    return (
        <div style={{ width: isOpen1 ? "280px" : "50px", borderRight: isOpen1 ? "0.5px solid gray" : "none" }} className="sidebar">
            <div
                style={{
                    width: isOpen2 ? "280px" : "0px",
                    borderRight: isOpen2 ? "0.5px solid gray" : "none",
                    marginLeft: isOpen2 ? "50px" : "0px"
                }}
                className="sidebar"
            >
                {isOpen2 && (
                    <div>
                        <div style={{ paddingTop: '20px', paddingLeft: '20px', paddingRight: '20px', fontSize: '25px', marginBottom: '25px' }}>
                            <p style={{ color: 'white', marginBottom: '40px' }}>Cerca</p>
                            <Form.Group className="mb-3" controlId="formBasicSearch">
                                <FormControl
                                    type="text"
                                    placeholder="Cerca"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </Form.Group>
                        </div>
                        <hr />
                        {users.length > 0 ? (
                            <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                                <p style={{ color: 'white' }}>Risultati della ricerca:</p>
                                <div>
                                    {users.map((user) => (
                                        <p key={user.id} className="searched" onClick={() => handleUserSearchedProfile(user.id)}>
                                            <img src={`http://localhost:8000/img/${user.id}`} style={{ marginRight: '10px', width: '35px', height: '35px', borderRadius: '35px' }} alt={`User ${user.id}`} />
                                            <span style={{ verticalAlign: '0px', fontSize: '15px', cursor: 'pointer' }}>{user.username}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div style={{ paddingLeft: '20px', paddingRight: '20px' }}>
                                <p style={{ color: 'white' }}>Nessun utente trovato.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="top_section">
                <img
                    src="../../../img/logowhite.png"
                    style={{
                        width: '150px',
                        display: isOpen1 ? "block" : "none",
                        height: '70px'
                    }}
                    alt="Logo"
                />

                <div>
                    {!isOpen1 && <FaInstagram size={25} />}
                </div>

            </div>

            <a className="link" href="/home">
                <div className="icon">
                    <BsFillHouseDoorFill size={20} className="icon" />
                </div>
                <div style={{ display: isOpen1 ? "block" : "none", cursor: 'pointer' }} className="link_text">Home</div>
            </a>

            <a className="link" onClick={toggle} style={{ backgroundColor: isOpen2 ? '#595959' : '', borderRadius: isOpen2 ? '10px' : '' }}>
                <div className="icon">
                    <BsSearch size={20} className="icon" />
                </div>
                <div style={{ display: isOpen1 ? "block" : "none", cursor: 'pointer' }} className="link_text">Cerca</div>
            </a>

            <a className="link" onClick={handleExplore}>
                <div className="icon">
                    <BsCompassFill size={20} className="icon" />
                </div>
                <div style={{ display: isOpen1 ? "block" : "none", cursor: 'pointer' }} className="link_text">Esplora</div>
            </a>

            {menuItem.map((item, index) => (
                <NavLink to={item.path} key={index} className="link">
                    <div className="icon">{item.icon}</div>
                    <div style={{ display: isOpen1 ? "block" : "none" }} className="link_text">{item.name}</div>
                </NavLink>
            ))}

            <a className="link" onClick={() => handleShow(true)}>
                <div className="icon">
                    <FaRegPlusSquare size={20} className="icon" />
                </div>
                <div style={{ display: isOpen1 ? "block" : "none", cursor: 'pointer' }} className="link_text">Crea</div>
            </a>

            <NavLink to={`/profile/${id}`} className="link">
                <div className="icon">
                    <img src={image_path} alt="User" className="imageUser" />
                </div>
                <div style={{ display: isOpen1 ? "block" : "none" }} className="link_text">{username}</div>
            </NavLink>


            <a className="link" onClick={handleLogout} style={{ marginTop: '80px' }}>
                <div className="icon">
                    <IoIosLogOut size={20} style={{ marginTop: '1.5%' }} />
                </div>
                <div style={{ display: isOpen1 ? "block" : "none", cursor: 'pointer' }} className="link_text">Logout</div>
            </a>

            <Modal
                show={show}
                onHide={handleClose}
                backdrop="static"
                keyboard={false}
                number={1}
            />
        </div>
    );
};

export default Sidebar;
