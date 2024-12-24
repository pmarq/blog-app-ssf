"use client";
import { FC, ReactNode, useCallback, useEffect } from "react";

export interface ModalProps {
  visible?: boolean;
  onClose?(): void;
}

interface Props extends ModalProps {
  children: ReactNode;
}

const ModalContainer: FC<Props> = ({
  visible,
  children,
  onClose,
}): JSX.Element | null => {
  const containerId = "modal-overlay"; // ID constante

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if ((event.target as HTMLElement).id === containerId) {
      handleClose();
    }
  };

  useEffect(() => {
    const closeModal = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    document.addEventListener("keydown", closeModal);
    return () => {
      document.removeEventListener("keydown", closeModal);
    };
  }, [handleClose]);

  if (!visible) return null;

  return (
    <div
      id={containerId}
      onClick={handleClick}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      {children}
    </div>
  );
};

export default ModalContainer;
