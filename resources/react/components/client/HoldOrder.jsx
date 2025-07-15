import React, { useState, useEffect } from "react";
import { useCart } from "react-use-cart";
import CustomTable from "../common/CustomTable";

const HoldOrders = () => {
    const { isEmpty, emptyCart, items, addItem } = useCart();
    const [holdOrders, setHoldOrders] = useState([]);

    // Table headers configuration
    const headers = [
        { name: 'Order #', slug: "id" },
        { name: 'Item Count', slug: "itemCount" },
        { name: 'Item Names', slug: "itemNames" },
        { name: 'Total', slug: "total" },
        { name: 'Held At', slug: "createdAt" },
        { name: 'Actions', slug: "actions" }
    ];

      // Load held orders from localStorage and set up listeners
      useEffect(() => {
        const handleStorageUpdate = () => {
            const storedOrders = JSON.parse(localStorage.getItem('holdOrders')) || [];
            setHoldOrders(storedOrders);
        };

        // Initial load
        handleStorageUpdate();

        // Listen for custom event (from same tab)
    window.addEventListener('holdOrdersUpdated', handleStorageUpdate);
        
        // Listen for storage events (from other tabs)
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener('holdOrdersUpdated', handleStorageUpdate);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    const retrieveOrder = (order) => {
        if (!isEmpty) {
            alert("Please empty your current cart before retrieving a held order");
            return;
        }

        // Add each item from the held order to the cart
        order.items.forEach(item => {
            addItem(item, item.quantity);
        });

        // Remove the order from localStorage
        const updatedOrders = holdOrders.filter(o => o.id !== order.id);
        localStorage.setItem('holdOrders', JSON.stringify(updatedOrders));
        setHoldOrders(updatedOrders);
    };

    const deleteOrder = (orderId) => {
        const updatedOrders = holdOrders.filter(order => order.id !== orderId);
        localStorage.setItem('holdOrders', JSON.stringify(updatedOrders));
        setHoldOrders(updatedOrders);
    };

    // Format data for the table
    const formatTableData = () => {
        return holdOrders.map(order => ({
            ...order,
            id: `#${order.id.toString().slice(-4)}`, // Show last 4 digits as order number
            itemCount: order.items.length, // Number of items
            itemNames: (
                <div className="flex flex-col">
                    {order.items.map((item, index) => (
                        <div key={index}>
                            {item.quantity > 1 && `${item.quantity}x `}
                            {item.name || item.product_name}
                            {item.deal && " (Deal)"}
                            {item.meal && " (Meal)"}
                        </div>
                    ))}
                </div>
            ),
            total: `£${order.total.toFixed(2)}`,
            createdAt: new Date(order.createdAt).toLocaleString(),
            actions: (
                <div className="flex space-x-2">
                    <button
                        onClick={() => retrieveOrder(order)}
                        className="px-3 py-1 bg-[#D97706] text-white rounded text-sm"
                    >
                        Retrieve
                    </button>
                    <button
                        onClick={() => deleteOrder(order.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                        Delete
                    </button>
                </div>
            )
        }));
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Held Orders</h2>
            
            {holdOrders.length === 0 ? (
                <p className="text-gray-500">No orders are currently on hold</p>
            ) : (
                <CustomTable
                    headers={headers}
                    data={formatTableData()}
                    emptyMessage="No held orders found"
                />
            )}
        </div>
    );
};

export default HoldOrders;