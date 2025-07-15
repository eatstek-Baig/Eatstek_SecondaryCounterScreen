import React from 'react';
import 'react-lazy-load-image-component/src/effects/blur.css';
import PublicRoutes from './components/common/PublicRoutes';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from "react-use-cart";
import { GlobalProvider } from './lib/contexts/useGlobalContext';
import { WebSocketProvider } from './lib/providers/WebSocketProvider';

function Main() {

    return (
        <CartProvider>
            <GlobalProvider>
                <WebSocketProvider>
                    <ToastContainer />
                    <PublicRoutes />
                </WebSocketProvider>
            </GlobalProvider>
        </CartProvider>
    );
}

export default Main;
