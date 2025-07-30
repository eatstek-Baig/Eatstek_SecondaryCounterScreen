import React from 'react';
import 'react-lazy-load-image-component/src/effects/blur.css';
import PublicRoutes from './components/common/PublicRoutes';
import { ToastContainer } from 'react-toastify';
import { CartProvider } from "react-use-cart";
import { GlobalProvider } from './lib/contexts/useGlobalContext';
import { WebSocketProvider } from './lib/providers/WebSocketProvider';
// import { SubscriptionModal } from './components/common/SubscriptionAlert';
//  import { SubscriptionBlock } from './components/common/SubscriptionBlock';


function Main() {

    return (
        <CartProvider>
            <GlobalProvider>
                <WebSocketProvider>
                    <ToastContainer />
                    <PublicRoutes />
                    {/* <SubscriptionModal/> */}
                    {/* <SubscriptionBlock /> */}
                </WebSocketProvider>
            </GlobalProvider>
        </CartProvider>
    );
}

export default Main;

