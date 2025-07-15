import { createContext, useEffect, useRef, useState } from "react";
import { productApi } from "../services";
import { showToast } from "../utils/helpers";
import { handleSilentPrint } from "../utils/PrintUtils";
import ReconciliationPrint from "../../components/client/ReconciliationPrint";
import CardPrint from "../../components/client/CardPrint";

export const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
    const [webSocketData, setWebSocketData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [responseReconciliation, setResponseReconciliation] = useState(null);
    const [dataReconciliation, setDataReconciliation] = useState(false);
    const [branchDetails, setBranchDetails] = useState(null);
    const printContainerRef = useRef(null);

    // Fetch branch details
    const getBranchDetails = async () => {
        try {
            const response = await productApi.getBranchDetails();
            if (response?.data?.length > 0) {
                setBranchDetails(response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching branch details:", error);
        }
    };

    useEffect(() => {
        getBranchDetails();
    }, []);

    const triggerReconciliationPrint = () => {
        setDataReconciliation(true);
    };

    useEffect(() => {
        if (dataReconciliation) {
            const printTimeout = setTimeout(() => {
                handleSilentPrint(printContainerRef);
                setDataReconciliation(false);
            }, 500);

            return () => clearTimeout(printTimeout);
        }
    }, [dataReconciliation]);

    useEffect(() => {
        let isMounted = true;
        let reconciliationInProgress = false;
        let refundInProgress = false;
        let reversalInProgress = false;

        const handleWebSocketMessage = async (message) => {
            console.log("Received WebSocket message:", message);
            setWebSocketData(message);

            // Skip ping messages
            if (message?.type === "ping") return;

            // Get current device info
            const storedData = JSON.parse(localStorage.getItem("Screens_Data") || "[]");
            const currentMacAddress = await window.macElectronAPI.getMacAddress();
            const currentDevice = storedData.find(device => device.mac_address === currentMacAddress);

            if (!currentDevice || !currentDevice.machine_ip) {
                throw new Error("Could not determine device information");
            }

            // Handle Reconciliation
            if (message.type === "message-from-counter" && message.content.includes("Perform Reconciliation")) {
                try {
                    if (message.TargetScreenDeviceIp !== currentDevice.machine_ip) return;
                    if (reconciliationInProgress) return;

                    reconciliationInProgress = true;
                    setIsLoading(true);
                    showToast("Performing Reconciliation...", "info");

                    const response = await window.transactionElectronAPI.processReconciliation(currentDevice.machine_ip);

                    if (response.status === "success") {
                        showToast("Reconciliation completed successfully", "success");
                        setResponseReconciliation(response);

                        // Store reconciliation data
                        try {
                            const reconciliationData = {
                                screen_name: currentDevice.screen_name,
                                machine_ip: currentDevice.machine_ip,
                                merchant_name: response.batch_summary?.merchant_name || "",
                                address_line1: response.batch_summary?.address_line1 || "",
                                address_line2: response.batch_summary?.address_line2 || "",
                                tid: response.batch_summary?.TID || "",
                                from_receipt_no: response.batch_summary?.from_receipt_no || "",
                                to_receipt_no: response.batch_summary?.to_receipt_no || "",
                                mid: response.batch_summary?.MID || "",
                                transaction_summary: JSON.stringify(response.batch_summary?.transactions || [])
                            };
                            await productApi.addReconciliationData(reconciliationData);
                        } catch (apiError) {
                            console.error("Failed to store reconciliation data:", apiError);
                        }

                        triggerReconciliationPrint();

                        const responseMessage = {
                            type: "message-from-customer",
                            content: "Reconciliation completed",
                            status: response.status,
                            data: response.data,
                            screenName: currentDevice.screen_name,
                            ip: currentDevice.machine_ip,
                            uniqueid:message.id,
                        };

                        await window.electronAPI.sendWebSocketMessage(responseMessage);
                    } else {
                        showToast(`Reconciliation failed: ${response.message}`, "error");
                        await window.electronAPI.sendWebSocketMessage({
                            type: "message-from-customer",
                            content: "Reconciliation failed",
                            error: response.message,
                            uniqueid: message.id,
                        });
                    }
                } catch (error) {
                    console.error("Error during reconciliation:", error);
                    showToast(`Error: ${error.message}`, "error");
                    await window.electronAPI.sendWebSocketMessage({
                        type: "message-from-customer",
                        content: "Reconciliation failed",
                        error: error.message,
                        uniqueid: message.id,
                    });
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                        reconciliationInProgress = false;
                    }
                }
            }

            // Handle Refund
            else if (message.type === "refund-request-from-counter") {
                try {
                    if (message.TargetscreenMacAdress !== currentMacAddress) return;
                    if (refundInProgress) return;

                    refundInProgress = true;
                    setIsLoading(true);
                    showToast("Processing Refund...", "info");
                    

                    const response = await window.transactionElectronAPI.processRefund(
                        message.amount,
                        message.ipAddress
                    );

                    console.log("refund response ",response)

                    if (response.status === "success") {
                        showToast("Refund processed successfully", "success");

                        const responseMessage = {
                            type: "refund-response-from-customer",
                            content: "Refund completed",
                            status: "success",
                            rresponse: response,
                            screenName: currentDevice.screen_name,
                            ip: currentDevice.machine_ip,
                            printout: response.printout,
                            orderId: message.orderId,
                            orderNo: message.orderNo,
                            uniqueid: message.id,
                        };

                        await window.electronAPI.sendWebSocketMessage(responseMessage);
                    } else {
                        showToast(`Refund failed: ${response.message}`, "error");
                        await window.electronAPI.sendWebSocketMessage({
                            type: "refund-response-from-customer",
                            content: "Refund failed",
                            status: "error",
                            error: response.message,
                            screenName: currentDevice.screen_name,
                            orderId: message.orderId,
                            orderNo: message.orderNo,
                            uniqueid: message.id,
                        });
                    }
                } catch (error) {
                    console.error("Error during refund processing:", error);
                    showToast(`Error: ${error.message}`, "error");
                    await window.electronAPI.sendWebSocketMessage({
                        type: "refund-response-from-customer",
                        content: "Refund failed",
                        status: "error",
                        error: error.message,
                        screenName: currentDevice.screen_name,
                        orderId: message.orderId,
                        orderNo: message.orderNo,
                        uniqueid: message.id,
                    });
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                        refundInProgress = false;
                    }
                }
            }


            // Handle Reversal
            else if (message.type === "reversal-request-from-counter") {
                try {
                    if (message.TargetscreenMacAdress !== currentMacAddress) return;
                    if (reversalInProgress) return;

                    reversalInProgress = true;
                    setIsLoading(true);
                    showToast("Processing Reversal...", "info");
                    

                    const response = await window.transactionElectronAPI.processReversal(
                        message.TransactionId,
                        String(message.amount),
                        message.ipAddress
                    );

                    console.log("reversal response ",response)

                    if (response.status === "success") {
                        showToast("Reversal processed successfully", "success");

                        const responseMessage = {
                            type: "reversal-response-from-customer",
                            content: "Reversal completed",
                            status: "success",
                            rresponse: response,
                            screenName: currentDevice.screen_name,
                            ip: currentDevice.machine_ip,
                            printout: response.printout,
                            orderId: message.orderId,
                            orderNo: message.orderNo,
                            uniqueid: message.id,
                        };

                        await window.electronAPI.sendWebSocketMessage(responseMessage);
                    } else {
                        showToast(`Reversal failed: ${response.message}`, "error");
                        await window.electronAPI.sendWebSocketMessage({
                            type: "reversal-response-from-customer",
                            content: "Reversal failed",
                            status: "error",
                            error: response.message,
                            screenName: currentDevice.screen_name,
                            orderId: message.orderId,
                            orderNo: message.orderNo,
                            uniqueid: message.id,
                        });
                    }
                } catch (error) {
                    console.error("Error during reversal processing:", error);
                    showToast(`Error: ${error.message}`, "error");
                    await window.electronAPI.sendWebSocketMessage({
                        type: "reversal-response-from-customer",
                        content: "Reversal failed",
                        status: "error",
                        error: error.message,
                        screenName: currentDevice.screen_name,
                        orderId: message.orderId,
                        orderNo: message.orderNo,
                        uniqueid: message.id,
                    });
                } finally {
                    if (isMounted) {
                        setIsLoading(false);
                        reversalInProgress = false;
                    }
                }
            }
        };

        if (window?.electronAPI?.onWebSocketMessage) {
            window.electronAPI.onWebSocketMessage(handleWebSocketMessage);
        }

        return () => {
            isMounted = false;
            if (window?.electronAPI?.removeWebSocketListener) {
                window.electronAPI.removeWebSocketListener(handleWebSocketMessage);
            }
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ isLoading }}>
            {children}

            {/* Reconciliation Print Components */}
            {dataReconciliation && (
                <div className="print-only" ref={printContainerRef}>
                    {branchDetails && (
                        <ReconciliationPrint
                            CardDetails={responseReconciliation?.batch_summary?.transactions}
                            date={responseReconciliation?.batch_summary?.date}
                            branchDetails={branchDetails}
                        />
                    )}
                    <CardPrint
                        CardDetails={responseReconciliation?.batch_summary}
                        isCounter={"isCounter"}
                        copyType="Please Keep This PrintOut"
                        isReconciliation={true}
                    />
                </div>
            )}
        </WebSocketContext.Provider>
    );
};