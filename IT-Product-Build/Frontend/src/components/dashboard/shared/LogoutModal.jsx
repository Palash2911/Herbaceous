import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/dashboard/shared/Modal";
import { DashboardButton } from "@/components/dashboard/shared/primitives";
import { signOut } from "@/services/cognitoAuth";

export function LogoutModal({ open, onClose }) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    signOut();
    navigate("/");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Log out?"
      consequence="Are you sure you want to log out?"
      footer={
        <>
          <DashboardButton variant="outline" onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton variant="danger" onClick={handleConfirm}>
            Log out
          </DashboardButton>
        </>
      }
    />
  );
}
