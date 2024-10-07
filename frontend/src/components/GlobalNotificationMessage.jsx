import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";

// Component: GlobalNotificationMessage
// used to display global notifications
const GlobalNotificationMessage = ({ message, isDarkMode }) => {
    if (message !== null) {
        return (
            <div
                className={` text-base text-text animate-globalNotification overflow-hidden rounded-xl`}
            >
                <div className="animate-globalNotificationFade">
                    <div
                        className={`fixed top-0 w-full bg-accent h-full text-transparent -z-20 ${
                            isDarkMode ? "brightness-75" : "brightness-90"
                        }`}
                    >
                        .
                    </div>
                    <div className="flex gap-2 items-center py-2 px-3">
                        <FontAwesomeIcon icon={faCircleCheck} />
                        <div className="">{message}</div>
                    </div>
                    <div className="fixed top-0 w-full bg-accent h-full text-transparent animate-globalNotificationTimer -z-10">
                        .
                    </div>
                </div>
            </div>
        );
    }
};

export default GlobalNotificationMessage;
