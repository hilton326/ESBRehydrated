'use client';
import { useEffect, useState } from 'react';

// Get the WIDTH of the browser window and update a state whenever it resizes
// Useful for fitting to mobile devices
export function useWindowWidth() {
    const [pageWidth, setPageWidth] = useState(() =>
        typeof window !== 'undefined' ? document.documentElement.clientWidth : 0
    );

    useEffect(() => {
        const onResize = () => {
            setPageWidth(document.documentElement.clientWidth);
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [setPageWidth]);

  return pageWidth;
}

// Get the HEIGHT of the browser window and update a state whenever it resizes
export function useWindowHeight() {
    const [pageHeight, setPageHeight] = useState(() =>
        typeof window !== 'undefined' ? document.documentElement.clientHeight : 0
    );

    useEffect(() => {
        const onResize = () => {
            setPageHeight(document.documentElement.clientHeight);
        };

        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [setPageHeight]);

  return pageHeight;
}