import React from 'react';

const CardDetails = ({ CardDetails, order_no, order_id, orderData }) => {
    console.log(CardDetails)
    const hasCardDetails = Array.isArray(CardDetails) && CardDetails.length > 0;

    const firstDetail = hasCardDetails ? CardDetails[0] : null;
    const date = firstDetail?.transactionDate || firstDetail?.date
    const time = firstDetail?.transactionTime || firstDetail?.time

     // Get screen name from localStorage
    const getScreenName = () => {
        try {
            const storedScreens = JSON.parse(localStorage.getItem("Screens_Data") || []);
            if (orderData?.screen_id) {
                const screen = storedScreens.find(s => s.id === orderData.screen_id);
                return screen?.screen_name || "Unknown Screen";
            }
            return "Unknown Screen";
        } catch (error) {
            console.error("Error getting screen name:", error);
            return "Unknown Screen";
        }
    };

    const screenName = getScreenName();

    return (
        <>
            <div className={"rounded-md border border-gray-600 overflow-hidden mx-1 masonry-item pb-[20px] relative"}>
                <div className={"flex flex-col p-4 bg-slate-800 text-white"}>
                    <div className="flex w-full">
                        <div className="w-3/4 text-xl font-semibold">
                            Order No
                        </div>
                        <div className={"w-1/4 text-end text-xl font-semibold text-white"}>
                            {order_no}
                        </div>
                    </div>
                    <div className="flex w-full">
                        <div className="w-3/4 text-lg font-semibold">
                            Order ID
                        </div>
                        <div className={"w-1/4 text-end text-lg font-semibold text-white"}>
                            {order_id}
                        </div>
                    </div>

                    <div className="flex w-full">
                        <div className="w-3/4 text-lg font-semibold">
                            Order from Screen
                        </div>
                        <div className={"w-1/4 text-end text-lg font-semibold text-white"}>
                            {screenName}
                        </div>
                    </div>
                    <div className='flex justify-between mt-1'>
                        {date}
                        <span>{time}</span>
                    </div>
                </div>
                <div className='px-3 py-4'>
                    {hasCardDetails && (
                        CardDetails?.map((x, index) => (
                            <div key={index}>
                                <div className="text-center font-bold text-xl py-1 capitalize text-red-500">
                                    {x?.transaction_type}
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        Merchant's Name
                                    </div>
                                    <div className='font-normal'>
                                        {x?.merchant_name}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        Address Line 1
                                    </div>
                                    <div className='font-normal'>
                                        {x?.address_line1 || x?.address_line_1}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1 mb-2">
                                    <div className="">
                                        Address Line 2
                                    </div>
                                    <div className='font-normal'>
                                        {x?.address_line2 || x?.address_line_2}
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-between font-semibold py-1 mt-2">
                                    <div className="">
                                        Receipt No
                                    </div>
                                    <div className='font-normal'>
                                        {x?.receiptNo || x?.receipt_no}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        Card No (last 4 Digit)
                                    </div>
                                    <div className='font-normal'>
                                        {x?.cardLast4 || x?.card_last4}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        Authentication Code
                                    </div>
                                    <div className='font-normal'>
                                        {x?.authCode || x?.auth_code}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        Transaction Type
                                    </div>
                                    <div className='font-normal'>
                                        {x?.transaction_type}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1 mb-2">
                                    <div className="">
                                        Card Type
                                    </div>
                                    <div className='font-normal'>
                                        {x?.paymentMethod || x?.payment_method}
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-between font-semibold py-1 mt-2">
                                    <div className="">
                                        Terminal ID
                                    </div>
                                    <div className='font-normal'>
                                        {x?.TID}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        MID
                                    </div>
                                    <div className='font-normal'>
                                        {x?.MID}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        AID
                                    </div>
                                    <div className='font-normal'>
                                        {x?.AID}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1 mb-2">
                                    <div className="">
                                        ARQC
                                    </div>
                                    <div className='font-normal'>
                                        {x?.ARQC}
                                    </div>
                                </div>
                                <hr />
                                <div className="flex justify-between font-semibold py-1 mt-2">
                                    <div className="">
                                        Amount
                                    </div>
                                    <div className='font-normal'>
                                        {x?.amount}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        Currency
                                    </div>
                                    <div className='font-normal'>
                                        {x?.currency}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1">
                                    <div className="">
                                        Exchange Rate
                                    </div>
                                    <div className='font-normal'>
                                        {x?.exchangeRate}
                                    </div>
                                </div>
                                <div className="flex justify-between font-semibold py-1 mb-2">
                                    <div className="">
                                        Total Payment
                                    </div>
                                    <div className="font-normal">
                                    {x?.totalTransactionAmount && x?.totalTransactionAmount !== '0.00'
                                        ? `${x?.totalTransactionAmount} ${x?.totalCurrency}` 
                                        : `${x?.amount} ${x?.currency}`}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}

export default CardDetails;