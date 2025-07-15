import React, { useEffect, useState, useRef } from 'react';
import { useCart } from "react-use-cart";
import { BsTrash } from "react-icons/bs";
import { useSGlobalContext } from '../../lib/contexts/useGlobalContext';

import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { FaKeyboard } from "react-icons/fa";


const Cart = ({ onClose }) => {
    const {
        isEmpty,
        totalUniqueItems,
        items,
        updateItemQuantity,
        removeItem,
        cartTotal,
        emptyCart
    } = useCart();

    // console.log("Items", items)

    const [isVisible, setIsVisible] = useState(false);
    const { toggleCheckoutFunction } = useSGlobalContext();
    const sidebarRef = useRef(null); // Ref for the sidebar

    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

    const [showDiscountPopup, setShowDiscountPopup] = useState(false);
    const [discountType, setDiscountType] = useState('percentage'); // 'percentage', 'amount', 'newPrice'
    const [discountValue, setDiscountValue] = useState('');
    const [discount, setDiscount] = useState(null); // Store discount info

    const [showKeyboard, setShowKeyboard] = useState(false);
    const keyboard = useRef();
    const currentInputRef = useRef(null);

    const discountValueRef = useRef();


    useEffect(() => {

        if (isEmpty) {
            // If cart is empty, remove any existing discount
            setDiscount(null);
            localStorage.removeItem('cartDiscount');
        }
    }, [isEmpty]);


    const calculateDiscountedTotal = () => {
        if (!discount) return cartTotal;

        const value = parseFloat(discount.value);
        if (isNaN(value)) return cartTotal;

        switch (discount.type) {
            case 'percentage':
                return cartTotal * (1 - value / 100);
            case 'amount':
                return Math.max(0, cartTotal - value);
            case 'newPrice':
                return value;
            default:
                return cartTotal;
        }
    };



    const applyDiscount = () => {
        if (!discountValue) return;

        const value = parseFloat(discountValue);
        if (isNaN(value)) return;

        let discountedTotal = cartTotal;

        switch (discountType) {
            case 'percentage':
                discountedTotal = parseFloat((cartTotal * (1 - value / 100)).toFixed(2));
                break;
            case 'amount':
                discountedTotal = Math.max(0, cartTotal - value);
                break;
            case 'newPrice':
                discountedTotal = value;
                break;
            default:
                discountedTotal = cartTotal;
        }

        const discountInfo = {
            type: discountType,
            value: value,
            originalTotal: cartTotal,
            discountedTotal: discountedTotal
        };

        setDiscount(discountInfo);
        localStorage.setItem('cartDiscount', JSON.stringify(discountInfo));

        setShowDiscountPopup(false);
        setDiscountValue('');
    };

    const removeDiscount = () => {
        setDiscount(null);
        // Remove from localStorage
        localStorage.removeItem('cartDiscount');
    };

    const handleDiscount = () => {
        setShowDiscountPopup(true);
    };


    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleInputFocus = (inputRef) => {
        currentInputRef.current = inputRef;
        setShowKeyboard(true);
    };

    const handleKeyboardChange = (input) => {
        if (currentInputRef.current) {
            const inputName = currentInputRef.current.id;

            if (inputName === "discountValue") {
                // Handle numeric input with decimal for discount value
                const filteredInput = input.replace(/[^0-9.]/g, '');
                // Ensure only one decimal point
                const parts = filteredInput.split('.');
                if (parts.length > 2) {
                    setDiscountValue(parts[0] + '.' + parts.slice(1).join(''));
                } else {
                    setDiscountValue(filteredInput);
                }
            }
        }
    };

    const handleKeyPress = (button) => {
        if (button === "{enter}") {
            setShowKeyboard(false);
        }
    };

    const handleKeyboardHide = () => {
        setShowKeyboard(false);
    };

    // Handle closing the sidebar on outside click
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                handleClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick); // Clean up event listener on unmount
        };
    }, [isVisible]);

    useEffect(() => {
        const interval = setInterval(() => {
            emptyCart();
        }, 10 * 60 * 1000);

        return () => clearInterval(interval);
    }, [emptyCart]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleCheckout = () => {
        toggleCheckoutFunction(true);
    };

    const handleHoldOrder = () => {
        // Get existing hold orders from localStorage
        const existingHoldOrders = JSON.parse(localStorage.getItem('holdOrders')) || [];

        // Find the highest existing order number
        const highestOrder = existingHoldOrders.reduce((max, order) => {
            const orderNum = parseInt(order.id.toString().replace('#', ''));
            return orderNum > max ? orderNum : max;
        }, 0);

        // Create sequential ID (pad with leading zeros)
        const newOrderNum = highestOrder + 1;
        const newOrderId = `#${String(newOrderNum).padStart(4, '0')}`;

        // Create a new hold order with current items and timestamp
        const newHoldOrder = {
            id: newOrderId,
            items: [...items],
            total: cartTotal,
            createdAt: new Date().toISOString()
        };

        // Add the new order to existing ones
        const updatedHoldOrders = [...existingHoldOrders, newHoldOrder];

        // Save back to localStorage
        localStorage.setItem('holdOrders', JSON.stringify(updatedHoldOrders));

        // Clear the current cart
        emptyCart();

        // Dispatch a custom event to notify other components
        const event = new CustomEvent('holdOrdersUpdated');
        window.dispatchEvent(event)

    };

    const handleClearCart = () => {
        setShowClearCartConfirm(true);

    };

    const confirmClearCart = () => {
        emptyCart();
        setDiscount(null);
        localStorage.removeItem('cartDiscount');
        setShowClearCartConfirm(false);
    };

    const cancelClearCart = () => {
        setShowClearCartConfirm(false);
    };

    const displayTotal = discount ? calculateDiscountedTotal() : cartTotal;

    return (
        <div className='w-[350px] fixed right-0 top-[93px] bottom-0 border-s border-gray-200 pt-[30px] px-[15px] pb-[130px] flex flex-col'>

            {
                isEmpty ? <p>Cart is empty</p> :
                    <>
                        {/* <h2 className='text-xl font-bold border-b border-gray-500 mb-3 pb-2'>Your Cart</h2> */}
                        <div className="flex justify-between items-center mb-3">
                            <h2 className='text-xl font-bold'>Your Cart ({totalUniqueItems})</h2>

                            <button
                                onClick={handleClearCart}
                                className="px-4 py-2 bg-red-600 text-sm text-white rounded">
                                Clear Cart
                            </button>
                        </div>
                        {/* Clear Cart Confirmation Popup */}
                        {showClearCartConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                                    <h3 className="text-lg font-bold mb-4">Clear Cart</h3>
                                    <p className="mb-4">Are you sure you want to clear your cart?</p>
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={cancelClearCart}
                                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmClearCart}
                                            className="px-4 py-2 bg-[#D97706] text-white rounded hover:bg-red-600"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className='flex-1 overflow-y-auto pr-1 mb-4'>
                            {/* <ul className='overflow-y-auto h-full pr-1'> */}
                            <ul>
                                {items.map((item) => (
                                    <li key={item.id} className="mb-4 border-b pb-2">
                                        <div className="flex justify-between">
                                            <span>{item.name}{item?.meal && <span className='text-[#d97766] text-sm font-bold'> (Meal)</span>} {item?.deal && <span className='text-[#d97766] text-sm font-bold'> (Deal)</span>}</span>
                                            <span> £{typeof item.price === 'number' ?
                                                item.price.toFixed(2) :
                                                parseFloat(item.price || 0).toFixed(2)}</span>
                                        </div>
                                        {item.size && <p>Size : {item.size}</p>}
                                        {item.addonss && item.addonss.length > 0 && (
                                            <p>Addons: {item.addonss.join(', ')}</p>
                                        )}

                                        {item.choices &&
                                            item.choices.map((choice) => {
                                                // Grouping choice options by choice_name
                                                const groupedChoices = (choice?.choice_options || [])?.reduce((acc, option) => {
                                                    const name = option?.choice_name;
                                                    if (!acc[name]) {
                                                        acc[name] = [];
                                                    }
                                                    acc[name].push(option.option_name);
                                                    return acc;
                                                }, {});

                                                return (
                                                    <div key={choice.choice_id} className="mb-4">
                                                        {Object.entries(groupedChoices)?.map(([choiceName, options]) => (
                                                            <div key={choiceName}>
                                                                <p>
                                                                    {choiceName} :{" "}
                                                                    {options.map((option, index) => (
                                                                        <span key={index}>
                                                                            {option}
                                                                            {index !== options.length - 1 && ", "}
                                                                        </span>
                                                                    ))}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })}



                                        {item.selectedProducts &&
                                            item.selectedProducts.map((product) => (
                                                <div key={product.category_id}>
                                                    {/* <h2 className="font-bold text-lg">{product.category_name}</h2> */}
                                                    {product?.selected_products &&
                                                        product?.selected_products?.map((selectedProduct) => {
                                                            const groupedChoices = (selectedProduct.choices || []).reduce((acc, choice) => {
                                                                const choiceName = choice.choice_name;
                                                                if (!acc[choiceName]) {
                                                                    acc[choiceName] = [];
                                                                }
                                                                acc[choiceName].push(choice.name);
                                                                return acc;
                                                            }, {});

                                                            return (
                                                                <div key={selectedProduct.pid} className="mt-1">
                                                                    <h3 className="text-md font-semibold">{selectedProduct.product_name}
                                                                        <span className="text-sm font-normal">
                                                                            {"  "} ({product.category_name})
                                                                        </span>
                                                                    </h3>
                                                                    {Object.entries(groupedChoices)?.map(([choiceName, options]) => (
                                                                        <div key={choiceName}>
                                                                            <p>
                                                                                {choiceName} : {" "}
                                                                                {options.map((option, index) => (
                                                                                    <span key={index}>
                                                                                        {option}
                                                                                        {index !== options.length - 1 && ", "}
                                                                                    </span>
                                                                                ))}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })}
                                                </div>
                                            ))}

                                        <div className="flex justify-between items-center mt-2">
                                            <div>
                                                <button
                                                    onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                    className="px-2 py-1 bg-gray-200 rounded-l"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                    className="px-2 py-1 bg-gray-200 rounded-r"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 p-2 hover:bg-red-100 rounded-full"
                                            >
                                                <BsTrash size={20} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>





                        <div className='mt-auto'>
                            <div className="flex justify-between items-center py-2 border-t border-b border-gray-200 mb-4">
                                <span className="font-bold">Subtotal:</span>
                                <span>£{cartTotal.toFixed(2)}</span>
                            </div>

                            {discount && (
                                <div className="flex justify-between items-center py-2 border-b border-gray-200 mb-2">
                                    <div className="flex items-center">
                                        <span className="font-bold mr-2">Discount:</span>
                                        <span className="text-sm">
                                            {discount.type === 'percentage' ? `${discount.value}%` :
                                                discount.type === 'amount' ? `-£${discount.value.toFixed(2)}` :
                                                    `New Price`}
                                        </span>
                                        <button
                                            onClick={removeDiscount}
                                            className="ml-2 text-red-500 text-sm"
                                        >
                                            (Remove)
                                        </button>
                                    </div>
                                    <span className="text-red-500">
                                        -£{(discount.originalTotal - displayTotal).toFixed(2)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2 mb-4">
                                <span className="font-bold">Total:</span>
                                <span className="font-bold text-lg">
                                    £{displayTotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full px-4 py-2 bg-[#D97706] text-white rounded"
                                >
                                    Checkout (£{displayTotal.toFixed(2)})
                                </button>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleHoldOrder}
                                        className="w-1/2 px-4 py-2 bg-gray-500 text-white rounded"
                                    >
                                        Hold Order
                                    </button>
                                    <button
                                        onClick={handleDiscount}
                                        className="w-1/2 px-4 py-2 bg-gray-500 text-white rounded"
                                    >
                                        {discount ? 'Change Discount' : 'Discount'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showDiscountPopup && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                                    <h3 className="text-lg font-bold mb-4">Apply Discount</h3>

                                    <div className="mb-4">
                                        <label className="block mb-2 font-medium">Discount Type</label>
                                        <div className="flex flex-col space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    className="mr-2"
                                                    checked={discountType === 'percentage'}
                                                    onChange={() => setDiscountType('percentage')}
                                                />
                                                Percentage (%)
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    className="mr-2"
                                                    checked={discountType === 'amount'}
                                                    onChange={() => setDiscountType('amount')}
                                                />
                                                Fixed Amount (£)
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    className="mr-2"
                                                    checked={discountType === 'newPrice'}
                                                    onChange={() => setDiscountType('newPrice')}
                                                />
                                                Set New Price (£)
                                            </label>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="block mb-2 font-medium">
                                            {discountType === 'percentage' ? 'Percentage' :
                                                discountType === 'amount' ? 'Amount' : 'New Price'}
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                id="discountValue"
                                                type="text"
                                                className="w-full p-2 border rounded"
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(e.target.value)}
                                                placeholder={
                                                    discountType === 'percentage' ? 'Enter percentage (e.g. 10)' :
                                                        discountType === 'amount' ? 'Enter amount (e.g. 2.50)' :
                                                            'Enter new price (e.g. 32.00)'
                                                }
                                                ref={discountValueRef}
                                                onFocus={() => handleInputFocus(discountValueRef.current)}
                                            />
                                            <FaKeyboard
                                                className="ml-2 text-gray-500 cursor-pointer hover:text-blue-500"
                                                onClick={() => {
                                                    discountValueRef.current.focus();
                                                    setShowKeyboard(true);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-medium">Original Total:</span>
                                        <span>£{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="font-medium">Discounted Total:</span>
                                        <span className="font-bold">
                                            £{calculateDiscountedTotal().toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => {
                                                setShowDiscountPopup(false);
                                                setShowKeyboard(false);
                                            }}

                                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={applyDiscount}
                                            className="px-4 py-2 bg-[#D97706] text-white rounded hover:bg-[#B36200]"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showKeyboard && (
                            // <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                            //     <div className="animate__animated animate__fadeInUp bg-white p-4 rounded-lg shadow-xl w-full max-w-xs">
                            <div className="fixed z-50" style={{
                                top: '50%',
                                left: '60%', // Position to the right of center
                                transform: 'translateY(-50%)'
                            }}>
                                <div className="animate__animated animate__fadeInUp bg-white p-4 rounded-lg shadow-xl w-full max-w-xs">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-medium text-gray-700">
                                            {currentInputRef.current?.placeholder || 'Enter Value'}
                                        </span>
                                        <button
                                            onClick={handleKeyboardHide}
                                            className="text-gray-500 hover:text-gray-700 text-lg"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <Keyboard
                                        keyboardRef={r => (keyboard.current = r)}
                                        onChange={handleKeyboardChange}
                                        onKeyPress={handleKeyPress}
                                        layout={{
                                            default: [
                                                "1 2 3",
                                                "4 5 6",
                                                "7 8 9",
                                                "0 . {bksp}",
                                                "{enter}"
                                            ]
                                        }}
                                        display={{
                                            "{bksp}": "⌫",
                                            "{enter}": "Done"
                                        }}
                                        theme="hg-theme-default hg-layout-numeric"
                                        buttonTheme={[
                                            {
                                                class: "hg-button-enter",
                                                buttons: "{enter}"
                                            }
                                        ]}
                                        style={{
                                            width: "100%",
                                            backgroundColor: "#f9fafb",
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                    </>
            }
        </div>
    );
};

export default Cart;
