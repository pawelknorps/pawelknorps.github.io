import { writable } from 'svelte/store';

export const backgroundBrightness = writable(0.5);
export const adaptiveTextClass = writable('text-white');
export const adaptiveSubTextClass = writable('text-gray-300');