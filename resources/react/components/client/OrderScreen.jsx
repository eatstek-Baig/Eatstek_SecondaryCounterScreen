import React, { useEffect, useState } from "react";
import { productApi } from "../../lib/services";
import { getCookie } from 'cookies-next';

export default function OrdersScreen() {
    const [preparing, setPreparing] = useState([]);
    const [completed, setCompleted] = useState([]);

    //calling the fetch order functions to fetch the latest orders from kitchen screen
    useEffect(() => {
        const interval = setInterval(() => {
            console.log('Fetching orders...');
            fetchOrders();
        }, 1000); // Poll every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []); 

      //logic for fetching data from kitchen screen 
    const fetchOrders = async () => {
        try {   
            const response = await productApi.getOrdersList();
            const { preparing, completed } = response?.data;
            console.log('Fetched orders: ', response?.data); // Debugging log
            setPreparing(preparing || []);
            setCompleted(completed || []);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <main>
            <div className="flex flex-col lg:flex-row w-full h-screen">
                <div
                    className="flex w-full lg:w-2/3 h-4/6 lg:h-full"
                    id="orders_data"
                >
                    {/* Preparing Column */}
                    <div className="w-1/2 flex flex-col">
                        {/* Title */}
                        <div className="w-full bg-sky-800 text-white text-center py-5 text-lg md:text-3xl lg:text-2xl uppercase font-semibold">
                            Preparing....
                        </div>
                        <div className="flex-grow p-5 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                                {preparing.length > 0 ? (
                                    preparing.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`text-3xl md:text-5xl mb-2 font-semibold ${
                                                index % 2 === 0 ? "" : "lg:mx-8"
                                            }`}
                                            style={{
                                                fontFamily: "Karla, sans-serif",
                                            }}
                                        >
                                            {item.order}
                                        </div>
                                    ))
                                ) : (
                                    // Ensure background remains, even with no orders
                                    <div className="text-transparent">
                                        {/* This empty div keeps the structure intact */}
                                        No orders
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Completed Orders Column */}
                    <div className="w-1/2 flex flex-col bg-yellow-300">
                        {/* Title */}
                        <div className="w-full bg-green-700 text-white text-center py-5 text-lg md:text-3xl lg:text-2xl uppercase font-semibold">
                            Please Collect....
                        </div>
                        <div className="flex-grow p-5 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 text-center lg:text-left">
                                {completed.length > 0 ? (
                                    completed.map((item, index) => (
                                        <div
                                            key={index}
                                            className={`text-3xl md:text-5xl mb-2 font-semibold ${
                                                index % 2 === 0
                                                    ? "lg:ml-6"
                                                    : "lg:mx-10"
                                            }`}
                                            style={{
                                                fontFamily: "Karla, sans-serif",
                                            }}
                                        >
                                            {item.order}
                                        </div>
                                    ))
                                ) : (
                                    // Ensure background remains, even with no orders
                                    <div className="text-transparent">
                                        {/* This empty div keeps the structure intact */}
                                        No orders
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-1/3 flex overflow-hidden justify-center items-center flex-grow lg:flex-grow-0">
                    <img
                    src=""
                        // src={eatsTekLogo}
                        alt="advertisement"
                        className="h-fit w-80"
                    />
                </div>
            </div>
        </main>
    );
}
