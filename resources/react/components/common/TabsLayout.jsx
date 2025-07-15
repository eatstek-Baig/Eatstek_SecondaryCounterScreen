import React, { useState, useEffect } from 'react';
import { RiAdminFill } from "react-icons/ri";
import { FaShopSlash, FaShop } from "react-icons/fa6";
import Products from '../client/Products';
import { getIpAddress } from '../../lib/utils/helpers';
import Deals from '../client/Deals'
import { useSGlobalContext } from '../../lib/contexts/useGlobalContext';
import Cart from '../client/Cart';
import Checkout from '../client/Checkout';
import CheckoutPopup from './CustomPopoup';
import { setCookie } from 'cookies-next';
import LogOut from '../client/LogOut';
import HoldOrders from '../client/HoldOrder';
import { productApi } from "../../lib/services";


const TabsLayout = () => {
    const { allData } = useSGlobalContext();
    const [activeTab, setActiveTab] = useState('menu');
    const { toggleCategoryIdFunction, toggleHomeIdFunction, home_id, isCheckout, toggleCheckoutFunction } = useSGlobalContext();
    const [data, setData] = useState(null);
    const [activeCategory, setActiveCategory] = useState("");
    const [openPopup, setOpenPopup] = useState(false);
    const [hasDeals, setHasDeals] = useState(false);
    

    useEffect(() => {
        if (allData && allData.catalogs && allData.catalogs[0]?.data?.categories) {
            setData(allData);
            // Check if deals exist
            checkForDeals(allData);
        }
        const getApiAddress = async () => {
            try {
                const ipAddress = await getIpAddress();
                setCookie("ip_address", ipAddress);
            } catch (error) {
                console.log(error);
            }
        }
        getApiAddress();
    }, [allData]);

    // Function to check if deals exist
    const checkForDeals = (data) => {
        // Check if deals exist in the deals array
        if (data?.catalogs?.[0]?.data?.deals?.length > 0) {
            setHasDeals(true);
        } else {
            setHasDeals(false);
        }
    };

    useEffect(() => {
        if (home_id) {
            setActiveTab("menu");
            toggleCategoryIdFunction("");
            toggleHomeIdFunction("");
        }
        if (isCheckout) {
            setOpenPopup(true);
        } else {
            setOpenPopup(false);
        }
    }, [home_id, isCheckout])

    // Tab content based on the active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'menu':
                return <Products />;
            case 'hold-orders':
                return <HoldOrders />;
    
            case 'deals':
                return <Deals />;
        
            default:
                return <Products />;
        }
    };
    const tabsThatHideCart = [     
       // 'hold-orders',
       
    ]
    const shouldHideCart = tabsThatHideCart.includes(activeTab);
    const handleClick = (id) => {
        setActiveTab(id);
        toggleCategoryIdFunction("");
        setActiveCategory("");
    }

    const handleClickCategory = (catId) => {
        toggleCategoryIdFunction(catId);
        setActiveCategory(catId);
        setActiveTab("");
    }

    const handleClosePop = () => {
        setOpenPopup(false);
        toggleCheckoutFunction(false);
    }

    // Enhanced button styles for better POS experience
    const topButtonStyle = {
        fontSize: '22px',
        fontWeight: '700',
        padding: '18px 12px',
        lineHeight: '1.2',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        minHeight: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        borderWidth: '1px',
        borderStyle: 'solid'
    };

    const sideButtonStyle = {
        fontSize: '20px', // Kept large for readability
        fontWeight: '700',
        padding: '12px 8px', // Reduced padding for smaller buttons
        lineHeight: '1.2',
        letterSpacing: '0.3px',
        minHeight: '50px', // Reduced height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transition: 'all 0.2s ease',
        borderWidth: '1px',
        borderStyle: 'solid'
    };

    return (
        <>
            {/* Enhanced Header with larger elements */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '3px solid #e5e7eb',
                backgroundColor: '#ffffff',
                zIndex: 10,
                position: 'fixed',
                left: 0,
                right: 0,
                top: 0,
                minHeight: '100px'
            }}>
                <a href="/counter-screen" style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '280px',
                    textDecoration: 'none'
                }}>
                    <span style={{
                        fontSize: '28px',
                        fontWeight: '900',
                        color: '#111827',
                        letterSpacing: '1px'
                    }}>Test Restaurant</span>
                </a>
                
                <nav style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    flex: 1
                }}>
                    

                    <button
                        onClick={() => handleClick('hold-orders')}
                        style={{
                            ...topButtonStyle,
                            width: '220px',
                            backgroundColor: activeTab === 'hold-orders' ? '#d97706' : '#f3f4f6',
                            color: activeTab === 'hold-orders' ? '#ffffff' : '#d97706',
                            borderColor: '#d97706',
                            borderRadius: '25px 8px 25px 8px'
                        }}
                    >
                        <span style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <FaShop size={24} /> HOLD
                        </span>
                    </button>

                  

                   
               </nav>
               <div style={{marginLeft: 'auto'}}>
                    <LogOut />
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{paddingTop: '110px'}}>
                {/* Enhanced Sidebar - Increased width to 240px */}
                <div style={{
                    width: '240px', // Increased to 240px
                    position: 'fixed',
                    left: 0,
                    top: '110px',
                    bottom: 0,
                    paddingLeft: '16px',
                    paddingRight: '16px',
                    backgroundColor: '#f9fafb',
                    borderRight: '3px solid #e5e7eb'
                }}>
                    <button 
                        onClick={() => handleClick('menu')} 
                        style={{
                            ...sideButtonStyle,
                            width: '100%',
                            marginBottom: '10px',
                            marginTop:'20px',
                            
                            backgroundColor: activeTab === 'menu' ? '#d97706' : '#ffffff',
                            color: activeTab === 'menu' ? '#ffffff' : '#111827',
                            borderColor: '#d97706',
                            borderRadius: '16px 8px 16px 8px'
                        }}
                    >
                        ALL CATEGORIES
                    </button>
                    
                    {/* Conditionally render Deals button only if deals exist */}
                    {hasDeals && (
                        <button 
                            onClick={() => handleClick('deals')} 
                            style={{
                                ...sideButtonStyle,
                                width: '100%',
                                marginBottom: '10px',
                                backgroundColor: activeTab === 'deals' ? '#d97706' : '#ffffff',
                                color: activeTab === 'deals' ? '#ffffff' : '#111827',
                                borderColor: '#d97706',
                                borderRadius: '16px 8px 16px 8px'
                            }}
                        >
                            DEALS
                        </button>
                    )}
                    
                    <div style={{
                        overflowY: 'auto',
                        height: 'calc(100vh - 280px)',
                        paddingRight: '8px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#d97706 #f1f1f1'
                    }}>
                        {data?.catalogs[0]?.data?.categories?.length > 0 && data?.catalogs[0]?.data?.categories?.map((item, index) => {
                            if (item?.name === "Deals") {
                                return null;
                            }
                            return (
                                <button 
                                    onClick={() => handleClickCategory(item?.id)} 
                                    key={index} 
                                    style={{
                                        ...sideButtonStyle,
                                        width: '100%',
                                        marginBottom: '10px',
                                        backgroundColor: activeCategory === item?.id ? '#d97706' : '#ffffff',
                                        color: activeCategory === item?.id ? '#ffffff' : '#111827',
                                        borderColor: '#d97706',
                                        borderRadius: '16px 8px 16px 8px'
                                    }}
                                >
                                    {item?.name?.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area with updated spacing for 240px sidebar */}
                <div style={{
                    paddingLeft: '256px', // Adjusted for 240px sidebar + 16px padding
                    paddingRight: shouldHideCart ? '16px' : '376px',
                    paddingTop: '16px',
                    paddingBottom: '16px'
                }}>
                    {renderContent()}
                </div>
                
                {/* Cart - only show when needed */}
                {!shouldHideCart && <Cart />}
            </div>
            
            <CheckoutPopup open={openPopup} onClose={handleClosePop} title="Checkout" items={<Checkout />} />
        </>
    );
};

export default TabsLayout;