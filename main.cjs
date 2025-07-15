const { app, BrowserWindow, dialog, ipcMain, globalShortcut, screen } = require('electron');
const path = require("path");
const fetch = require("node-fetch");
const http = require("http");
const fs = require("fs");
const os = require('os');
const WebSocket = require('ws');

//implementation for preveting multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();

if(!gotTheLock){
  app.quit();
  process.exit(0);
}

let mainWindow;
let ipAddress = null;
let heartbeatInterval;
let reconnectInterval = 5000;
const { exec } = require('child_process');
let serverProcess;

let isSecondaryCounterScreen = true;

//adding second instance handler
 app.on('second-instance', (event, commandLine, workingDirectory) => {
    if(mainWindow){
      if(mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
    }
  });

function createWebSocket() {
  const screenType = isSecondaryCounterScreen ? "SecondaryCounter" : "Counter";

  // ws = new WebSocket('ws://test.eatstekltd.co.uk:8081');
  ws = new WebSocket(`ws://test.eatstekltd.co.uk:8081?ScreenType=${screenType}`);



  ws.on('open', () => {
    console.log('WebSocket Connection Established');
    startHeartbeat();
  });

  ws.on('message', (data) => {
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.type === "keep-alive") {
        console.log(`[KEEP-ALIVE] Received from server at ${new Date(parsedData.timestamp * 1000)}`);
        return;
      }

      if (mainWindow) {
        mainWindow.webContents.send('websocket-message', parsedData);
      } else {
        console.error('Main window not defined.');
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error.message);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed. Attempting to reconnect...');
    clearInterval(heartbeatInterval);
    setTimeout(createWebSocket, reconnectInterval);
  });
}

// Function to send heartbeat every 30 seconds
function startHeartbeat() {
  clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "ping" }));
    }
  }, 30000);
}

createWebSocket();

// Function to stop the server
function stopServer() {
  if (serverProcess) {
    serverProcess.kill('SIGINT'); // Gracefully stop the server process
    console.log('Server stopped.');
  }
}


app.on("ready", async () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;


  try {
    mainWindow = new BrowserWindow({
      // width: 1024,
      // height: 768,
      // width: width, // Set the window width to the screen width
      // height: height, // Set the window height to the screen height
      frame: false,
      fullscreen: true, // Enable full screen
      autoHideMenuBar: true, // Hide the menu bar

      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    // mainWindow.webContents.openDevTools();

    mainWindow.webContents.on(
      "did-fail-load",
      (event, errorCode, errorDescription) => {
        dialog.showErrorBox(
          "Load Failed",
          `Failed to load page: ${errorDescription} (Error Code: ${errorCode})`
        );
      }
    );

    if (process.env.NODE_ENV === "development") {
      mainWindow.loadURL("http://localhost:5173");
    } else {
      mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
    }

    killProcessOnPort(3000, startServer);
    mainWindow.setFullScreen(true);

    // Register global keyboard shortcuts for minimizing, maximizing, and closing the window
    globalShortcut.register('CommandOrControl+M', () => {   // Control+M minimizes the window
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        window.minimize();
      }
    });

    globalShortcut.register('CommandOrControl+Shift+M', () => {    //Control+Shift+M togges the window maximized and restored window states.
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        if (window.isMaximized()) {
          window.restore();
        } else {
          window.maximize();
        }
      }
    });

    globalShortcut.register('CommandOrControl+C', () => {      //Control+W closes the window.
      const window = BrowserWindow.getFocusedWindow();
      if (window) {
        window.close();
      }
    });




  } catch (error) {
    dialog.showErrorBox(
      "Unexpected Error",
      `An unexpected error occurred: ${error.message}`
    );
    app.quit();
  }
});


// Function to kill process using port 3000 if it's already in use
function killProcessOnPort(port, callback) {
  exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
    if (error || stderr) {
      console.error(`Error finding process on port ${port}: ${stderr || error.message}`);
      callback();
      return;
    }

    // Extract PID from the netstat output
    const pidMatch = stdout.match(/(\d+)\s*$/); // This matches the PID at the end of the line
    const pid = pidMatch ? pidMatch[1] : null;

    if (pid) {
      console.log(`Killing process with PID: ${pid} on port ${port}`);
      exec(`taskkill /PID ${pid} /F`, (err, stdout, stderr) => {
        if (err || stderr) {
          console.error(`Error killing process: ${stderr || err.message}`);
        } else {
          console.log(`Process with PID ${pid} terminated.`);
        }
        // Proceed to start the new server after killing the process
        callback();
      });
    } else {
      console.log(`No process found on port ${port}.`);
      callback(); // No process to kill, proceed to start the new server
    }
  });
}

// // Start the new server
// function startServer() {
//   console.log("Starting the server...");

//   // Run your existing server startup logic here
//   exec('cmd.exe /c "cd C:\\Integration\\node-addon\\build\\Release && node C:\\Integration\\index.js"', (error, stdout, stderr) => {
//     if (error) {
//       console.error('Error:', error.message);
//       return;
//     }
//     if (stderr) {
//       console.error('Error:', stderr);
//       return;
//     }
//     console.log('Server started successfully:', stdout);
//   });
// }

function startServer() {
  console.log("Starting the server...");
  
  // First try to kill any existing process on port 3000
  exec('netstat -ano | findstr :3000', (err, stdout, stderr) => {
    if (stdout) {
      const result = stdout.trim().split(/\s+/);
      const pid = result[result.length-1];
      if (pid) {
        exec(`taskkill /PID ${pid} /F`, (killErr, killStdout, killStderr) => {
          if (killErr) {
            console.log(`Could not kill process ${pid}: ${killErr.message}`);
          }
          // Proceed to start server after attempting to kill
          startNodeServer();
        });
        return;
      }
    }
    // If no process found or error, just start the server
    startNodeServer();
  });
}

function startNodeServer() {
  exec('cmd.exe /c "cd C:\\Integration\\node-addon\\build\\Release && node C:\\Integration\\index.js"', 
    (error, stdout, stderr) => {
      if (error) {
        console.error('Error starting server:', error.message);
        // Retry with different port if EADDRINUSE
        if (error.message.includes('EADDRINUSE')) {
          console.log('Trying alternative port...');
          process.env.PORT = 3001; // Or get from config
          startNodeServer();
        }
        return;
      }
      if (stderr) {
        console.error('Error:', stderr);
        return;
      }
      console.log('Server started successfully:', stdout);
    }
  );
}



// Listen for messages from the counter screen to send via WebSocket
ipcMain.on('send-websocket-message', (event, message) => {
  console.log("Received message from renderer:", message);
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message)); // Send the message to WebSocket
    console.log("Message sent to WebSocket:", message);
  } else {
    console.error("WebSocket not open, cannot send message");
  }
});

// Handle Silent Printing
ipcMain.handle("print-content", async (event, content) => {
  const printWindow = new BrowserWindow({ show: false });

  // Load Tailwind styles from app.css
  const tailwindStyles = fs.readFileSync(
    path.join(__dirname, "public/css/app.css"),
    "utf-8"
  );

  const htmlTemplate = `
    <html>
      <head>
        <style>
          ${tailwindStyles}
          body { 
            font-size: 12px;
            display: flex;
            justify-content: center;
            text-align: center;
            width: 100%;
          }
          .receipt-container {
            width: 100%;
            max-width: 72mm;
            font-family: Arial, sans-serif;
            padding: 5px;
            font-size: 10px;
          }
          .receipt-container h2 {
            font-size: 12px;
          }
          .receipt-container p {
            font-size: 10px;
          }
             .page-break {
          page-break-after: always;
        }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${content}
        </div>
      </body>
    </html>
  `;

  // Load content into the BrowserWindow
  printWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(htmlTemplate)}`
  );
  printWindow.webContents.on("did-finish-load", () => {
    printWindow.webContents.print(
      {
        silent: true,
        pageSize:
        {
          width: 72 * 1000,
          height: 297 * 1000
        },
        margins:
        {
          marginType: "none"
        },
        printBackground: true,
      },
      (success) => {
        event.sender.send("print-complete", success);
        printWindow.close();
      }
    );
  });
});

// The rest of your functions like getMachineStatus, cancelTransaction, etc. stay the same
// Sale transaction function with machine connection check
ipcMain.handle('get-mac-address', async () => {
  try {
    const interfaces = os.networkInterfaces();

    if (!interfaces) {
      console.error('No network interfaces found.');
      return 'Unavailable';
    }

    // Flatten and filter interfaces
    const activeInterfaces = Object.entries(interfaces).flatMap(([name, ifaceList]) =>
      ifaceList
        .filter((iface) => !iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00')
        .map((iface) => ({
          ...iface,
          name, // Include the name of the interface
        }))
    );

    // Return the first valid MAC address if no specific interface matches
    const connectedInterface = activeInterfaces[0];

    if (connectedInterface) {
      return connectedInterface.mac;
    } else {
      console.warn('No valid interface found.');
      return 'Unavailable';
    }
  } catch (error) {
    console.error('Error fetching MAC address:', error);
    return 'Error fetching MAC address';
  }
});



const checkMachineConnection = async (event, data) => {

  try {
    const { amount, ip } = data;
    console.log("Amount Received:", amount);
    console.log("Using IP:", ip);

    const startTime = Date.now();
    const timeout = 2 * 60 * 1000; // 2 minutes timeout
    let reconciliationAttempts = 0;

    while (Date.now() - startTime < timeout) {
      console.log(" Checking terminal status...");

      // Step 1: Check Terminal Status
      const terminalStatusResponse = await fetch("http://localhost:3000/api/terminal/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip }),
      });

      const terminalStatus = await terminalStatusResponse.json();

      // If terminal status check fails, throw error
      if (!terminalStatus.status || terminalStatus.status !== "success") {
        console.error("❌ Terminal status check failed:", terminalStatus.message);
        event.reply("machine-connection-response", {
          status: "error",
          message: terminalStatus.message || "Failed to retrieve terminal status",
          terminal_status: terminalStatus.terminal_status || "Unknown",
        });
        return;
      }

      const currentStatus = terminalStatus.terminal_status;
      console.log(`️ Terminal Status: ${currentStatus}`);

      // If terminal is ready, proceed with sale
      if (currentStatus === "Ready for new transaction") {
        console.log("✅ Terminal is Ready. Proceeding with sale...");

        const salePayload = { amount: String(amount), ip };
        console.log(" Sending JSON to Machine for Sale Transaction:", salePayload);

        const saleResponse = await fetch("http://localhost:3000/api/Payment/sale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(salePayload),
        });

        const saleResult = await saleResponse.json();

        if (saleResult.status === "success") {
          console.log("✅ Sale Transaction Successful:", saleResult);
          event.reply("machine-connection-response", saleResult);
        } else {
          console.error("❌ Sale Transaction Failed:", saleResult.message);
          event.reply("machine-connection-response", {
            status: "error",
            message: saleResult.message || "Sale transaction failed",
            terminal_status: currentStatus,
          });
        }
        return; // Exit after sale attempt
      }

      // If reconciliation is needed, handle it
      if (currentStatus === "Reconciliation needed") {
        if (reconciliationAttempts < 3) {
          console.log(` Performing Reconciliation Attempt ${reconciliationAttempts + 1}...`);

          const reconciliationResponse = await fetch("http://localhost:3000/api/terminal/forceReconciliation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip }),
          });

          const reconciliationResult = await reconciliationResponse.json();

          if (reconciliationResult.status !== "success") {
            console.error("❌ Reconciliation Failed:", reconciliationResult.message);
            reconciliationAttempts++;
            continue; // Retry reconciliation
          }

          console.log("✅ Reconciliation Successful:", reconciliationResult);

          // Break the loop and hit the Batch API
          console.log(" Initiating Batch Process after successful reconciliation...");

          const batchResponse = await fetch("http://localhost:3000/api/terminal/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip }),
          });

          const batchResult = await batchResponse.json();

          if (batchResult.status !== "success") {
            console.error("❌ Batch Process Failed:", batchResult.message);
            event.reply("machine-connection-response", {
              status: "error",
              message: batchResult.message || "Batch process failed",
              terminal_status: currentStatus,
            });
            return;
          }

          console.log("✅ Batch Process Successful:", batchResult);
          break; // Exit the loop after successful batch
        } else {
          console.error("❌ Reconciliation Failed after 3 Attempts.");
          event.reply("machine-connection-response", {
            status: "error",
            message: "Reconciliation failed after 3 attempts",
            terminal_status: currentStatus,
          });
          return;
        }
      }

      // If batch operation is required, handle it
      if (currentStatus === "Batch operation required") {
        console.log(" Initiating Batch Process...");

        const batchResponse = await fetch("http://localhost:3000/api/terminal/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip }),
        });

        const batchResult = await batchResponse.json();

        if (batchResult.status !== "success") {
          console.error("❌ Batch Process Failed:", batchResult.message);
          event.reply("machine-connection-response", {
            status: "error",
            message: batchResult.message || "Batch process failed",
            terminal_status: currentStatus,
          });
          return;
        }

        console.log("✅ Batch Process Successful:", batchResult);
        continue; // Recheck status after batch operation
      }

      // Short delay before retrying to avoid flooding the server
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // After breaking the loop (e.g., after successful batch), recheck terminal status
    console.log(" Rechecking terminal status after Reconciliation and Batch...");

    const terminalStatusResponse = await fetch("http://localhost:3000/api/terminal/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });

    const terminalStatus = await terminalStatusResponse.json();

    if (!terminalStatus.status || terminalStatus.status !== "success") {
      console.error("❌ Terminal status check failed after Reconciliation and Batch:", terminalStatus.message);
      event.reply("machine-connection-response", {
        status: "error",
        message: terminalStatus.message || "Failed to retrieve terminal status",
        terminal_status: terminalStatus.terminal_status || "Unknown",
      });
      return;
    }

    const finalStatus = terminalStatus.terminal_status;
    console.log(`️ Final Terminal Status: ${finalStatus}`);

    // If terminal is now ready, proceed with sale
    if (finalStatus === "Ready for new transaction") {
      console.log("✅ Terminal is Ready. Proceeding with sale...");

      const salePayload = { amount: String(amount), ip };
      console.log(" Sending JSON to Machine for Sale Transaction:", salePayload);

      const saleResponse = await fetch("http://localhost:3000/api/Payment/sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salePayload),
      });

      const saleResult = await saleResponse.json();

      if (saleResult.status === "success") {
        console.log("✅ Sale Transaction Successful:", saleResult);
        event.reply("machine-connection-response", saleResult);
      } else {
        console.error("❌ Sale Transaction Failed:", saleResult.message);
        event.reply("machine-connection-response", {
          status: "error",
          message: saleResult.message || "Sale transaction failed",
          terminal_status: finalStatus,
        });
      }
      return; // Exit after sale attempt
    }

    // If terminal is still not ready after Reconciliation and Batch
    console.error("⏳ Terminal Still not Ready after Reconciliation and Batch. Exiting...");
    event.reply("machine-connection-response", {
      status: "error",
      message: "Terminal not ready after Reconciliation and Batch",
      terminal_status: finalStatus,
    });

  } catch (error) {
    // Handle any unexpected errors
    console.error("❌ Error in Transaction Process:", error);
    event.reply("machine-connection-response", {
      status: "error",
      message: error.message || "Error in transaction process",
      terminal_status: "Unknown",
    });
  }
};

const handleRefundOrReversal = async (action, transactionId = null, amount = null, ipAddress = null) => {
  try {
    console.log("Input Parameters:", { action, transactionId, amount, ipAddress });

    const startTime = Date.now();
    const timeout = 2 * 60 * 1000; // 2 minutes timeout
    let reconciliationAttempts = 0;

    // If action is "forceReconciliation", handle it separately
    if (action === "forceReconciliation") {
      if (!ipAddress) {
        console.error("❌ IP Address is required for forceReconciliation.");
        return { status: "error", message: "IP Address is required for forceReconciliation" };
      }

      console.log(" Force Reconciliation Request Received. Proceeding...");

      ////////////////////////////////////////////////

      while (Date.now() - startTime < timeout) {
        console.log(" Checking Terminal Status...");

        // Step 1: Check Terminal Status
        const terminalStatusResponse = await fetch("http://localhost:3000/api/terminal/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: ipAddress }),
        });

        if (!terminalStatusResponse.ok) {
          console.error("❌ Terminal Status Request Failed:", terminalStatusResponse.statusText);
          return { status: "error", message: "Failed to get Terminal Status" };
        }

        const terminalStatus = await terminalStatusResponse.json();
        console.log("️ Terminal Status Response:", terminalStatus);

        if (terminalStatus.status !== "success") {
          console.error("❌ Failed to Retrieve Terminal status:", terminalStatus.message);
          return { status: "error", message: terminalStatus.message || "Unknown error", terminal_status: terminalStatus.terminal_status || "Unknown" };
        }

        const currentStatus = terminalStatus.terminal_status;
        console.log(`️ Current Terminal Status: ${currentStatus}`);

        // If terminal is Ready, Proceed with Refund / Reversal
        if (currentStatus === "Ready for new transaction" || currentStatus === "Reconciliation needed") { ///////////////////////////////////////////////////////////////////////////////


          const reconciliationResponse = await fetch("http://localhost:3000/api/terminal/forceReconciliation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: ipAddress }),
          });

          const reconciliationResult = await reconciliationResponse.json();
          console.log(" Reconciliation Response:", reconciliationResult);

          if (reconciliationResult.status !== "success") {
            console.error("❌ Reconciliation Failed:", reconciliationResult.message);
            return { status: "error", message: reconciliationResult.message || "Reconciliation failed" };
          }

          console.log("✅ Reconciliation Successful:", reconciliationResult);

          // After successful Reconciliation, hit the Batch API
          console.log(" Initiating Batch Process after successful reconciliation...");

          const batchResponse = await fetch("http://localhost:3000/api/terminal/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: ipAddress }),
          });

          const batchResult = await batchResponse.json();
            console.log(" Batch Process Response:", batchResult);

          if (batchResult.status !== "success") {
            console.error("❌ Batch Process Failed:", batchResult.message);
            return { status: "error", message: batchResult.message || "Batch process failed" };
          }

          console.log("✅ Batch Process Successful:", batchResult);
          return batchResult; // Return Batch API response

        }


        // If Batch Processing is Required, Execute it and Recheck status
        if (currentStatus === "Batch operation required") {
          console.log(" Initiating Batch Process...");

          const batchResponse = await fetch("http://localhost:3000/api/terminal/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: ipAddress }),
          });

          const batchResult = await batchResponse.json();
          console.log(" Batch Process Response:", batchResult);

          if (batchResult.status !== "success") {
            console.error("❌ Batch Process Failed:", batchResult.message);
            return { status: "error", message: batchResult.message || "Batch process failed", terminal_status: currentStatus };
          }

          console.log("✅ Batch Process Successful:", batchResult);
          continue;
        }

        // Short Delay Before Retrying to Avoid server Overload
        await new Promise(resolve => setTimeout(resolve, 5000));
      }



      ////////////////////////////////////////////////

    }

    // Normal flow for refund/reversal
    while (Date.now() - startTime < timeout) {
      console.log(" Checking Terminal Status...");

      // Step 1: Check Terminal Status
      const terminalStatusResponse = await fetch("http://localhost:3000/api/terminal/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ipAddress }),
      });

      if (!terminalStatusResponse.ok) {
        console.error("❌ Terminal Status Request Failed:", terminalStatusResponse.statusText);
        return { status: "error", message: "Failed to get Terminal Status" };
      }

      const terminalStatus = await terminalStatusResponse.json();
      console.log("️ Terminal Status Response:", terminalStatus);

      if (terminalStatus.status !== "success") {
        console.error("❌ Failed to Retrieve Terminal status:", terminalStatus.message);
        return { status: "error", message: terminalStatus.message || "Unknown error", terminal_status: terminalStatus.terminal_status || "Unknown" };
      }

      const currentStatus = terminalStatus.terminal_status;
      console.log(`️ Current Terminal Status: ${currentStatus}`);

      // If terminal is Ready, Proceed with Refund / Reversal
      if (currentStatus === "Ready for new transaction") {
        console.log("✅ Terminal is Ready. Proceeding with Transaction...");

        const endpoint = action === "refund" ? "refund" : "reversal";
        const payload = action === "refund"
          ? { amount: String(amount), ip: String(ipAddress) }
          : { number: String(transactionId), amount: String(amount), ip: String(ipAddress) };

        console.log(` Sending ${action} Request:`, payload);

        const response = await fetch(`http://localhost:3000/api/Payment/${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          console.error(`❌ ${action} Request Failed:`, response.statusText);
          return { status: "error", message: `Failed to process ${action}` };
        }

        const result = await response.json();
        console.log(`✅ ${action} Response:`, result);
        return result;
      }

      // If Reconciliation is Required, Execute it and Recheck status
      if (currentStatus === "Reconciliation needed") {
        if (reconciliationAttempts < 3) {
          console.log(` Performing Reconciliation Attempt ${reconciliationAttempts + 1}...`);

          const reconciliationResponse = await fetch("http://localhost:3000/api/terminal/forceReconciliation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: ipAddress }),
          });

          const reconciliationResult = await reconciliationResponse.json();
          console.log(" Reconciliation Response:", reconciliationResult);

          if (reconciliationResult.status !== "success") {
            console.error("❌ Reconciliation Failed:", reconciliationResult.message);
            reconciliationAttempts++;
            continue; // Retry reconciliation
          }

          console.log("✅ Reconciliation Successful:", reconciliationResult);

          // If Reconciliation is successful, hit the Batch API
          console.log(" Initiating Batch Process after successful reconciliation...");

          const batchResponse = await fetch("http://localhost:3000/api/terminal/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ip: ipAddress }),
          });

          const batchResult = await batchResponse.json();
          console.log(" Batch Process Response:", batchResult);

          if (batchResult.status !== "success") {
            console.error("❌ Batch Process Failed:", batchResult.message);
            return { status: "error", message: batchResult.message || "Batch process failed", terminal_status: currentStatus };
          }

          console.log("✅ Batch Process Successful:", batchResult);
          continue; // Recheck terminal status after batch
        } else {
          console.error("❌ Reconciliation Failed after 3 Attempts.");
          return { status: "error", message: "Reconciliation failed after 3 attempts", terminal_status: currentStatus };
        }
      }

      // If Batch Processing is Required, Execute it and Recheck status
      if (currentStatus === "Batch operation required") {
        console.log(" Initiating Batch Process...");

        const batchResponse = await fetch("http://localhost:3000/api/terminal/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: ipAddress }),
        });

        const batchResult = await batchResponse.json();
        console.log(" Batch Process Response:", batchResult);

        if (batchResult.status !== "success") {
          console.error("❌ Batch Process Failed:", batchResult.message);
          return { status: "error", message: batchResult.message || "Batch process failed", terminal_status: currentStatus };
        }

        console.log("✅ Batch Process Successful:", batchResult);
        continue; // Recheck terminal status after batch
      }

      // Short Delay Before Retrying to Avoid server Overload
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.error("⏳ Terminal still not Ready after Multiple Attempts. Exiting...");
    return { status: "error", message: "Terminal not ready after multiple attempts", terminal_status: "Timeout" };

  } catch (error) {
    console.error(`❌ Error During ${action} Process:`, error);
    return { status: "error", message: error.message || `Error during ${action} Process`, terminal_status: "Unknown" };
  }
};


// Refund Handler
ipcMain.handle("process-refund", async (event, { amount, ipAddress }) => {
  const response = await handleRefundOrReversal("refund", null, amount, ipAddress);
  event.sender.send("transaction-response", response);
  return response;
});

// Reverse Handler
ipcMain.handle("process-reversal", async (event, { transactionId, amount, ipAddress }) => {
  const response = await handleRefundOrReversal("reversal", transactionId, amount, ipAddress);
  event.sender.send("transaction-response", response);
  return response;
});

// Reconciliation Handler
ipcMain.handle("process-reconciliation", async (event, { ipAddress }) => {
  const response = await handleRefundOrReversal("forceReconciliation", null, null, ipAddress);
  event.sender.send("transaction-response", response);
  return response;
});

// Define IPC handlers
ipcMain.handle("get-machine-status", async () => {
  return await getMachineStatus();
});

ipcMain.handle("cancel-transaction", async () => {
  return await cancelTransaction();
});

ipcMain.on("check-machine-connection", (event, amount) => {
  checkMachineConnection(event, amount);
});

// Closing and activating the app as needed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
