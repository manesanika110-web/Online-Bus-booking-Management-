import Swal from "sweetalert2";

export const successAlert = (message, title = "BusVista") => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "success",
    iconColor: "#10b981",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      popup: "busvista-swal-popup",
      title: "busvista-swal-title",
      htmlContainer: "busvista-swal-text",
      confirmButton: "busvista-swal-confirm-btn",
    },
  });
};

export const errorAlert = (message, title = "BusVista") => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "error",
    iconColor: "#ef4444",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      popup: "busvista-swal-popup",
      title: "busvista-swal-title",
      htmlContainer: "busvista-swal-text",
      confirmButton: "busvista-swal-confirm-btn",
    },
  });
};

export const warningAlert = (message, title = "BusVista") => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "warning",
    iconColor: "#f59e0b",
    confirmButtonText: "OK",
    buttonsStyling: false,
    customClass: {
      popup: "busvista-swal-popup",
      title: "busvista-swal-title",
      htmlContainer: "busvista-swal-text",
      confirmButton: "busvista-swal-confirm-btn",
    },
  });
};

export const confirmAlert = ({ title = "Are you sure?", text = "", confirmText = "Yes, Proceed", cancelText = "Cancel" }) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    iconColor: "#ef4444",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    buttonsStyling: false,
    customClass: {
      popup: "busvista-swal-popup",
      title: "busvista-swal-title",
      htmlContainer: "busvista-swal-text",
      confirmButton: "busvista-swal-confirm-btn",
      cancelButton: "busvista-swal-cancel-btn",
    },
  });
};
