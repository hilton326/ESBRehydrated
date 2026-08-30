'use client';
import { useEffect, useState } from 'react';

// Get the WIDTH of the browser window and update a state whenever it resizes
// Useful for fitting to mobile devices
export function useWindowWidth() {
    const [pageWidth, setPageWidth] = useState(() =>
        // Make sure the window exists before continuing
        typeof window !== 'undefined' ? document.documentElement.clientWidth : 0
    );

    useEffect(() => {
        const onResize = () => {
            setPageWidth(document.documentElement.clientWidth);
        };

        // Listen for resize events (for dynamic resizing)
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [setPageWidth]);

  return pageWidth;
}

// Get the HEIGHT of the browser window and update a state whenever it resizes
export function useWindowHeight() {
    const [pageHeight, setPageHeight] = useState(() =>
        // Make sure the window exists before continuing
        typeof window !== 'undefined' ? document.documentElement.clientHeight : 0
    );

    useEffect(() => {
        const onResize = () => {
            setPageHeight(document.documentElement.clientHeight);
        };

        // Listen for resize events (for dynamic resizing)
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [setPageHeight]);

  return pageHeight;
}