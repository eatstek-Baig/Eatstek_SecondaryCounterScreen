import React, { useState, useEffect, useRef } from "react";
import { useCart } from "react-use-cart";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { productApi } from "../../lib/services";
import { Spinner } from "flowbite-react";
import { IoFastFood } from "react-icons/io5";
import { GiFoodTruck } from "react-icons/gi";
import { BsCashStack } from "react-icons/bs";
import { FaMoneyBillWave } from "react-icons/fa";
import { FaCreditCard } from "react-icons/fa6";
import { IoMdPrint } from "react-icons/io";
import CustomPopoup from "../common/CustomPopoup";
import PrintBill from "./PrintBill";
import { ToastContainer } from 'react-toastify';
import { showToast } from "../../lib/utils/helpers";
import { getCookie } from "cookies-next";
import { useNavigate } from "react-router-dom";
import { handleSilentPrint } from "../../lib/utils/PrintUtils";
import CardPrint from "./CardPrint";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { FaKeyboard } from "react-icons/fa";





const SplitPaymentModal = ({ total, onConfirm, onClose, printEnabled, setPrintEnabled }) => {
  const [cardAmount, setCardAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState(Math.floor(total * 10) / 10);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const keyboard = useRef();
  const currentInputRef = useRef(null);
  const cashInputRef = useRef();

  const handleConfirm = () => {
    onConfirm(cardAmount, cashAmount);
  };

  const handleInputFocus = (inputRef) => {
    currentInputRef.current = inputRef;
    setShowKeyboard(true);
  };

  const handleKeyboardChange = (input) => {
    if (currentInputRef.current) {
      const numericValue = parseFloat(input) || 0;
      const flooredValue = Math.floor(Math.max(0, Math.min(total, numericValue)) * 10) / 10;
      setCashAmount(parseFloat(flooredValue.toFixed(2)));
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

  const incrementCash = () => {
    const newValue = Math.min(total, parseFloat((cashAmount + 0.1).toFixed(2)));
    setCashAmount(newValue);
    setShowKeyboard(true); // Open keyboard when using buttons
  };

  const decrementCash = () => {
    const newValue = Math.max(0, parseFloat((cashAmount - 0.1).toFixed(2)));
    setCashAmount(newValue);
    setShowKeyboard(true); // Open keyboard when using buttons
  };

  useEffect(() => {
    setCardAmount(parseFloat((total - cashAmount).toFixed(2)));
  }, [cashAmount, total]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-center">Split Payment</h2>

        <div className="mb-6">
          <label className="block mb-3 text-lg font-medium">Cash Amount (£)</label>
          <div className="flex items-center">
            <button
              onClick={decrementCash}
              className="bg-gray-200 text-3xl px-6 py-4 rounded-l-lg active:bg-gray-300"
            >
              -
            </button>
            <div className="relative flex-1">
              <input
                type="number"
                ref={cashInputRef}
                inputMode="decimal"
                min="0"
                max={total}
                step="0.1"
                value={cashAmount.toFixed(2)}
                onChange={(e) => {
                  const numericValue = parseFloat(e.target.value) || 0;
                  const flooredValue = Math.floor(Math.max(0, Math.min(total, numericValue)) * 10) / 10;
                  setCashAmount(parseFloat(flooredValue.toFixed(2)));
                }}
                onFocus={() => handleInputFocus(cashInputRef.current)}
                className="w-full p-2 border-t border-b border-gray-300 text-center text-lg"
              />
            </div>
            <button
              onClick={incrementCash}
              className="bg-gray-200 text-3xl px-6 py-4 rounded-r-lg active:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-3 text-lg font-medium">Card Amount (£)</label>
          <input
            type="text"
            disabled
            value={cardAmount.toFixed(2)}
            className="w-full p-2 border rounded bg-gray-100 text-lg"
          />
        </div>

        <div className="mb-6 flex items-center">
          <input
            type="checkbox"
            checked={printEnabled}
            onChange={(e) => setPrintEnabled(e.target.checked)}
            className="mr-3 w-6 h-6"
          />
          <label className="text-lg">Print receipt</label>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-4 bg-gray-300 rounded-lg text-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-4 bg-[#D97706] text-white rounded-lg text-lg"
            disabled={cardAmount < 0 || cashAmount <= 0 || (cardAmount === 0 && cashAmount === 0)}
          >
            Confirm
          </button>
        </div>
      </div>

      {/* Keyboard positioned to the right */}
      {showKeyboard && (
        <div className="fixed z-50 flex items-start" style={{ left: 'calc(50% + 220px)', top: '50%', transform: 'translateY(-50%)' }}>
          <div className="animate__animated animate__fadeInRight bg-white p-4 rounded-lg shadow-xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-medium text-gray-700">
                Enter Cash Amount
              </span>
              <button
                onClick={handleKeyboardHide}
                className="text-gray-500 hover:text-gray-700 text-2xl"
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
    </div>
  );
};


const CashPaymentModal = ({ total, onProceed, onClose }) => {
  const [tenderAmount, setTenderAmount] = useState(0);
  const [change, setChange] = useState(0);
  const keyboard = useRef();
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (tenderAmount > 0) {
      const calculatedChange = parseFloat(tenderAmount) - parseFloat(total);
      setChange(calculatedChange > 0 ? calculatedChange : 0);
    } else {
      setChange(0);
    }
  }, [tenderAmount, total]);

  const handleKeyboardChange = (input) => {
    const numericValue = parseFloat(input) || 0;
    setTenderAmount(numericValue);
  };

  const handleKeyPress = (button) => {
    if (button === "{enter}") {
      setShowKeyboard(false);
    }
  };

  const handleInputFocus = () => {
    setShowKeyboard(true);
  };

  const handleProceed = () => {
    // If no tender amount entered, use the total as tender amount
    const finalTenderAmount = tenderAmount > 0 ? tenderAmount : total;
    const calculatedChange = finalTenderAmount - total;
    onProceed(finalTenderAmount, calculatedChange > 0 ? calculatedChange : 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-center">Cash Payment</h2>

        <div className="mb-4">
          <label className="block mb-2 text-lg font-medium">Total Bill (£)</label>
          <input
            type="text"
            value={total.toFixed(2)}
            disabled
            className="w-full p-3 border rounded bg-gray-100 text-lg"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 text-lg font-medium">Tender Amount (£)</label>
          <input
            type="number"
            ref={inputRef}
            value={tenderAmount.toFixed(2)}
            onChange={(e) => setTenderAmount(parseFloat(e.target.value) || 0)}
            onFocus={handleInputFocus}
            className="w-full p-3 border rounded text-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-lg font-medium">Change (£)</label>
          <input
            type="text"
            value={change.toFixed(2)}
            disabled
            className="w-full p-3 border rounded bg-gray-100 text-lg"
          />
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-300 rounded-lg text-lg"
          >
            Back
          </button>
          <button
            onClick={handleProceed}
            className="flex-1 px-6 py-3 bg-[#D97706] text-white rounded-lg text-lg"
          >
            Proceed
          </button>
        </div>
      </div>

      {showKeyboard && (
        <div className="fixed z-50 flex items-start" style={{ left: 'calc(50% + 220px)', top: '50%', transform: 'translateY(-50%)' }}>
          <div className="animate__animated animate__fadeInRight bg-white p-4 rounded-lg shadow-xl w-full max-w-md"> {/* Increased from max-w-sm to max-w-md */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-medium text-gray-700">
                Enter Amount
              </span>
              <button
                onClick={() => setShowKeyboard(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
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
              // Add these CSS class overrides for button sizing
              physicalKeyboardHighlight={true}
              // Custom CSS for wider buttons
              buttonAttributes={[
                {
                  attribute: "style",
                  value: "min-width: 60px; height: 50px; font-size: 18px; margin: 2px;",
                  buttons: "1 2 3 4 5 6 7 8 9 0 ."
                },
                {
                  attribute: "style",
                  value: "min-width: 60px; height: 50px; font-size: 16px; margin: 2px;",
                  buttons: "{bksp}"
                },
                {
                  attribute: "style",
                  value: "min-width: 130px; height: 50px; font-size: 16px; margin: 2px;",
                  buttons: "{enter}"
                }
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const Checkout = () => {
  const { toggleCheckoutFunction } = useSGlobalContext();
  const {
    isEmpty,
    totalUniqueItems,
    items,
    updateItemQuantity,
    removeItem,
    cartTotal,
    emptyCart,
  } = useCart();
  
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [loadings, setLoadings] = useState(false);
  const [mac_address, setMac_address] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOption, setSelectedOption] = useState("Eat In");
  const [activeButtons, setActiveButtons] = useState({
    cash: true,
    print: false,
    card: false,
    split: false
  });
  const [openPopup, setOpenPopup] = useState(false);
  const [printStatus, setPrintStatus] = useState(false);
  const [totalData, setTotalData] = useState(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [day, setDay] = useState("");
  const [date, setDate] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [isPrintReady, setIsPrintReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState({ card: 0, cash: 0 });

  const [showCashModal, setShowCashModal] = useState(false);

  // const [debugMode, setDebugMode] = useState(true); // Add this line

  const userName = import.meta.env.VITE_APP_KINETIC_API_USERNAME;
  const userPassword = import.meta.env.VITE_APP_KINETIC_API_PASSWORD;
  const printContainerRef = useRef(null);
  const checkoutRef = useRef(null);

  const [discount, setDiscount] = useState(null);

  useEffect(() => {
    const savedDiscount = localStorage.getItem('cartDiscount');
    setDiscount(savedDiscount ? JSON.parse(savedDiscount) : {
      discountedTotal: cartTotal,
      originalTotal: cartTotal,
      type: 'none',
      value: 0
    });
  }, [cartTotal]);

  const [hasCardMachine, setHasCardMachine] = useState(false);

  // Add this useEffect to check for card machines
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("Screens_Data")) || [];
    const hasValidMachine = storedData.some(device => device.machine_ip && device.machine_ip.trim() !== "");
    setHasCardMachine(hasValidMachine);
  }, []);

  const [branchDetails, setBranchDetails] = useState(null);

  const getBranchDetails = async () => {
    try {
      const response = await productApi.getBranchDetails();
      if (response?.data?.length > 0) {
        setBranchDetails(response.data[0]);
        console.log("branch details are: ", response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching branch details:", error);
    }
  };

  useEffect(() => {
    getBranchDetails();
  }, []);

  useEffect(() => {
    if (checkoutRef.current) {
      checkoutRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);


  const [cancelRequest, setCancelRequest] = useState(null);


  const handleCheckConnection = async (amount = null) => {

    console.log('[handleCheckConnection] Function started', { amount, mac_address, activeButtons, splitAmounts, discount, cartTotal });
    let toastShown = false;
    let loadingTimeout;
    let controller = new AbortController();

    const tryConnect = async () => {
      try {
        console.log('[tryConnect] Attempting connection...');

        if (window.machineElectronAPI) {
          console.log('[tryConnect] Removing existing machine-connection-response listeners');
          window.machineElectronAPI.removeAllListeners("machine-connection-response");
        }

        if (!window.machineElectronAPI) {
          console.error('[tryConnect] Machine API not available');
          throw new Error("Machine API is not Available.");
        }

        console.log('[tryConnect] Setting loading state');
        setIsLoading(true);
        loadingTimeout = setTimeout(() => {
          console.warn('[tryConnect] Loading timeout reached (5 minutes)');
          setIsLoading(false);
        }, 300000);

        console.log('[tryConnect] Retrieving stored device data');
        const storedData = JSON.parse(localStorage.getItem("Screens_Data")) || [];
        console.log('[tryConnect] Stored devices:', storedData);

        const matchedDevice = storedData?.find(device => device.mac_address == mac_address);
        const ip = matchedDevice?.machine_ip || "";
        console.log('[tryConnect] Matched device:', { matchedDevice, ip });

        const paymentAmount = activeButtons.split ?
          splitAmounts.card :
          (discount ? discount.discountedTotal : cartTotal);
        console.log('[tryConnect] Payment amount calculated:', {
          activeSplit: activeButtons.split,
          splitAmount: splitAmounts.card,
          discountApplied: !!discount,
          discountAmount: discount?.discountedTotal,
          cartTotal,
          finalAmount: paymentAmount
        });

        console.log('[tryConnect] Sending connection request to machine API');
        window.machineElectronAPI.sendCheckMachineConnection({
          amount: Math.round(paymentAmount * 100),
          mac_address: mac_address || "",
          ip: ip
        });

        window.machineElectronAPI.onMachineConnectionResponse(async (data) => {
          console.log('[onMachineConnectionResponse] Received response:', data);
          clearTimeout(loadingTimeout);
          setIsLoading(false);

          if (data.status === "success") {
            console.log('[onMachineConnectionResponse] Transaction successful');
            showToast(data.message || "Transaction Accepted", "success");

            const printoutArray = data.printout[0] || [];
            const printoutData = printoutArray[0] || {};
            console.log('[onMachineConnectionResponse] Printout data:', printoutData);

            const TransactionDetails = {
              merchant_name: printoutData.merchant_name || "",
              address_line1: printoutData.address_line1 || "",
              address_line2: printoutData.address_line2 || "",
              TID: printoutData.TID || "",
              receiptNo: printoutData.receipt_no || "",
              MID: printoutData.MID || "",
              cardLast4: printoutData.card_last4 || "",
              AID: printoutData.AID || "",
              paymentMethod: printoutData.payment_method || "Card",
              amount: printoutData.amount || (activeButtons.split ? splitAmounts.card : (discount ? discount.discountedTotal : cartTotal)),
              currency: printoutData.currency || "USD",
              exchangeRate: printoutData.exchange_rate || "",
              totalTransactionAmount: (Math.round((printoutData.total_transaction_amount ||
                (activeButtons.split ? splitAmounts.card : (discount ? discount.discountedTotal : cartTotal))) * 100) / 100).toFixed(2),
              totalCurrency: printoutData.total_currency || "USD",
              authCode: printoutData.auth_code || "",
              transactionDate: printoutData.transaction_date || new Date().toISOString(),
              transactionTime: printoutData.transaction_time || "",
              note: printoutData.note || "",
              transaction_type: printoutData.transaction_type
            };
            console.log('[onMachineConnectionResponse] Transaction details:', TransactionDetails);

            console.log('[onMachineConnectionResponse] Proceeding to confirm checkout');
            if (activeButtons.split) {
              console.log('[onMachineConnectionResponse] Split payment flow');
              await confirmCheckout(
                selectedOption,
                "split",
                activeButtons.print,
                TransactionDetails
              );
            } else {
              console.log('[onMachineConnectionResponse] Regular card payment flow');
              await confirmCheckout(
                selectedOption,
                "card",
                activeButtons.print,
                TransactionDetails
              );
            }

            showToast("Order has been Placed successfully", "success");
          } else {
            console.error('[onMachineConnectionResponse] Transaction failed:', data.error);
            showToast(`Transaction Failed: ${data.error}`, "error");
          }
        });
      } catch (error) {
        console.error('[tryConnect] Error occurred:', error);
        clearTimeout(loadingTimeout);
        setIsLoading(false);

        if (error.name === 'AbortError') {
          console.log('[tryConnect] Transaction cancelled by user');
          showToast("Transaction Cancelled by User.", "info");
        } else if (!toastShown) {
          console.error('[tryConnect] Machine connection error');
          showToast("Machine is not connected. Please choose Another Method.", "error");
          toastShown = true;
        }
      }
    };

    const cancelRequestFn = () => {
      console.log('[cancelRequestFn] Cancelling request');
      controller.abort();
      clearTimeout(loadingTimeout);
      setIsLoading(false);
      showToast("Request Cancelled By User.", "info");
    };

    console.log('[handleCheckConnection] Starting connection attempt');
    await tryConnect();
    return cancelRequestFn;
  }




  useEffect(() => {
    getMacAddress();
    const updateDay = () => {
      const now = new Date();
      const dayName = now.toLocaleString("en-us", { weekday: "long" });
      const formattedDate = `${now.getMonth() + 1
        }/${now.getDate()}/${now.getFullYear()}`;
      const formattedTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

      setDateTime(formattedTime);
      setDate(formattedDate);
      setDay(dayName);
    };
    updateDay();
  }, []);

  useEffect(() => {
    if (printStatus && isPrintReady) {
      const printTimeout = setTimeout(() => {
        handleSilentPrint(printContainerRef);
        setPrintStatus(false);
        setIsPrintReady(false);
      }, 0);

      return () => clearTimeout(printTimeout);
    }
  }, [printStatus, isPrintReady]);

  const getMacAddress = async () => {
    try {
      const mac_address = await window.macElectronAPI.getMacAddress();
      console.log('MAC Address:', mac_address);
      setMac_address(mac_address);
    } catch (error) {
      console.error('Error fetching MAC address:', error);
    }
  };

  const handleCheckout = () => {
    setShowConfirmation(true);
    setOpenPopup(true);

    if (activeButtons.split) {
      setShowSplitModal(true);
      setShowConfirmation(false);
    }
  };


  const confirmCheckout = async (order_type, pay_method, print_status, TransactionDetails, directSplitDetails = null) => {
    console.group('[confirmCheckout] Starting checkout confirmation');
    console.log('Parameters:', { order_type, pay_method, print_status, TransactionDetails });
    setLoadings(true);

    // Categorize items
    console.log('[confirmCheckout] Categorizing items');
    let singleItemss = [];
    let mealItems = [];
    let dealItems = [];

    items.forEach((item) => {
      if (item.side && item.drink) {
        mealItems.push(item);
      } else if (item.deal) {
        dealItems.push(item);
      } else {
        singleItemss.push(item);
      }
    });
    console.log('[confirmCheckout] Categorized items:', { singleItemss, mealItems, dealItems });

    // Calculate final total
    const finalTotal = discount?.discountedTotal ?? cartTotal;
    console.log('[confirmCheckout] Calculated totals:', {
      originalTotal: cartTotal,
      discountApplied: !!discount,
      discountDetails: discount,
      finalTotal
    });

    // Prepare the order data
    const itemsbox = {
      cart: {
        single: singleItemss,
        meal: mealItems,
        deal: dealItems,
      },
      macAddress: mac_address,
      totalBill: finalTotal,
      originalTotal: cartTotal,
      discountApplied: discount ? {
        type: discount.type,
        value: discount.value
      } : null,
      payMethod: pay_method,
      payStatus: "paid",
      tprice: finalTotal,
      sprice: finalTotal,
      orderType: order_type,
      employee_id: localStorage.getItem("EmployeId"),
      card_Details: TransactionDetails || {},
      sale_transactions: TransactionDetails || null,
      ...(pay_method === 'split' && {
        splitDetails: directSplitDetails || { // <-- Use direct values if available
          cardAmount: splitAmounts.card,
          cashAmount: splitAmounts.cash,
          totalAmount: finalTotal
        }
      })
    };
    console.log('[confirmCheckout] Prepared order data:', itemsbox);

    try {
      console.log('[confirmCheckout] Submitting order to API');
      const response = await productApi.finalizeOrder(itemsbox);
      console.log('[confirmCheckout] API response:', response);

      if (response.data) {
        console.log('[confirmCheckout] Order successful, order number:', response.data.order_no);
        setOrderNumber(response.data.order_no);
        setTotalData(itemsbox);

        if (print_status) {
          console.log('[confirmCheckout] Preparing to print receipt');
          setPrintStatus(true);
          toggleCheckoutFunction(true);
          setTimeout(() => {
            console.log('[confirmCheckout] Setting print ready');
            setIsPrintReady(true);
          }, 100);
        }

        showToast("Order placed successfully", "success");
        setShowSuccessMessage(true);

        console.log('[confirmCheckout] Scheduling cart cleanup');
        setTimeout(() => {
          console.log('[confirmCheckout] Clearing cart and resetting state');
          emptyCart();
          localStorage.removeItem('cartDiscount');
          toggleCheckoutFunction(false);
          setShowSuccessMessage(false);
        }, 3000);
      }
    } catch (error) {
      console.error('[confirmCheckout] Order submission failed:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status
      });
      showToast(error.response?.data?.message || "Error placing order", "error");
    } finally {
      console.log('[confirmCheckout] Finalizing loading state');
      setLoadings(false);
      console.groupEnd();
    }
  };

  const handleSplitPayment = async (cardAmount, cashAmount) => {
    console.log("handleSplitPayment called with:", { cardAmount, cashAmount });
    setShowSplitModal(false);
    setSplitAmounts({ card: cardAmount, cash: cashAmount });




    if (cardAmount > 0) {
      // Process card portion first
      setPaymethod("card");
    } else {
      // If no card amount, process as cash-only split
      await confirmCheckout(
        selectedOption,
        "split",
        activeButtons.print,
        null, // No transaction details for cash
        { cardAmount, cashAmount }
      );
    }

  };


  const [paymethod, setPaymethod] = useState("");

  const handleOkClick = async () => {
    setShowConfirmation(false);
    setOpenPopup(false);

    if (activeButtons.split) {
      // Split payment will be handled separately
      return;
    }

    if (activeButtons.cash) {
      setShowCashModal(true);
      return;
    }

    const selectedMethod = activeButtons.cash
      ? "cash"
      : activeButtons.card
        ? "card"
        : "cash";

    setPaymethod("");

    setTimeout(() => {
      setPaymethod(selectedMethod);
    }, 100);

    if (selectedMethod === "cash") {
      await confirmCheckout(selectedOption, selectedMethod, activeButtons.print);
    }
  };


  useEffect(() => {
    if (paymethod === "card") {
      const initiateConnection = async () => {
        const amountToProcess = activeButtons.split ?
          splitAmounts.card :
          (discount ? discount.discountedTotal : cartTotal);

        const cancelFn = await handleCheckConnection(amountToProcess);
        setCancelRequest(() => cancelFn);
      };
      initiateConnection();
    }
  }, [paymethod, splitAmounts]);

  if (isEmpty) {
    return (
      <p className="text-center mt-10 text-xl font-semibold">
        Your cart is empty
      </p>
    );
  }

  const dataList = [
    {
      title: "Eat In",
      icon: <IoFastFood className="text-[40px] mx-auto" />,
      handleClick: () => setSelectedOption("Eat In"),
    },
    {
      title: "Take Away",
      icon: <GiFoodTruck className="text-[40px] mx-auto" />,
      handleClick: () => setSelectedOption("Take Away"),
    },
    {
      title: "Cash",
      icon: <BsCashStack className="text-[40px] mx-auto" />,
      handleClick: () =>
        setActiveButtons((prev) => ({
          ...prev,
          cash: !prev.cash,
          card: false,
          split: false,
        })), // Toggle cash
    },
    {
      title: "Card",
      icon: <FaCreditCard className="text-[40px] mx-auto" />,
      handleClick: hasCardMachine ? () =>
        setActiveButtons((prev) => ({
          ...prev,
          card: !prev.card,
          cash: false,
          split: false,
          print: true,
        })) : () => { }, // Empty function if no card machine
      disabled: !hasCardMachine // Add this property
    },
    {
      title: "Split",
      icon: <FaMoneyBillWave className="text-[40px] mx-auto" />,
      handleClick: hasCardMachine ? () => {
        setActiveButtons(prev => ({
          ...prev,
          split: !prev.split,
          cash: false,
          card: false,
          print: true,
        }));
        setShowSplitModal(true);
        setShowConfirmation(false);
      } : () => { }, // Empty function if no card machine
      disabled: !hasCardMachine // Add this property
    },
    {
      title: "Print",
      icon: <IoMdPrint className="text-[40px] mx-auto" />,
      handleClick: () =>
        setActiveButtons((prev) => ({ ...prev, print: !prev.print })),
    },
  ];



  return (
    <>
      {isLoading ? (
        <div className="screen_loader fixed inset-0 bg-[#fafafa] bg-white z-[60] flex flex-col items-center justify-center animate__animated">
          <svg width="64" height="64" viewBox="0 0 135 135" xmlns="http://www.w3.org/2000/svg" fill="#4361ee">
            <path d="M67.447 58c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10zm9.448 9.447c0 5.523 4.477 10 10 10 5.522 0 10-4.477 10-10s-4.478-10-10-10c-5.523 0-10 4.477-10 10zm-9.448 9.448c-5.523 0-10 4.477-10 10 0 5.522 4.477 10 10 10s10-4.478 10-10c0-5.523-4.477-10-10-10zM58 67.447c0-5.523-4.477-10-10-10s-10 4.477-10 10 4.477 10 10 10 10-4.477 10-10z">
              <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="-360 67 67" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M28.19 40.31c6.627 0 12-5.374 12-12 0-6.628-5.373-12-12-12-6.628 0-12 5.372-12 12 0 6.626 5.372 12 12 12zm30.72-19.825c4.686 4.687 12.284 4.687 16.97 0 4.686-4.686 4.686-12.284 0-16.97-4.686-4.687-12.284-4.687-16.97 0-4.687 4.686-4.687 12.284 0 16.97zm35.74 7.705c0 6.627 5.37 12 12 12 6.626 0 12-5.373 12-12 0-6.628-5.374-12-12-12-6.63 0-12 5.372-12 12zm19.822 30.72c-4.686 4.686-4.686 12.284 0 16.97 4.687 4.686 12.285 4.686 16.97 0 4.687-4.686 4.687-12.284 0-16.97-4.685-4.687-12.283-4.687-16.97 0zm-7.704 35.74c-6.627 0-12 5.37-12 12 0 6.626 5.373 12 12 12s12-5.374 12-12c0-6.63-5.373-12-12-12zm-30.72 19.822c-4.686-4.686-12.284-4.686-16.97 0-4.686 4.687-4.686 12.285 0 16.97 4.686 4.687 12.284 4.687 16.97 0 4.687-4.685 4.687-12.283 0-16.97zm-35.74-7.704c0-6.627-5.372-12-12-12-6.626 0-12 5.373-12 12s5.374 12 12 12c6.628 0 12-5.373 12-12zm-19.823-30.72c4.687-4.686 4.687-12.284 0-16.97-4.686-4.686-12.284-4.686-16.97 0-4.687 4.686-4.687 12.284 0 16.97 4.686 4.687 12.284 4.687 16.97 0z">
              <animateTransform attributeName="transform" type="rotate" from="0 67 67" to="360 67 67" dur="8s" repeatCount="indefinite" />
            </path>
          </svg>
          <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-white">
            Waitng for Payment Machine Response ...
          </p>
          {/* <div className="flex items-center px-4 py-3 rounded-full h-12 bg-[#d97706] text-gray-100 shadow-md mt-5">
            <div className="flex-grow">
              <button
                type="submit"
                className="text-md font-semibold"
                onClick={cancelRequest}
              >
                Cancel Request
              </button>
            </div>
          </div> */}
        </div>
      ) : (
        <>
          <ToastContainer />
          <div className={"container mx-auto pt-0 p-4"} ref={checkoutRef}>
            <div className="flex flex-col lg:flex-col">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-400">
                  Your Cart ({totalUniqueItems} items)
                </h2>
                <ul>
                  {items?.map((item) => (
                    <li key={item.id} className="mb-6 border-b pb-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-lg">
                            {item.name}{" "}
                            {item?.meal && (
                              <span className="text-[#d97766] text-sm font-bold">
                                {" "}
                                (Meal)
                              </span>
                            )}{" "}
                            {item?.deal && (
                              <span className="text-[#d97766] text-sm font-bold">
                                {" "}
                                (Deal)
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-600">
                            Price : £
                            {typeof item.price === "number"
                              ? item.price.toFixed(2)
                              : parseFloat(item.price || 0).toFixed(2)}
                          </p>
                          {item.size && (
                            <p className="text-gray-600">Size : {item.size}</p>
                          )}
                          {item.addonss && item.addonss.length > 0 && (
                            <p className="text-gray-600">
                              Addons: {item.addonss.join(", ")}
                            </p>
                          )}
                          {/* {item.choiceOption && (
                        <p className="text-gray-600">
                          {item.choice}: {item.choiceOption}
                        </p>
                      )} */}
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
                                      <p className="text-gray-600">
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
                          {/* {item.choiceCategory &&
                        item.choiceCategory.length > 0 && (
                          <p className="text-gray-600">
                            Options : {item.choiceCategory.join(", ")}
                          </p>
                        )} */}
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
                                      <div key={selectedProduct.pid} className="mt-1 text-gray-600">
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
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity - 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded-l"
                            >
                              -
                            </button>
                            <span className="px-3 py-1 bg-gray-100">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity + 1)
                              }
                              className="px-2 py-1 bg-gray-200 rounded-r"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 mt-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Order Summary Section */}
              <div style={{
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 200px)', // Adjust this value as needed
                scrollbarWidth: 'thin', // For Firefox
                scrollbarColor: '#D97706 #f5f5f5' // For Firefox (thumb color, track color)
              }}>
                {/* Webkit browsers (Chrome, Safari) scrollbar styling */}
                <style dangerouslySetInnerHTML={{
                  __html: `
      div::-webkit-scrollbar {
        width: 8px;
      }
      div::-webkit-scrollbar-track {
        background: #f5f5f5;
      }
      div::-webkit-scrollbar-thumb {
        background-color: #D97706;
        border-radius: 4px;
      }
    `
                }} />

                <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
                  <h2 className="text-xl font-semibold mb-3">Order Summary</h2>
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Subtotal : </span>
                    <span className="font-semibold">£{cartTotal.toFixed(2)}</span>
                  </div>
                  {/* Discount display if applicable */}
                  {discount && (
                    <div className="flex justify-between mb-2 text-red-500">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-semibold">
                        -£{(discount.originalTotal - discount.discountedTotal).toFixed(2)}
                        {discount.type === 'percentage' && ` (${discount.value}%)`}
                        {discount.type === 'amount' && ` (Fixed)`}
                        {discount.type === 'newPrice' && ` (New Price)`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-xl mb-4 border-t pt-3">
                    <span>Total:</span>
                    <span>£{(discount ? discount.discountedTotal : cartTotal).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={loadings}
                    className={`w-full bg-[#D97706] text-white py-2 rounded-md hover:bg-[#B45309] transition ${loadings ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    {loadings ? (
                      <>
                        <Spinner aria-label="Spinner button example" size="sm" />
                        <span className="pl-3">Loading...</span>
                      </>
                    ) : (
                      "Complete Checkout"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Success Popup Modal */}
            {showSuccessMessage && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-all transition-300 z-50">
                <div className="bg-white p-6 rounded shadow-lg text-center min-w-[450px]">
                  <div className="table mx-auto">
                    <img
                      className="rounded-t-lg"
                       src={`https://${import.meta.env.VITE_API_BASE_URL}/check_img.gif`}
                      

                      alt="Order Complete"
                    />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Order Complete!</h2>
                  <p>Your order has been successfully placed.</p>
                </div>
              </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
              <CustomPopoup
                open={openPopup}
                title="Select Options"
                size="4xl"
                dismissible={false}
                onClose={() => setOpenPopup(false)}
                items={
                  <div className="flex flex-col items-center justify-center z-50 gap-3 p-4">
                    <div className="flex flex-wrap justify-center gap-3">
                      {dataList.map((item, index) => {
                        const isActive =
                          (item.title === "Eat In" && selectedOption === "Eat In") ||
                          (item.title === "Take Away" &&
                            selectedOption === "Take Away") ||
                          (item.title === "Cash" && activeButtons.cash) ||
                          (item.title === "Card" && activeButtons.card) ||
                          (item.title === "Print" && activeButtons.print) ||
                          (item.title === "Split" && activeButtons.split);

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-center max-w-sm p-2 h-[150px] w-[150px] border border-gray-300 rounded-lg group shadow text-center cursor-pointer transition-all duration-300 ease-in-out
    ${isActive ? "bg-[#d97706]" : "bg-white"}
    ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
  `}
                            onClick={item.disabled ? undefined : item.handleClick}
                          >
                            <div className="flex items-center justify-center flex-col">
                              <div
                                className={`text-[40px] mx-auto transition-all duration-300 ease-in-out ${isActive ? "text-white" : "text-[#d97706]"
                                  }`}
                              >
                                {item.icon}
                              </div>
                              <h2
                                className={`text-lg mt-1 transition-all duration-300 ease-in-out ${isActive ? "text-white" : "text-black"
                                  }`}
                              >
                                {item.title}
                              </h2>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* OK Button */}
                    <button
                      onClick={handleOkClick}
                      className="mt-6 bg-[#d97706] text-white px-6 py-3 rounded-lg text-xl font-bold shadow hover:bg-[#b56255] transition-all duration-300 ease-in-out"
                    >
                      OK
                    </button>
                  </div>
                }
              />
            )}
          </div>

          {showSplitModal && (
            <SplitPaymentModal
              total={discount ? discount.discountedTotal : cartTotal}
              onConfirm={handleSplitPayment}
              onClose={() => {
                setShowSplitModal(false);
                setShowConfirmation(true); // Reopen options modal
              }}
              printEnabled={activeButtons.print}
              setPrintEnabled={(value) => setActiveButtons(prev => ({ ...prev, print: value }))}
            />
          )}

          {showCashModal && (
            <CashPaymentModal
              total={discount ? discount.discountedTotal : cartTotal}
              onProceed={async (tenderAmount, change) => {
                setShowCashModal(false);
                await confirmCheckout(
                  selectedOption,
                  "cash",
                  activeButtons.print,
                  null,
                  {
                    tenderAmount,
                    change
                  }
                );
              }}
              onClose={() => {
                setShowCashModal(false);
                setShowConfirmation(true); // Reopen options modal
              }}
            />
          )}

          {printStatus && (
            <div className="print-only" ref={printContainerRef}>
              {branchDetails && (
                <PrintBill
                  cart={totalData.cart}
                  totalBill={totalData.totalBill}
                  originalTotal={totalData.originalTotal} // Pass original total
                  discountApplied={totalData.discountApplied} // Pass discount info
                  orderNumber={orderNumber}
                  day={day}
                  date={date}
                  dateTime={dateTime}
                  totalData={totalData}
                  branchDetails={branchDetails}
                />
              )}
              {(paymethod === 'card' || (totalData.payMethod === 'split' && totalData.splitDetails?.cardAmount > 0)) && branchDetails && (
                <>
                  <CardPrint
                    CardDetails={totalData?.card_Details}
                    copyType="CUSTOMER RECEIPT"
                    branchDetails={branchDetails}
                  />
                  {/* <div className="page-break"></div>
                  <CardPrint
                    CardDetails={totalData?.card_Details}
                    copyType="MERCHANT'S RECEIPT"
                    branchDetails={branchDetails}
                    isCounter={"isCounter"}
                  /> */}
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Checkout;