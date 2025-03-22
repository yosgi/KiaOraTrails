"use client";
import React, { ReactNode } from "react";
interface ClientWrapperProps {
    children: ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
    return (
       
        <div>
            {children}
        </div>
        
    );
};
export default ClientWrapper;