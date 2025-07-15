const { contextBridge, ipcRenderer } = require("electron");




// Existing APIs
contextBridge.exposeInMainWorld("electronAPI", {
  sendWebSocketMessage: (message) => ipcRenderer.send("send-websocket-message", message), // Send to main process
  onWebSocketMessage: (callback) => ipcRenderer.on('websocket-message', (_, data) => callback(data)),
  showAlert: () => alert("Hello from Electron!"),
});



contextBridge.exposeInMainWorld("windowElectron", {
  send: (channel, data) => {
    const validChannels = ["window-control"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
});

// Get Mac Address
try {
  contextBridge.exposeInMainWorld('macElectronAPI', {
    getMacAddress: async () => await ipcRenderer.invoke('get-mac-address'),
  });
  console.log('mac address script loaded successfully!');
} catch (error) {
  console.error('Failed to load mac address script:', error);
}

try {
  contextBridge.exposeInMainWorld("machineElectronAPI", {
    sendCheckMachineConnection: (data) =>
      ipcRenderer.send("check-machine-connection", data),
    onMachineConnectionResponse: (callback) => {
      ipcRenderer.removeAllListeners("machine-connection-response");
      ipcRenderer.on("machine-connection-response", (event, responseData) => callback(responseData));
    },
    removeAllListeners: () => ipcRenderer.removeAllListeners("machine-connection-response"),
  });

  console.log("machine script loaded successfully!");
} catch (error) {
  console.error("Failed to load machine script:", error);
}

contextBridge.exposeInMainWorld("machineStatusElectronApi", {
  getMachineStatus: () => ipcRenderer.invoke("get-machine-status"),
});

contextBridge.exposeInMainWorld("cancelTransactionElectronApi", {
  cancelTransaction: () => ipcRenderer.invoke("cancel-transaction"),
});

// New API for Silent Print Functionality
// Expose the print API to the renderer process
contextBridge.exposeInMainWorld("printElectronAPI", {
  // Function to send content for printing
  printContent: (content) => {
    ipcRenderer.invoke("print-content", content);
  },

  // Listener for print completion
  onPrintComplete: (callback) => {
    ipcRenderer.on("print-complete", (event, success) => {
      callback(success);
    });
  },
});

// New API for Refund and Reversal
contextBridge.exposeInMainWorld("transactionElectronAPI", {
  processRefund: (amount, ipAddress) => {
    return ipcRenderer.invoke("process-refund", { amount, ipAddress });
  },
  processReversal: (transactionId, amount, ipAddress) => {
    return ipcRenderer.invoke("process-reversal", { transactionId, amount, ipAddress });
  },
  processReconciliation: (ipAddress) => {
    return ipcRenderer.invoke("process-reconciliation", { ipAddress });
  },
  onTransactionResponse: (callback) => {
    ipcRenderer.removeAllListeners("transaction-response");
    ipcRenderer.on("transaction-response", (event, data) => {
      callback(data);
    });
  },
});

