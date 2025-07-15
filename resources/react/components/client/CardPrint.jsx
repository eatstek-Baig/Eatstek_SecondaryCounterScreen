import React from 'react';
import "../../app.css";

const CardPrint = ({ CardDetails, copyType, branchDetails, isCounter, isReconciliation, isReversal, isRefund }) => {
    return (
        <>
            <div className="p-1 font-mono text-xs text-black leading-none print:w-full">
                {isCounter &&
                    <h2 className="text-center font-black text-md mb-2 uppercase">
                        {branchDetails?.branch_name}
                    </h2>
                }
                {/* <hr /> */}
                <div className="mt-0 mb-1">
                    <div className="flex justify-between font-normal my-0" style={{ fontSize: '10px' }}>
                        <span className="font-normal">
                            {CardDetails?.merchant_name}
                        </span>
                    </div>
                    <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                        <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Address Line 1 :</span>
                        <span className="font-normal">
                            {CardDetails?.address_line1 || CardDetails?.address_line_1}
                        </span>
                    </div>
                    <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                        <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Address Line 2 :</span>
                        <span className="font-normal">
                            {CardDetails?.address_line2 || CardDetails?.address_line_2}
                        </span>
                    </div>
                    {/* <div className="flex justify-between font-semibold py-1" style={{ fontSize: '10px' }}>
                        <span>TID :</span>
                        <span className="font-normal">
                            {CardDetails?.TID}
                        </span>
                    </div> */}
                    {CardDetails?.TID && (
                    <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                        <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>TID :</span>
                        <span className="font-normal">
                        {CardDetails.TID}
                        </span>
                    </div>
                    )}
                    {CardDetails?.from_receipt_no && (
                    <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                        <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>From Receipt No. :</span>
                        <span className="font-normal">
                        {CardDetails.from_receipt_no}
                        </span>
                    </div>
                    )}

                    {CardDetails?.to_receipt_no && (
                    <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                        <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>To Receipt No. :</span>
                        <span className="font-normal">
                        {CardDetails.to_receipt_no}
                        </span>
                    </div>
                    )}
                   
                    <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                        <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>MID :</span>
                        <span className="font-normal">
                            {CardDetails?.MID}
                        </span>
                    </div>
                    {!isReconciliation &&
                        <>

                            <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                                <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Receipt No :</span>
                                <span className="font-normal">
                                    {CardDetails?.receiptNo || CardDetails?.receipt_no}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                                <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Card No (last 4 Digit) :</span>
                                <span className="font-normal">
                                    {CardDetails?.cardLast4 || CardDetails?.card_last4}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                                <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>AID :</span>
                                <span className="font-normal">
                                    {CardDetails?.AID}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                                <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Card Type :</span>
                                <span className="font-normal">
                                    {CardDetails?.paymentMethod || CardDetails?.payment_method}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                                <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Amount :</span>
                                <span className="font-normal">
                                    {CardDetails?.amount}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                                <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Currency :</span>
                                <span className="font-normal">
                                    {CardDetails?.currency}
                                </span>
                            </div>
                            {/* <div className="flex justify-between font-semibold py-1 mb-2" style={{ fontSize: '10px' }}>
                                <span>Exchange Rate :</span>
                                <span className="font-normal">
                                    {CardDetails?.exchangeRate}
                                </span>
                            </div> */}
                            {CardDetails?.exchangeRate && (
                            <div className="flex justify-between font-semibold py-0 mb-1" style={{ fontSize: '10px' }}>
                                <span className={copyType === "CUSTOMER RECEIPT" ? "" : "font-normal"}>Exchange Rate :</span>
                                <span className="font-normal">{CardDetails.exchangeRate}</span>
                            </div>
                            )}

                            {/* <hr /> */}
                            {(CardDetails?.totalTransactionAmount || CardDetails?.totalTransactionAmount === 0) && (
                                <div className="flex justify-between font-semibold py-1">
                                    <span> Total Payment</span>
                                    <span className="font-semibold">
                                        {CardDetails?.totalTransactionAmount && CardDetails.totalTransactionAmount !== '0.00'
                                            ? `${CardDetails.totalTransactionAmount} ${CardDetails.totalCurrency}`
                                            : `${CardDetails.amount} ${CardDetails.currency}`}
                                    </span>
                                </div>
                            )}
                            {/* <div className="flex justify-between font-semibold py-3">
                                <span> Total Payment</span>
                                <span className="font-semibold">
                                    {CardDetails?.totalTransactionAmount} {CardDetails?.totalCurrency}
                                </span>
                            </div> */}
                        </>
                    }
                    {/* <hr /> */}
                </div>

                {!isReconciliation &&
                    <>
                        <h2 style={{ textAlign: 'center', marginBottom: '1px', fontSize: '10px' }}>
                            SIGNATURE NOT REQUIRED
                        </h2>
                        <h2 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '8px', fontWeight: 'normal' }}>
                            {isRefund ? "Please Credit My Account" : isReversal ? "Transaction Voided" : "Please Debit My Account"}
                        </h2>
                        <div className="flex justify-center font-semibold py-0 mb-1" style={{ fontSize: '10px' }}>
                          {/* //  <span>Transaction Type : {isRefund ? "Refund" : isReversal ? "Sale" : CardDetails?.transaction_type}</span> */}
                          <span>Transaction Type : {isRefund ? "Refund" : isReversal ? "Sale" : "Sale"}</span>
                        </div>
                        <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                            <span className={copyType === "CUSTOMER RECEIPT" ? "font-normal" : ""}>Authentication Code :</span>
                            <span className="font-normal">
                                {CardDetails?.authCode || CardDetails?.auth_code}
                            </span>
                        </div>
                        <div className="flex justify-between font-semibold py-0" style={{ fontSize: '10px' }}>
                            <span className={copyType === "CUSTOMER RECEIPT" ? "font-normal" : ""}>ARQC :</span>
                            <span className="font-normal">
                                {CardDetails?.ARQC}
                            </span>
                        </div>
                    </>
                }
                <div className="flex justify-between mt-0" style={{ fontSize: '10px' }}>
                    <span>{CardDetails?.transactionDate || CardDetails?.date}</span>
                    <span className="font-normal">
                        {CardDetails?.transactionTime || CardDetails?.time}
                    </span>
                </div>
                <div className="text-black text-center  mt-0 mb-0" >
                    <h2 className="text-center font-normal" style={{ fontSize: '8px' }}>
                        ---- {copyType} ----
                    </h2>
                </div>
            </div>
        </>
    )
}

export default CardPrint;







