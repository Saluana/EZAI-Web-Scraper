export interface ErrorMessage {
    status: string;
    message: string;
    url?: string;
}

export interface SuccessMessage {
    status: string;
    notes?: string[];
    title?: string;
    url?: string;
    text?: string[];
    summary?: string;
}
