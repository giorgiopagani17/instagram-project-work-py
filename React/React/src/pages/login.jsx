import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import ReCAPTCHA from "react-google-recaptcha";
import {
    loginSuccess
  } from '../features/user.js'

const logo = {
    imageUrl: './img/logo.png',
    imageWidth: 250,
    imageHeight: 135
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [recaptchaValue, setRecaptchaValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch()

    const handleLogin = async () => {
        // if (!recaptchaValue) {
        //     setErrorMessage('Il captcha è obbligatorio');
        //     return;
        // }

        try {
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, password: password })
            });

            if (response.ok) {
                const data = await response.json();
                dispatch(loginSuccess(data.user)); // Dispaccia l'azione di login con i dati dell'utente
             
                localStorage.setItem("user",JSON.stringify(data.user));
                navigate("/home");
            } else if (response.status === 401) {
                navigate("/unauthorized");
            } else {
                setErrorMessage('Errore durante il login: ' + response.statusText);
            }
        } catch (error) {
            setErrorMessage('Errore durante il login: ' + error.message);
        }
    };

    const onChangeRecaptcha = (value) => {
        setRecaptchaValue(value);
        setErrorMessage('');
    };

    return (
        <Container className="mt-5 text-center mx-auto w-25 p-4">
            <Form>
                <img
                    src={logo.imageUrl}
                    style={{
                        width: logo.imageWidth,
                        height: logo.imageHeight
                    }}
                />
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Connettiti al tuo account</Form.Label>
                    <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Link to="/register">Non ho un account</Link>
                </Form.Group>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ReCAPTCHA
                        sitekey="6LdL954pAAAAAOxIyxybxaQvXJ2SB-vhAtxQOkan"
                        onChange={onChangeRecaptcha}
                    />
                </div>
                {errorMessage && <div className="text-danger">{errorMessage}</div>}
                <br />
                <Button variant="primary" onClick={handleLogin}>Log In</Button>
            </Form>
        </Container>
    );
};

export default Login;
