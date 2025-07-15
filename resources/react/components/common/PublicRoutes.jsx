import React, { lazy, Suspense, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Preloader from "./Preloader";
import TabsLayout from "./TabsLayout";
import { useSGlobalContext } from "../../lib/contexts/useGlobalContext";
import { productApi } from "../../lib/services";

const LoginPage = lazy(() => import("../client/Login"));
const MenuPage = lazy(() => import("../../pages/client/Products"));
const NotFoundPage = lazy(() => import("../../pages/common/NotFoundPage"));


// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const employeeId = localStorage.getItem("EmployeId");
    const token = localStorage.getItem("Token");

    return employeeId && token ? children : <Navigate to="/login" replace />;
};

const PublicRoutes = () => {
    const { getAllDataFunction } = useSGlobalContext();

    useEffect(() => {
        getProducts();

        // Prevent Copy
        const disableCopy = (e) => e.preventDefault();
        const disableSelect = (e) => e.preventDefault();

        // Add listeners to prevent copy and selection
        document.addEventListener("copy", disableCopy);
        document.addEventListener("selectstart", disableSelect);

        // Cleanup on Component unmount
        return () => {
            document.removeEventListener("copy", disableCopy);
            document.removeEventListener("selectstart", disableSelect);
        };
    }, []);

    const getProducts = async () => {
        try {
            const { data } = await productApi.allCatelogs();
            getAllDataFunction(data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <Router>
            <Suspense fallback={<Preloader />}>
                <Routes>
                    {/* Redirect the root route to /counter-screen */}
                    <Route path="/" element={<Navigate to="/counter-screen" replace />} />

                    {/* Protected Routes */}
                    <Route element={
                        <ProtectedRoute>
                            <TabsLayout />
                        </ProtectedRoute>}
                    >
                        <Route path="/counter-screen" element={<MenuPage />} />
                    </Route>

                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />

                    {/* Fallback Route */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default PublicRoutes;
