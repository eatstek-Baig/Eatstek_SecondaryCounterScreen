import React from 'react';
import { Modal } from "flowbite-react";

const DealsPopup = ({ open, onClose, items, title, getDealData }) => {
    if (!open) return null;

    return (
        <Modal
            show={open}
            position="center"
            onClose={onClose}
            size="md"
            dismissible
        >
            <Modal.Header className="font-bold">{title}</Modal.Header>
            <Modal.Body>
                {items.map((item, index) => (
                    <div key={index} onClick={() => getDealData({
                        product_name: item?.sku_product_name,
                        pid: item?.id,
                        category_id: item?.deal_line_id,
                        sku_id: item.sku_id,
                        sku_options: item?.sku_options
                    })} className="flex g-[10px] border border-gray-200 rounded-md p-2 mb-3 me-3 hover:bg-gray-200 transition-all cursor-pointer">
                        <div className="ms-3">
                            <h6 className="text-lg font-normal text-gray-900">{item.sku_product_name}</h6>
                        </div>
                    </div>
                ))}
            </Modal.Body>
        </Modal>
    );
};

export default DealsPopup;
