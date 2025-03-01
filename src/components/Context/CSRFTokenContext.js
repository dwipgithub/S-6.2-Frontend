import React, { createContext, useState, useContext } from 'react';

const CSRFTokenContext = createContext();

export const CSRFTokenProvider = ({ children }) => {
    const [CSRFToken, setCSRFToken] = useState('4c7936f-b388-4909-b26c-d07dbafdc7a7')

    const simpanCSRFToken = (newToken) => {
        setCSRFToken(newToken)
    }

    return (
        <CSRFTokenContext.Provider value={{CSRFToken, simpanCSRFToken}} >
            {children}
        </CSRFTokenContext.Provider>
    )
}

export const useCSRFTokenContext = () => useContext(CSRFTokenContext);