import React, { useEffect, useState, useRef } from 'react';
import { useCart } from "react-use-cart";
import { BsTrash } from "react-icons/bs";
import { useSGlobalContext } from '../../lib/contexts/useGlobalContext';

import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { FaKeyboard, FaPlus } from "react-icons/fa";

const Cart = ({ onClose }) => {
    const {
        isEmpty,
        totalUniqueItems,
        items,
        updateItemQuantity,
        removeItem,
        cartTotal,
        emptyCart,
        addItem
    } = useCart();

    const [isVisible, setIsVisible] = useState(false);
    const { toggleCheckoutFunction } = useSGlobalContext();
    const sidebarRef = useRef(null);

    const [showClearCartConfirm, setShowClearCartConfirm] = useState(false);

    const [showDiscountPopup, setShowDiscountPopup] = useState(false);
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [discount, setDiscount] = useState(null);

    // Custom Item States
    const [showCustomItemPopup, setShowCustomItemPopup] = useState(false);
    const [customItem, setCustomItem] = useState({
        name: '',
        price: '',
        quantity: 1
    });

    const [showKeyboard, setShowKeyboard] = useState(false);
    const keyboard = useRef();
    const currentInputRef = useRef(null);

    const discountValueRef = useRef();
    const customItemNameRef = useRef();
    const customItemPriceRef = useRef();

    useEffect(() => {
        if (isEmpty) {
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
        localStorage.removeItem('cartDiscount');
    };

    const handleDiscount = () => {
        setShowDiscountPopup(true);
    };

    // Custom Item Functions
    const handleCustomItem = () => {
        setShowCustomItemPopup(true);
        setCustomItem({ name: '', price: '', quantity: 1 });
    };

    const addCustomItem = () => {
        if (!customItem.name.trim() || !customItem.price || customItem.price <= 0) {
            alert('Please fill in all fields with valid values');
            return;
        }

        const customItemForCart = {
            id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: customItem.name.trim(),
            price: parseFloat(customItem.price),
            quantity: customItem.quantity,
            isCustomItem: true, // Flag to identify custom items
            product_id: 'custom',
            productId: 'custom'
        };

        addItem(customItemForCart, customItem.quantity);
        setShowCustomItemPopup(false);
        setCustomItem({ name: '', price: '', quantity: 1 });
        setShowKeyboard(false);
    };

    const handleCustomItemInputChange = (field, value) => {
        setCustomItem(prev => ({
            ...prev,
            [field]: value
        }));
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

            if (inputName === "discountValue" || inputName === "customItemPrice") {
                const filteredInput = input.replace(/[^0-9.]/g, '');
                const parts = filteredInput.split('.');
                const finalInput = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filteredInput;

                if (inputName === "discountValue") {
                    setDiscountValue(finalInput);
                } else if (inputName === "customItemPrice") {
                    handleCustomItemInputChange('price', finalInput);
                }
            } else if (inputName === "customItemName") {
                handleCustomItemInputChange('name', input);
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
            document.removeEventListener('mousedown', handleOutsideClick);
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
        const existingHoldOrders = JSON.parse(localStorage.getItem('holdOrders')) || [];
        const highestOrder = existingHoldOrders.reduce((max, order) => {
            const orderNum = parseInt(order.id.toString().replace('#', ''));
            return orderNum > max ? orderNum : max;
        }, 0);

        const newOrderNum = highestOrder + 1;
        const newOrderId = `#${String(newOrderNum).padStart(4, '0')}`;

        const newHoldOrder = {
            id: newOrderId,
            items: [...items],
            total: cartTotal,
            createdAt: new Date().toISOString()
        };

        const updatedHoldOrders = [...existingHoldOrders, newHoldOrder];
        localStorage.setItem('holdOrders', JSON.stringify(updatedHoldOrders));
        emptyCart();

        const event = new CustomEvent('holdOrdersUpdated');
        window.dispatchEvent(event);
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

    // Determine if current input is for custom item name (alphabetic keyboard)
    const isAlphabeticKeyboard = currentInputRef.current?.id === 'customItemName';

    return (
        <div className='w-[350px] fixed right-0 top-[93px] bottom-0 border-s border-gray-200 pt-[30px] px-[15px] pb-[130px] flex flex-col ' ref={sidebarRef}>
            {isEmpty ? (
                <div className="flex flex-col items-center justify-center h-full">
                    <p className="mb-4">Cart is empty</p>
                    <button
                        onClick={handleCustomItem}
                        className="flex items-center gap-2 px-4 py-2 bg-[#D97706] text-white rounded hover:bg-[#B36200]"
                    >
                        <FaPlus size={14} />
                        Add Custom Item
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className='text-xl font-bold'>Your Cart ({totalUniqueItems})</h2>
                        <button
                            onClick={handleClearCart}
                            className="px-4 py-2 bg-red-600 text-sm text-white rounded">
                            Clear Cart
                        </button>
                    </div>

                    {/* Add Custom Item Button */}
                    <div className="mb-4">
                        <button
                            onClick={handleCustomItem}
                            className="flex items-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            <FaPlus size={14} />
                            Add Custom Item
                        </button>
                    </div>

                    {/* Clear Cart Confirmation Popup */}
                    {showClearCartConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
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
                        <ul>
                            {items.map((item) => (
                                <li key={item.id} className="mb-4 border-b pb-2">
                                    <div className="flex justify-between">
                                        <span>
                                            {item.name}
                                            {item.isCustomItem && <span className='text-green-600 text-sm font-bold'> (Custom)</span>}
                                            {item?.meal && <span className='text-[#d97766] text-sm font-bold'> (Meal)</span>}
                                            {item?.deal && <span className='text-[#d97766] text-sm font-bold'> (Deal)</span>}
                                        </span>
                                        <span>£{typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || 0).toFixed(2)}</span>
                                    </div>

                                    {/* Only show details for non-custom items */}
                                    {!item.isCustomItem && (
                                        <>
                                            {item.size && <p>Size : {item.size}</p>}
                                            {item.addonss && item.addonss.length > 0 && (
                                                <p>Addons: {item.addonss.join(', ')}</p>
                                            )}
                                            {/* ... rest of the item details ... */}
                                        </>
                                    )}

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
                </>
            )}

            {/* Custom Item Popup */}
            {showCustomItemPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-bold mb-4">Add Custom Item</h3>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Item Name</label>
                            <div className="flex items-center">
                                <input
                                    id="customItemName"
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={customItem.name}
                                    onChange={(e) => handleCustomItemInputChange('name', e.target.value)}
                                    placeholder="e.g., Sliced Onion"
                                    ref={customItemNameRef}
                                    onFocus={() => handleInputFocus(customItemNameRef.current)}
                                />
                                <FaKeyboard
                                    className="ml-2 text-gray-500 cursor-pointer hover:text-blue-500"
                                    onClick={() => {
                                        customItemNameRef.current.focus();
                                        setShowKeyboard(true);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Price (£)</label>
                            <div className="flex items-center">
                                <input
                                    id="customItemPrice"
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={customItem.price}
                                    onChange={(e) => handleCustomItemInputChange('price', e.target.value)}
                                    placeholder="e.g., 2.50"
                                    ref={customItemPriceRef}
                                    onFocus={() => handleInputFocus(customItemPriceRef.current)}
                                />
                                <FaKeyboard
                                    className="ml-2 text-gray-500 cursor-pointer hover:text-blue-500"
                                    onClick={() => {
                                        customItemPriceRef.current.focus();
                                        setShowKeyboard(true);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium">Quantity</label>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleCustomItemInputChange('quantity', Math.max(1, customItem.quantity - 1))}
                                    className="px-3 py-2 bg-gray-200 rounded-l"
                                >
                                    -
                                </button>
                                <span className="px-4 py-2 border-t border-b">{customItem.quantity}</span>
                                <button
                                    onClick={() => handleCustomItemInputChange('quantity', customItem.quantity + 1)}
                                    className="px-3 py-2 bg-gray-200 rounded-r"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-4">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">
                                £{(parseFloat(customItem.price || 0) * customItem.quantity).toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowCustomItemPopup(false);
                                    setShowKeyboard(false);
                                }}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={addCustomItem}
                                className="px-4 py-2 bg-[#D97706] text-white rounded hover:bg-[#B36200]"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discount Popup */}
            {showDiscountPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
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

            {/* Virtual Keyboard */}
            {showKeyboard && (
                <div className="fixed z-50 flex items-start" style={{ left: 'calc(50% + 220px)', top: '50%', transform: 'translateY(-50%)' }}>
                    <div className={`animate__animated animate__fadeInRight bg-white p-4 rounded-lg shadow-xl ${isAlphabeticKeyboard ? 'w-[500px]' : 'w-full max-w-sm'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-medium text-gray-700">
                                {currentInputRef.current?.placeholder || 'Enter Value'}
                            </span>
                            <button
                                onClick={handleKeyboardHide}
                                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                            >
                                ×
                            </button>
                        </div>
                        <Keyboard
                            keyboardRef={r => (keyboard.current = r)}
                            onChange={handleKeyboardChange}
                            onKeyPress={handleKeyPress}
                            layout={{
                                default: isAlphabeticKeyboard ? [
                                    "q w e r t y u i o p",
                                    "a s d f g h j k l",
                                    "z x c v b n m",
                                    "{space} {bksp}",
                                    "{enter}"
                                ] : [
                                    "1 2 3",
                                    "4 5 6",
                                    "7 8 9",
                                    "0 . {bksp}",
                                    "{enter}"
                                ]
                            }}
                            display={{
                                "{bksp}": "⌫",
                                "{enter}": "Done",
                                "{space}": "Space"
                            }}
                            theme="hg-theme-default"
                            buttonTheme={[
                                {
                                    class: "hg-button-enter",
                                    buttons: "{enter}"
                                }
                            ]}
                            buttonAttributes={[
                                {
                                    attribute: "style",
                                    value: isAlphabeticKeyboard 
                                        ? "min-height: 55px; font-size: 18px; margin: 3px; min-width: 40px;" 
                                        : "min-height: 60px; font-size: 20px; margin: 4px; min-width: 50px;",
                                    buttons: isAlphabeticKeyboard 
                                        ? "q w e r t y u i o p a s d f g h j k l z x c v b n m {space} {bksp} {enter}"
                                        : "1 2 3 4 5 6 7 8 9 0 . {bksp} {enter}"
                                }
                            ]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;