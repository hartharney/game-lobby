import { useEffect } from "react";

export const useInactivityLogout = (timeoutMinutes = 15) => {
  useEffect(() => {
    let inactivityTimeout: ReturnType<typeof setTimeout>;

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        localStorage.removeItem("token");
        localStorage.setItem("logout", Date.now().toString());
        window.location.href = "/";
      }, timeoutMinutes * 60 * 1000);
    };

    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer)
    );

    resetInactivityTimer();

    const onStorage = (event: StorageEvent) => {
      if (event.key === "logout") {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer)
      );
      window.removeEventListener("storage", onStorage);
      clearTimeout(inactivityTimeout);
    };
  }, [timeoutMinutes]);
};
