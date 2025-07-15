import React from 'react';
import "../../app.css";

const ReconciliationPrint = ({ CardDetails, date, branchDetails }) => {
    return (
        <>
            <div className="p-1 font-mono text-xs text-black leading-none print:w-full">
                {/* <h2 className="text-center font-semibold text-md mt-2 mb-2">
                    EATSTEK HALL GREEN
                </h2> */}
                {branchDetails?.branch_name &&

                    <h1 className="text-center font-black text-md leading-none mb-2 uppercase" style={{ fontWeight: "900" }}>

                        {branchDetails.branch_name}

                    </h1>

                }
                <div className="gap-0 flex flex-col justify-center leading-none">
                    {branchDetails?.branch_address && (
                        <span className="text-center font-normal" style={{ fontSize: '9px' }}>
                            {branchDetails.branch_address}
                        </span>
                    )}
                    {branchDetails?.branch_address2 && (
                        <span className="text-center font-normal" style={{ fontSize: "9px" }}>
                            {branchDetails.branch_address2}
                        </span>
                    )}
                    {branchDetails?.phone_no && (
                        <span className="text-center font-normal" style={{ fontSize: "9px" }}>
                            {branchDetails.phone_no}
                        </span>
                    )}

                    {branchDetails?.email && (
                        <span className="text-center font-normal" style={{ fontSize: "9px" }}>
                            {branchDetails.email}
                        </span>
                    )}

                    {branchDetails?.website && (
                        <span className="text-center font-normal" style={{ fontSize: "9px" }}>
                            {branchDetails.website}
                        </span>
                    )}

                </div>
                <div className="flex flex-col gap-0.3 py-1">
                    <h2 className="font-normal text-center">
                        Created
                        <span className=""> : {date}</span>
                        <span className=""> - Counter Screen</span>
                    </h2>
                    <h2 className="font-semibold text-center capitalize">
                        Transaction Summary
                    </h2>
                </div>
                <table className="text-xs w-full border-none mt-1">
                    <thead>
                        <tr className="border-b border-black border-b-1">
                            <th className="p-1 text-left">Type</th>
                            <th className="p-1 text-left">Count</th>
                            <th className="p-1 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CardDetails?.map((item, index) => (
                            <tr key={index}>
                                <td className="px-1" style={{ verticalAlign: "top" }}>
                                    {item?.type}
                                </td>
                                <td className="px-1" style={{ verticalAlign: "top" }}>
                                    {item?.quantity}
                                </td>
                                <td className="px-1" style={{ verticalAlign: "top" }}>
                                    {item?.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <span className="font-bold mt-2 mb-1 text-center flex justify-center">
                End of Transaction Summary – Reconciliation Complete.
                </span>
            </div>
        </>
    )
}

export default ReconciliationPrint;