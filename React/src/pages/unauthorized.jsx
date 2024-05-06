import React, { useState } from 'react';
import './css/unauthorizedCss.css'

const unauthorizedPage = () => {
    return (
        <div class="container">
            <h1>Error 401 - Unauthorized</h1>
            <p>You are not authorized to access this page.</p>
            <p>Please <a href="/">return to the homepage</a> or contact the administrator for assistance.</p>
        </div>
      );
    };
    
    export default unauthorizedPage;