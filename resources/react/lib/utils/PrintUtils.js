export const handleSilentPrint = (printContainerRef) => {
    if (window.printElectronAPI) {
        if (printContainerRef.current) {
            const printContent = printContainerRef.current.innerHTML;
            if (printContent) {
                console.log("Triggering silent Print...");

                window.printElectronAPI.printContent(printContent);

                window.printElectronAPI.onPrintComplete((success) => {
                    if (success) {
                        console.log("Print Completed successfully!");
                    } else {
                        console.error("Print Failed.");
                    }
                });
            } else {
                console.error("No Content to Print.");
            }
        } else {
            console.error("Print Container not Ready.");
        }
    } else {
        console.error("Print API not Available.");
    }
};