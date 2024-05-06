import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import ReCAPTCHA from "react-google-recaptcha";

const logo = {
    imageUrl: './img/logo.png',
    imageWidth: 250,
    imageHeight: 135
};

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [recaptchaValue, setRecaptchaValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        if (!recaptchaValue) {
            setErrorMessage('Il captcha è obbligatorio');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/reg_utente', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username: username, email: email, password: password}),
            })

            if (response.ok) {
                navigate("/");
            } else if (response.status === 401) {
                navigate("/unauthorized");
            } else if (response.status === 400){
                setErrorMessage("Email o Username già in uso.");
            }
        } catch (error) {
            setErrorMessage('Errore durante il la registazione: ' + error.message);
        }
    };
    
    const onChangeRecaptcha = (value) => {
        setRecaptchaValue(value);
        setErrorMessage(''); // Resetta il messaggio di errore quando il captcha viene fornito
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

                <Form.Group className="mb-3" controlId="formBasicUsername">
                <Form.Label>Crea il tuo account</Form.Label>
                    <Form.Control type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Form.Text className="text-muted">
                        We'll never share your email with anyone else.
                    </Form.Text>
                </Form.Group>


                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicCheckbox">
                    <Link to="/">Ho già un account</Link>
                </Form.Group>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <ReCAPTCHA
                        sitekey="6LdL954pAAAAAOxIyxybxaQvXJ2SB-vhAtxQOkan"
                        onChange={onChangeRecaptcha}
                    />
                </div>
                {errorMessage && <div className="text-danger">{errorMessage}</div>}
                <br />                
                <Button variant="primary" onClick={handleRegister}>Register</Button>
            </Form>
        </Container>
    );
};

export default Register;
