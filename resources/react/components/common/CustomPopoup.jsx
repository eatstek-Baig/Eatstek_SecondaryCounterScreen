import React from "react";
import { Modal } from "flowbite-react";

const CustomPopoup = ({
  open,
  onClose,
  items,
  title,
  size = "6xl",
  dismissible = true,
  bodyClass,
}) => {
  if (!open) return null;

  return (
    <Modal
      show={open}
      position="center"
      onClose={onClose}
      size={size}
      dismissible={dismissible}
    >
      {title && <Modal.Header>{title}</Modal.Header>}
      <Modal.Body className={bodyClass}>{items}</Modal.Body>
    </Modal>
  );
};

export default CustomPopoup;
