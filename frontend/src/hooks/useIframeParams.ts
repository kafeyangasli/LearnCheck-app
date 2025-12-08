import { useState, useEffect } from "react";
import { getIframeParams } from "../utils/iframeParams";
import type { IframeParams } from "../types";

export const useIframeParams = () => {
    const [params, setParams] = useState<IframeParams | null>(getIframeParams());
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleUrlChange = () => {
            const newParams = getIframeParams();
            setParams(newParams);

            if (!newParams) {
                setError("Missing required parameters: tutorial_id and user_id");
            } else {
                setError(null);
            }
        };

        // Check on mount
        handleUrlChange();

        // Listen for URL changes
        window.addEventListener("popstate", handleUrlChange);
        window.addEventListener("hashchange", handleUrlChange);

        return () => {
            window.removeEventListener("popstate", handleUrlChange);
            window.removeEventListener("hashchange", handleUrlChange);
        };
    }, []);

    return { params, error };
};
