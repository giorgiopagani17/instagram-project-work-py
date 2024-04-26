import React, { useState, useRef, useEffect } from 'react';
import BootstrapModal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import AvatarEditor from 'react-avatar-editor';
import '../css/modal.css';
import Form from 'react-bootstrap/Form';
import { GoHeartFill, GoHeart } from 'react-icons/go';
import { IoChatbubbleOutline } from 'react-icons/io5';
import { FiSend } from 'react-icons/fi';
import { MdInsertEmoticon } from "react-icons/md";
import { HiOutlineBookmark } from 'react-icons/hi';
import { useSelector } from 'react-redux';
import { IoMdImages } from "react-icons/io";
import { uploadImageProfile, uploadPost } from '../../features/api';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/user.js';
import ListModal from './listmodal.jsx';


const ModalComponent = ({ number, image, ableToDelete, ...props }) => {
    const loggedInUserId = useSelector((state) => state.user.value.id);
    const email = useSelector((state) => state.user.value.email)
    const loggedInUserUsername = useSelector((state) => state.user.value.username);
    const [usernameNew, setUsername] = useState(loggedInUserUsername);
    const [descriptionNew, setDescriptionNew] = useState("");
    const [biografia, setBiografia] = useState("");
    const [password, setPassword] = useState("");
    const [passwordOld, setPasswordOld] = useState("");
    const [file, setFile] = useState(null);
    const [fileSelected, setFileSelected] = useState(false);
    const [description, setDescription] = useState('');
    const editorRef = useRef();
    const user = useSelector((state) => state.user.value);
    const username = user ? user.username : '';
    const id = user ? user.id : '';
    const image_path = 'http://localhost:8000/img/' + id;
    const navigate = useNavigate();
    const redirect = "/profile/" + id;
    const [postLikes, setPostLikes] = useState({});
    const [isAnimating, setIsAnimating] = useState(false);
    const [isLikeHovered, setIsLikeHovered] = useState(false);
    const [postInfo, setPostInfo] = useState(null);
    const [dataFormattata, setDataFormattata] = useState('');
    const dispatch = useDispatch();
    const [showList, setShowList] = useState(false);
    const [numberList, setNumberList] = useState(null);
    const [id_post_list, setIdPostList] = useState(null);
    const [comment, setComment] = useState('');
    const [commenti, setCommenti] = useState([]);
    const [index, setIndex] = useState(0);

    //Get Biografia e Password Utente
    useEffect(() => {
        const getInfoToUpdate = async () => {
            try {
                const response = await fetch(`http://localhost:8000/infotoupdate/${loggedInUserId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(data)
                // Impostiamo follow direttamente al valore restituito dal backend
                setDescriptionNew(data[0].descrizione);
                setBiografia(data[0].descrizione);
                setPassword(data[0].password);
                setPasswordOld(data[0].password);
            } catch (error) {
                console.error('Error fetching follow:', error);
                // Gestire l'errore o visualizzare un messaggio all'utente
            }
        };
    
        getInfoToUpdate(); // Chiamiamo la funzione per recuperare la biografia
    
    }, [loggedInUserId]);
    
    useEffect(() => {
        if (image) {
            setPostInfo(null);
            setDataFormattata('');    
            const imageName = image.substring(image.lastIndexOf('/') + 1);
            const fetchPostInfo = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/infoPost/${imageName}`);
                    setPostInfo(response.data);

                    // Formatta la data quando ottieni le informazioni sul post
                    if (response.data && response.data.datepost) {
                        const dataString = response.data.datepost;
                        const data = new Date(dataString);
                        const mesi = [
                            "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
                            "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"
                        ];
                        const giorno = data.getDate();
                        const mese = mesi[data.getMonth()];
                        const anno = data.getFullYear();
                        const dataFormattata = giorno + ' ' + mese + ' ' + anno;
                        setDataFormattata(dataFormattata);
                    }
                } catch (error) {
                    console.error('Error fetching post info:', error);
                }
            };
            fetchPostInfo();
        }
    }, [image]);
    
    useEffect(() => {
        if (postInfo) {
            const getCommenti = async () => {
                try {
                    const response = await axios.get(`http://localhost:8000/commenti/${postInfo.post_id }`, {
                    });
                    // Assuming commenti is your state variable to store comments
                    setCommenti(response.data);
                    console.log(response.data);
                } catch (error) {
                    console.error('Error fetching comments:', error);
                }
            }
    
            // Call the function initially
            getCommenti();
        }
        // Add postInfo to the dependency array to run the effect whenever postInfo changes
    }, [postInfo]);

    useEffect(() => {
        const checkLikedStatus = async () => {
            if (postInfo && loggedInUserId) {
                try {
                    const likeResponse = await axios.get(`http://localhost:8000/isLiked/${postInfo.post_id}/${loggedInUserId}`);
                    setPostLikes(prevState => ({
                        ...prevState,
                        [postInfo.post_id]: {
                            num_likes: postInfo.num_likes,
                            liked: likeResponse.data
                        }
                    }));
                } catch (error) {
                    console.error('Error checking liked status:', error);
                }
            }
        };
        checkLikedStatus();
    }, [postInfo, loggedInUserId]);

    useEffect(() => {
        if (number === 1) {
            // Ripristina lo stato del file e della descrizione quando il modal viene aperto
            setFile(null);
            setFileSelected(false);
            setDescription('');
        }
    }, [number]);
        
    function getFile(event) {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(URL.createObjectURL(selectedFile));
            setFileSelected(true);
        }
    }
    
    async function handleSavePost() {
        if (editorRef.current && file) { // Controlla che ci sia un file caricato
            const canvas = editorRef.current.getImageScaledToCanvas();    
            canvas.toBlob(async (blob) => {
                try {
                    await uploadPost(id, blob, description);
                    // Chiudi la modale dopo il caricamento dell'immagine
                    handleClose();
                    window.location.reload();
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            }, 'image/jpeg');
        }
    }

    async function handleSaveImgProfile() {
        if (editorRef.current && file) { // Controlla che ci sia un file caricato
            const canvas = editorRef.current.getImageScaledToCanvas();    
            canvas.toBlob(async (blob) => {
                try {
                    await uploadImageProfile(id, blob);
                    // Chiudi la modale dopo il caricamento dell'immagine
                    handleClose();
                    window.location.reload();
                } catch (error) {
                    console.error('Error uploading image:', error);
                }
            }, 'image/jpeg');
        }
    }

    const handleLogout = () => {
        dispatch(logout());
        localStorage.setItem("user", "");
        navigate("/");
    }

    const handleSaveChanges = async () => {
        try {
            const data = {
                username: usernameNew,
                password: password,
                description: descriptionNew
            };
    
            // Verifica se i nuovi valori sono diversi dai valori correnti
            if (usernameNew !== loggedInUserUsername || password !== passwordOld || biografia !== descriptionNew) {
                const response = await axios.put(`http://localhost:8000/changeinfo/${loggedInUserId}`, data, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (usernameNew !== loggedInUserUsername || password !== passwordOld) {
                    handleClose();
                    handleLogout();
                }
                else {
                    handleClose();
                    window.location.reload();
                }
            } else {
                // Se i valori non sono cambiati, chiudi semplicemente la modale
                handleClose();
            }
        } catch (error) {
            console.error('Errore durante la chiamata API per salvare le modifiche:', error);
            if (error.response && error.response.status === 500) {
                // Se l'errore è di tipo 500, mostra un messaggio di avviso
                alert("Username già esistente!");
            }
            throw error;
        }
    };

    // Funzione per reimpostare l'immagine del profilo
    const defaultImgProfile = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/imgprofile/${id}/default.jpg`);
            handleClose(); // Chiude la modal dopo il completamento della chiamata API
            window.location.reload(); // Ricarica la pagina se necessario
        } catch (error) {
            console.error('Errore durante la chiamata API per reimpostare l\'immagine del profilo:', error);
            // Puoi gestire l'errore ulteriormente o lanciarlo di nuovo
            throw error;
        }
    };
   
    const handleChangeDescription = (event) => {
        setDescription(event.target.value);
    };

    function handleClose() {
        if(index > 0){
            window.location.reload(); // Ricarica la pagina se sono stati aggiunti commenti
        }
        URL.revokeObjectURL(file); // Elimina l'URL dell'immagine
        setFile(null); // Resetta il file quando la modale viene chiusa
        setDescription(''); // Resetta la descrizione quando la modale viene chiusa
        setFileSelected(false); // Resetta lo stato del file selezionato
        props.onHide(); // Chiude la modal
    }

    const handleLike = async (postId) => {
        try {
          await axios.post(`http://localhost:8000/like/${postId}/${loggedInUserId}`);
          setPostLikes(prevState => ({
            ...prevState,
            [postId]: { num_likes: prevState[postId].num_likes + 1, liked: true }
          }));
          setIsAnimating(true);
          setIsLikeHovered(false); // Resetta lo stato dell'hover
          setTimeout(() => {
            setIsAnimating(false);
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
          setIsLikeHovered(false); // Resetta lo stato dell'hover
        } catch (error) {
          console.error(`Errore durante la rimozione del like dal post ${postId}:`, error);
        }
      };
      
    const handleDelete = async (postId) => {
        try {
            const response = await axios.delete(`http://localhost:8000/deletepost/${postId}`);
            if (response.status === 200) {
                handleClose(); // Chiude la modal dopo il completamento della chiamata API
                window.location.reload(); // Ricarica la pagina se necessario
            } else {
                console.error(`Errore durante la rimozione del post ${postId}:`, response.statusText);
            }
            setIsLikeHovered(false); // Resetta lo stato dell'hover
        } catch (error) {
            console.error(`Errore durante la rimozione del post ${postId}:`, error);
        }
    };

    const handleCloseList = () => setShowList(false);
    const handleShowList = (numberList, id_post_list) => {
        setShowList(true);
        setNumberList(numberList);
        setIdPostList(id_post_list)
    };

    const handleTextComment = (e) => {
        const text = e.target.value;
        setComment(text);
    }

    async function publishComment(user_id, post_id){
        if(comment !== ''){
            try {
                const data = {
                    idUser: user_id,
                    idPost: post_id,
                    text: comment
                };
        
                const response = await axios.post(`http://localhost:8000/newcomment`, data);
        
                if (response.status === 200) {
                    const nuovoCommento = {
                        id: user_id, // Assumi che la risposta contenga l'ID del nuovo commento
                        username: loggedInUserUsername,
                        text_commento: comment, // Assumi che il commento sia lo stesso inviato
                    };
                    setCommenti(prevCommenti => [nuovoCommento, ...prevCommenti]); // Aggiungi il nuovo commento al primo posto nell'array esistente
                    setComment('');
                    setIndex(index + 1);
                } else {
                    console.error(`Errore durante la pubblicazione del commento ${comment}:`, response.statusText);
                }
            } catch (error) {
                console.error(`Errore durante la pubblicazione del commento ${comment}:`, error);
            }
        }
    }
    
    const handleUserSearchedProfile = (userId) => {
        navigate(`/profile/${userId}`);
        handleClose();
    };

    return (
        <BootstrapModal
            {...props}
            size={(number === 2 || number === 4) ? "md" : "lg"}
            aria-labelledby="contained-modal-title-vcenter"
            dialogClassName="custom-modal modal-dark"
            centered
        >
            <BootstrapModal.Header style={{ height: '60px' }}>
                {number === 1 ? (
                    // Contenuto per il numero 1
                    <table>
                        <tbody>
                            <tr>
                                <th className='left'><button type="button" className="btn-close btn-close-white"  aria-label="Close" onClick={handleClose}></button></th>
                                <th className='center'>Crea un nuovo post</th>
                                {!fileSelected && (
                                    <th className='inv'></th>
                                )}
                                {file && (
                                    <th className='right'><a onClick={handleSavePost} className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" style={{ marginTop:'5%', cursor: 'pointer'}}>Condividi</a></th>   
                                )}
                            </tr>
                        </tbody>
                    </table>                    
                ) : number === 2 ? (
                    // Contenuto per il numero diverso da 1 (modal vuota)
                    <span style={{ textAlign: 'center', width: '100%', display: 'block', fontSize:'20px' }}>Cambia l'immagine del profilo</span>

                ) : number === 3 ? (
                    <span style={{ textAlign: 'center', width: '100%', display: 'block', fontSize:'20px' }}>Post</span>
                ) : (
                    <span style={{ textAlign: 'center', width: '100%', display: 'block', fontSize:'20px' }}>Modifica Informazioni Profilo</span>
                )}
            </BootstrapModal.Header>
            <BootstrapModal.Body>
                {number === 1 ? (
                    // Contenuto per il numero 1
                    <div>
                        {!fileSelected && (
                            <div style={{ padding: '111px', textAlign: 'center' }}>
                                <IoMdImages size={100} />
                                <br />
                                <p style={{ fontSize:'20px', color: '#fff'}}>Seleziona le foto e i video qui</p>
                                <Button variant="primary" onClick={() => document.getElementById('file-input').click()}>Seleziona dal computer</Button>
                                <input id="file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={getFile} />
                            </div>
                        )}
                        {file && (
                            <div className='flex'>
                                <div className="preview-container">
                                    <AvatarEditor
                                        ref={editorRef}
                                        image={file}
                                        width={400}
                                        height={350}
                                        color={[255, 255, 255, 0.6]}
                                        scale={1.5}
                                        rotate={0}
                                    />
                                </div>
                                <div className='description'>
                                    <img src={image_path} alt="User Image" className="imageUserModal" />
                                    <strong>{username}</strong>
                                    <textarea
                                        id="Postdescription"
                                        onChange={handleChangeDescription}
                                        placeholder="Scrivi una didascalia..."
                                        name="desc"
                                        rows="5"
                                        cols="33"
                                        style={{
                                            width: '80%',
                                            height: '50%',
                                            marginTop: '4%',
                                            backgroundColor: '#343a40',
                                            color: '#fff',
                                            border: 'none', // Rimuovi completamente il bordo
                                            borderRadius: '4px', // Aggiungi bordi arrotondati per uno stile più morbido
                                            resize: 'none',
                                            outline: 'none' // Rimuovi l'outline di default
                                        }}
                                    ></textarea>
                                    <p style={{color:'white', fontSize:'14px'}}><strong>Accessibilità</strong></p>
                                    <p style={{color:'white', fontSize:'14px'}}><strong>Impostazioni Avanzate</strong></p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : number === 2 ? (
                    // Contenuto per il numero diverso da 1 (modal vuota)
                    <div>
                        {!fileSelected && (
                            <>
                                <div onClick={() => document.getElementById('file-input').click()} style={{ textAlign: 'center', width: '100%', display: 'block', cursor:'pointer'}}>
                                    <input id="file-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={getFile} />
                                    <a className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"><strong>Carica foto</strong></a>
                                </div>
                                <hr/>
                                <div style={{ textAlign: 'center', width: '100%', display: 'block', cursor:'pointer' }} onClick={() => defaultImgProfile()}>
                                    <a className="link-danger link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"><strong>Rimuovi immagine attuale</strong></a>
                                </div>
                            </>
                        )}
                        {file && (
                            <div style={{ textAlign: 'center', width: '100%', display: 'block'}}>
                                <AvatarEditor
                                    ref={editorRef}
                                    image={file}
                                    width={400}
                                    height={350}
                                    color={[255, 255, 255, 0.6]}
                                    scale={1.5}
                                    rotate={0}
                                />
                            </div>
                        )}
                    </div>
                ) : number === 3 ? (
                    <div className='flex' style={{ height: '350px'}}>
                        {image && postInfo && (
                            <>
                            <div>
                                <img src={image} alt="Post" />
                            </div>
                            <div style={{marginLeft:'3%', width:'50%'}}>
                                <img src={postInfo.imgProfile} alt="User Image" className="imageUserModal" />
                                <strong style={{ cursor: 'pointer' }} onClick={() => handleUserSearchedProfile(postInfo.user_id)}>{postInfo.username}</strong>
                                <hr/>
                                <div style={{ height: '30%', overflowY: 'auto' }}>
                                    {postInfo.descrizionepost || commenti.length > 0 ? (
                                        <>
                                            {postInfo.descrizionepost && (
                                                <p style={{ color: 'white' }}>
                                                    <img src={postInfo.imgProfile} alt="User Image" className="imageUserModal" />
                                                    <strong>{postInfo.username}</strong> 
                                                    <span> {postInfo.descrizionepost} </span>
                                                </p>
                                            )}
                                            {commenti.length > 0 ? (
                                                commenti.map((commento, index) => (
                                                    <p key={index} style={{ color: 'white' }}>
                                                        <img src={`http://localhost/instagram/imgprofile.php?user_id=${commento.id}`} alt="User Image" className="imageUserModal" />
                                                        <strong>{commento.username}</strong> 
                                                        <span> {commento.text_commento} </span>
                                                    </p>
                                                ))
                                            ) : (
                                                <p style={{ color: 'grey' }}>Ancora nessun commento...</p>
                                            )}
                                        </>
                                    ) : (
                                        <p style={{ color: 'grey' }}>Ancora nessun commento...</p>
                                    )}
                                </div>
                                <hr/>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                                    <span>
                                        {postInfo.post_id in postLikes && postLikes[postInfo.post_id].liked ? (
                                            <GoHeartFill
                                            size={25}
                                            onClick={() => handleUnlike(postInfo.post_id)}
                                            onMouseEnter={() => setIsLikeHovered(true)}
                                            onMouseLeave={() => setIsLikeHovered(false)}
                                            style={{ color: 'red', opacity: isLikeHovered ? 0.8 : 1, transition: 'opacity 0.3s ease', cursor: 'pointer', transform: isAnimating ? 'scale(1.2)' : 'scale(1)' }}
                                            />
                                        ) : (
                                            <GoHeart
                                            size={25}
                                            onClick={() => handleLike(postInfo.post_id)}
                                            onMouseEnter={() => setIsLikeHovered(true)}
                                            onMouseLeave={() => setIsLikeHovered(false)}
                                            style={{ color: 'white', opacity: isLikeHovered ? 0.6 : 1, transition: 'opacity 0.3s ease', cursor: 'pointer', transform: isAnimating ? 'scale(1.2)' : 'scale(1)' }}
                                            />
                                        )}
                                        <IoChatbubbleOutline size={25} style={{ marginLeft: '10px' }} />
                                        <FiSend size={25} style={{ marginLeft: '10px' }} />
                                    </span>
                                    <span style={{ marginLeft: 'auto' }}>
                                        <HiOutlineBookmark size={25} />
                                    </span>
                                </div>
                                <p style={{color:'white', marginTop:'2%', cursor:'pointer'}} onClick={() => handleShowList(3, postInfo.post_id)}>Piace a {postLikes[postInfo.post_id] ? postLikes[postInfo.post_id].num_likes : 0} persone</p>
                                <p style={{color:'grey', fontSize:'14px'}}>{dataFormattata}</p>
                                <hr/>
                                <div style={{display:"flex"}}>
                                    <MdInsertEmoticon size={25} />
                                    <Form.Control style={{width:"70%", marginTop:'-2%', marginLeft:'3%', verticalAlign:"middle"}} type="text" onChange={handleTextComment} value={comment} placeholder="Aggiungi un commento..." />
                                    <a style={{ float: 'right', marginLeft:'3%', cursor:'pointer'}} onClick={() => publishComment(loggedInUserId, postInfo.post_id)} className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">Pubblica</a>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{textAlign:'center'}}>
                        <span>Username:</span>
                        <Form.Control type="text" placeholder={loggedInUserUsername} value={usernameNew} onChange={(e) => setUsername(e.target.value)} />
                        <hr/>
                        <span>Password:</span>
                        <Form.Control type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <hr/>
                        <span>Biografia:</span>
                        <Form.Control type="text" placeholder="Enter Description" value={descriptionNew} onChange={(e) => setDescriptionNew(e.target.value)} />
                    </div>
                )}
            </BootstrapModal.Body>
            {(number === 2 || number === 3) && (
                <BootstrapModal.Footer>
                    {!fileSelected && (
                        <>
                            {!ableToDelete && (
                                <a onClick={handleClose} className="link-light link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" style={{ textAlign: 'center', width: '100%', display: 'block', cursor:'pointer' }}>
                                    <strong>Annulla</strong>
                                </a>
                            )}
                            {ableToDelete && (
                                <>
                                    <a onClick={handleClose} className="link-light link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" style={{ textAlign: 'center', width: '48%', display: 'block', cursor:'pointer' }}>
                                        <strong>Annulla</strong>
                                    </a>
                                    <a onClick={() => handleDelete(postInfo.post_id)} className="link-danger link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" style={{ textAlign: 'center', width: '48%', display: 'block', cursor:'pointer' }}>
                                        <strong>Elimina post</strong>
                                    </a>
                                </>
                            )}
                        </>
                    )}
                    {file && (
                        <>
                            <a onClick={handleClose} className="link-light link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" style={{ textAlign: 'center', width: '48%', display: 'block', cursor:'pointer' }}>
                                <strong>Annulla</strong>
                            </a>
                            <a 
                                onClick={handleSaveImgProfile} 
                                className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" 
                                style={{ textAlign: 'center', width: '48%', display: 'block', cursor: 'pointer' }}
                            >
                                <strong>Condividi</strong>
                            </a>
                        </>
                    )}
                </BootstrapModal.Footer> 
            )}
            {number === 4 && (
                <BootstrapModal.Footer>
                    <>
                        <a onClick={handleClose} className="link-light link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" style={{ textAlign: 'center', width: '48%', display: 'block', cursor:'pointer' }}><strong>Annulla</strong></a>
                        <a 
                            onClick={handleSaveChanges} 
                            className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover" 
                            style={{ textAlign: 'center', width: '48%', display: 'block', cursor: 'pointer' }}
                        >
                            <strong>Salva</strong>
                        </a>
                    </>
                </BootstrapModal.Footer>
            )}
            <ListModal
                show={showList}
                onHide={handleCloseList}
                backdrop="static"
                keyboard={false}
                number={numberList}
                id_post = {id_post_list}
            />
        </BootstrapModal>
    );
};

export default ModalComponent;
