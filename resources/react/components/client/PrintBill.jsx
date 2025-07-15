import React, { useState, useEffect } from "react";
import "../../app.css";

const PrintBill = ({ cart, totalBill, originalTotal, discountApplied, orderNumber, day, date, dateTime, orderData, totalData, branchDetails }) => {
  const { single = [], meal = [], deal = [] } = cart || {};
console.log(discountApplied)

  return (
    <div className="p-1 font-mono text-xs text-black leading-none print:w-full">
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

      {/* <hr /> */}
      <div className="flex flex-col gap-0.3 py-1">
        <h2 className="font-normal text-center">
          Created
          <span className=""> - {dateTime}</span>
          <span className=""> - Counter Screen</span>
        </h2>
        <h1 className="font-semibold text-center capitalize mt-1">
          {orderData?.payment_method
            ? (orderData?.payment_method === "cash" ? "Payment: Cash" : "Payment: Card")
            : totalData?.payMethod
              ? (totalData?.payMethod === "cash" ? "Payment: Cash" : "Payment: Card")
              : "N/A"
          }
        </h1>
        <h1 className="font-semibold text-center mt-1.5" style={{ fontSize: '14px' }}>
          Order No : {orderNumber}
        </h1>
        <h1 className="font-normal text-center" style={{ fontSize: '12px' }}>
          Payment Status : {""}
          {orderData?.payment_status
            ? (orderData?.payment_status === "paid" ? "Paid" : "Pending")
            : totalData?.payStatus
              ? (totalData?.payStatus === "paid" ? "Paid" : "Pending")
              : "N/A"
          }
        </h1>
      </div>

      <table className="text-xs w-full border-none mt-1">
        <thead>
          <tr className="border-b border-black border-b-1">
            <th className="p-1 text-left">Qty</th>
            <th className="p-1 text-left">Name</th>
            <th className="p-1 text-left">Price</th>
            <th className="p-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {/* Render Single Items */}
          {single.map((item) => (
            <tr key={item.id}>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                {item.quantity}
              </td>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                <div className="gap-1 font-semibold">
                  - {item?.product_name}
                  <span className="font-semibold"> ({item?.size})</span>
                </div>
                {item?.choices?.length > 0 &&
                  item.choices.map((choice) => {
                    // Grouping choice options by choice_name
                    const groupedChoices = Array.isArray(choice?.choice_options)
                      ? choice.choice_options.reduce((acc, option) => {
                        const name = option?.choice_name;
                        if (!acc[name]) {
                          acc[name] = [];
                        }
                        acc[name].push(option.option_name);
                        return acc;
                      }, {})
                      : {};
                    return (
                      <div key={choice.choice_id} className="leading-none" style={{ fontSize: "8px" }}>
                        {Object.entries(groupedChoices)?.map(([choiceName, options]) => (
                          <div key={choiceName} className="flex flex-col">
                            <p>
                              ● {choiceName} -{" "}
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
              </td>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                £{(typeof item.itemTotal === 'number' && !isNaN(item.itemTotal) ? (item.itemTotal / item.quantity).toFixed(2) : 0)}
              </td>
              <td className="px-1 text-right" style={{ verticalAlign: "top" }}>
                £{(typeof item.itemTotal === 'number' && !isNaN(item.itemTotal) ? item.itemTotal.toFixed(2) : 0)}
              </td>
            </tr>
          ))}

          {/* Render Meal Items */}
          {meal.map((item) => (
            <tr key={item.id}>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                - {item.product_name} ({item.size})<br />- {item.choiceOption}
              </td>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                {(typeof item.itemTotal === 'number' && !isNaN(item.itemTotal) ? (item.itemTotal / item.quantity).toFixed(2) : 0)}
              </td>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                {item.quantity}
              </td>
              <td className="px-1 text-right" style={{ verticalAlign: "top" }}>
                £{(typeof item.itemTotal === 'number' && !isNaN(item.itemTotal) ? item.itemTotal.toFixed(2) : 0)}
              </td>
            </tr>
          ))}

          {/* Render Deal Items */}
          {deal.map((item) => (
            <tr key={item.id}>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                {item.quantity}
              </td>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                <div className="font-semibold"  >
                  - {item?.name}
                </div>
                <div className="flex flex-col">
                  {item.selectedProducts &&
                    item.selectedProducts.map((product) => (
                      <div key={product.category_id}>
                        {product?.selected_products &&
                          product?.selected_products?.map((selectedProduct) => {
                            const groupedChoices = Array.isArray(selectedProduct.choices)
                              ? selectedProduct.choices.reduce((acc, choice) => {
                                const choiceName = choice.choice_name;
                                if (!acc[choiceName]) {
                                  acc[choiceName] = [];
                                }
                                acc[choiceName].push(choice.name);
                                return acc;
                              }, {})
                              : {};
                            return (
                              //here h3 tag was used before
                              <div key={selectedProduct.pid} className="leading-none" style={{ fontSize: "8px" }}>
                                <p className="">● {selectedProduct.product_name} -
                                  <span className="">
                                    {"  "} ({product.category_name})
                                  </span>
                                </p>
                                {Object.entries(groupedChoices)?.map(([choiceName, options]) => (
                                  <div key={choiceName} className="">
                                    <p className="">
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
                </div>
              </td>
              <td className="px-1" style={{ verticalAlign: "top" }}>
                £{(typeof item.itemTotal === 'number' && !isNaN(item.itemTotal) ? (item.itemTotal / item.quantity).toFixed(2) : 0)}
              </td>
              <td className="px-1 text-right" style={{ verticalAlign: "top" }}>
                £{(typeof item.itemTotal === 'number' && !isNaN(item.itemTotal) ? item.itemTotal.toFixed(2) : 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add the discount breakdown here */}
      {discountApplied && (
        <div className="mt-1 text-sm mb-1">
          <div className="flex justify-between" style={{ fontSize: '12px' }}>
            <span>Subtotal:</span>
            <span>£{typeof originalTotal === 'number' ? originalTotal.toFixed(2) : '0.00'}</span>
          </div>
          <div className="flex justify-between" style={{ fontSize: '12px' }}>
            <span>
              Discount:
              {discountApplied.type === 'percentage' && ` (${discountApplied.value}%)`}
              {discountApplied.type === 'amount' && ` (Fixed)`}
              {discountApplied.type === 'newPrice' && ` (New Price)`}
            </span>
            <span>-£{(originalTotal - totalBill).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="mt-1 text-sm mb-1">
        <div className="flex justify-between font-semibold" style={{ fontSize: '12px' }}>
          <span > Total Payment</span>
          <span className="font-semibold">
            £ {typeof totalBill === 'number' && !isNaN(totalBill) ? totalBill.toFixed(2) : '0.00'}
          </span>
        </div>

        {/* Show split payment details if payMethod is 'split' */}
        {totalData?.payMethod === 'split' && totalData?.splitDetails && (
          <div className="mt-1">
            <div className="flex justify-between" style={{ fontSize: '12px' }}>
              <span>Paid by Card:</span>
              <span>£{totalData.splitDetails.cardAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between" style={{ fontSize: '12px' }}>
              <span>Paid by Cash:</span>
              <span>£{totalData.splitDetails.cashAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        )}
        
      </div>
      {/* <hr /> */}

      <div className="flex flex-col gap-2 justify-center py-1">
        <span className="text-center font-normal">
          Placed On : {day} , {date}
        </span>
      </div>
      {/* <hr /> */}



      <span className="font-bold mt-2 mb-1 text-center flex justify-center">
        Thank You For your Order !
      </span>
    </div>
  );
};

export default PrintBill;





















